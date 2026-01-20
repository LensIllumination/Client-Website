import { Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-lg">Lens Illumination</h3>
            <p className="text-sm text-muted-foreground">
              A photography portfolio showcasing my work and creative projects.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">Navigation</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/albums" className="text-muted-foreground hover:text-foreground transition-colors">
                Albums
              </a>
              <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">Connect</h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground hover:text-foreground w-fit"
                asChild
              >
                <a href="mailto:contact@lensillumination.com" className="gap-2 flex">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground hover:text-foreground w-fit"
                asChild
              >
                <a href="https://github.com/LensIllumination/Client-Website" target="_blank" rel="noopener noreferrer" className="gap-2 flex">
                  <Github className="h-4 w-4" />
                  <span>Repository</span>
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          {/* Footer Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              &copy; 2026 Lens Illumination. All rights reserved.
            </p>
            <p>
              Made by{" "}
              <a
                href="https://github.com/Jquob"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline"
              >
                Jacob Orr
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
