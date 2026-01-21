import { AwsClient } from 'aws4fetch';

/**
 * Verifies the Firebase JWT token to ensure the request is authorized.
 */
async function verifyFirebaseToken(token, projectId) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) { base64 += '='; }
    
    const payload = JSON.parse(atob(base64));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) return false;
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) return false;
    if (payload.aud !== projectId) return false;
    
    return true;
  } catch (e) {
    console.error("JWT Verification Error:", e);
    return false;
  }
}

export default {
  async fetch(request, env) {
    // 1. Define CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // You can change this to your Vercel URL later
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // 2. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 3. Security Check for Writes/Deletes
    if (request.method === "PUT" || request.method === "DELETE") {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }

      const token = authHeader.split(" ")[1];
      const isValid = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID);
      
      if (!isValid) {
        return new Response("Forbidden", { status: 403, headers: corsHeaders });
      }
    }

    // 4. Initialize B2 Client
    const b2 = new AwsClient({
      accessKeyId: env.B2_KEY_ID.trim(),
      secretAccessKey: env.B2_APPLICATION_KEY.trim(),
      service: "s3",
      region: (env.B2_ENDPOINT.split(".")[1] || "us-west-004").trim(),
    });

    const url = new URL(request.url);
    const cleanPath = url.pathname.replace(/\/+/g, "/");
    const b2Url = `https://${env.B2_ENDPOINT}/${env.BUCKET_NAME}${cleanPath}`;

    try {
      // 5. Fetch from Backblaze B2
      const b2Response = await b2.fetch(b2Url, {
        method: request.method,
        body: request.body,
        headers: { 
          "Content-Type": request.headers.get("Content-Type") || "application/octet-stream" 
        },
      });

      // 6. Check for B2 quota/limit errors
      if (!b2Response.ok) {
        const contentType = b2Response.headers.get("content-type");
        let errorBody = "";
        
        try {
          if (contentType && contentType.includes("application/json")) {
            const errorJson = await b2Response.json();
            errorBody = errorJson.message || JSON.stringify(errorJson);
          } else if (contentType && contentType.includes("application/xml")) {
            errorBody = await b2Response.text();
          } else {
            errorBody = await b2Response.text();
          }
        } catch (e) {
          errorBody = b2Response.statusText;
        }

        // Check for quota/limit errors in response
        const isQuotaError = (
          b2Response.status === 403 && (
            errorBody.toLowerCase().includes("quota") ||
            errorBody.toLowerCase().includes("limit") ||
            errorBody.toLowerCase().includes("bandwidth") ||
            errorBody.toLowerCase().includes("account_cap_exceeded") ||
            errorBody.toLowerCase().includes("service_unavailable")
          )
        );

        // Return error response with CORS headers
        const errorResponse = new Response(errorBody || b2Response.statusText, {
          status: b2Response.status,
          headers: corsHeaders,
        });

        return errorResponse;
      }

      // 7. Create new Response headers
      const responseHeaders = new Headers(b2Response.headers);
      
      // Apply CORS headers
      Object.keys(corsHeaders).forEach((k) => responseHeaders.set(k, corsHeaders[k]));

      // 8. Apply Caching Strategy for GET requests
      // This is what prevents the 'Bandwidth Exceeded' error
      if (request.method === "GET" && b2Response.status >= 200 && b2Response.status < 300) {
        // public: cacheable by CDN and Browser
        // max-age: browser cache (7 days)
        // s-maxage: Cloudflare CDN cache (7 days)
        responseHeaders.set("Cache-Control", "public, max-age=604800, s-maxage=604800");
      }

      // Create response with modified headers
      const response = new Response(b2Response.body, {
        status: b2Response.status,
        statusText: b2Response.statusText,
        headers: responseHeaders
      });

      return response;

    } catch (err) {
      // Handle network/parsing errors
      const errorMessage = err.message || "Unknown error";
      console.error("Worker fetch error:", errorMessage, err);
      
      return new Response(JSON.stringify({
        error: "Worker Error",
        message: errorMessage,
      }), { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }
  }
};