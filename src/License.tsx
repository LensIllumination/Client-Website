import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function License() {
  useEffect(() => {
    document.title = "Copyright - Lens Illumination";
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-background px-4 py-12 pt-24">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">Copyright</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This website and its contents are protected by copyright. All rights reserved.
          </p>

          <div className="pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Questions about copyright? Contact:</p>
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <a href="mailto:jacobalexanderorr@gmail.com">Email me</a>
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Copyright Notice</CardTitle>
            <CardDescription>
              Copyright and usage terms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p>
                © {currentYear} Lens Illumination. All rights reserved.
              </p>
              <p>
                The content, design, images, and code of this website are protected by copyright law. 
                Unauthorized use, reproduction, or distribution of any materials from this site without 
                express written permission is strictly prohibited.
              </p>
              <p>
                All photographs displayed on this website are the property of their respective photographer 
                and are protected by copyright. Any unauthorized use of these images is prohibited.
              </p>
              <p>
                For licensing inquiries or permissions, please contact us at the email address provided above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
