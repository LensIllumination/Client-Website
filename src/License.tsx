import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import licenseText from "./assets/license.txt?raw";

export default function License() {
  useEffect(() => {
    document.title = "License - Lens Illumination";
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-12 pt-24">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">License</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The code in this project is released under the GNU General Public License v3.0. The license terms are included below for your reference.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Button asChild variant="secondary">
              <a href="https://www.gnu.org/licenses/copyleft.html" target="_blank" rel="noopener noreferrer">
                Learn about Copyleft
              </a>
            </Button>
            <Button asChild>
              <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank" rel="noopener noreferrer">
                GPL v3 Overview
              </a>
            </Button>
          </div>

          <div className="pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Questions about the code or license? Contact the code owner (not the photographer):</p>
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <a href="mailto:jacobalexanderorr@gmail.com">Email me</a>
              </Button>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">See the full source code on GitHub:</p>
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <a href="https://github.com/LensIllumination/Client-Website" target="_blank" rel="noopener noreferrer">
                  View repository on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>GNU GPL v3.0</CardTitle>
            <CardDescription>
              Full license text. Scroll to read all terms and conditions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg bg-card/60 shadow-sm">
              <div className="max-h-[70vh] overflow-auto p-4 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {licenseText}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
