import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 - Page Not Found | Lens Illumination";
  }, []);

  return (
    <div className="h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          {/* 404 Number */}
          <div className="flex justify-center">
            <span className="text-9xl font-bold text-muted-foreground/60">404</span>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The page, album, or folder you're looking for doesn't exist or may have been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Looking for something specific?{" "}
              <button
                onClick={() => navigate("/albums")}
                className="text-primary hover:underline font-medium"
              >
                Browse all albums
              </button>
              {" "}or{" "}
              <button
                onClick={() => navigate("/contact")}
                className="text-primary hover:underline font-medium"
              >
                contact us
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
