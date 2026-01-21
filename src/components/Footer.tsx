import { Github, Mail, Home, Image as ImageIcon, Phone, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Footer() {
  const [contactInfo, setContactInfo] = useState({ email: "contect@lensillumination.ca", instagram: "@lensillumination" });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const contactDoc = await getDoc(doc(db, "settings", "contact"));
        if (contactDoc.exists()) {
          const data = contactDoc.data();
          setContactInfo({
            email: data.email || "contect@lensillumination.ca",
            instagram: data.instagram || "@lensillumination",
          });
        }
      } catch (error) {
        console.error("Failed to load contact info in footer", error);
      }
    };
    fetchContactInfo();
  }, []);

  const CopyleftIcon = () => (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M10 8v8M10 16h4" />
    </svg>
  );

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
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground hover:text-foreground w-fit"
                asChild
              >
                <a href="/" className="gap-2 flex">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground hover:text-foreground w-fit"
                asChild
              >
                <a href="/albums" className="gap-2 flex">
                  <ImageIcon className="h-4 w-4" />
                  <span>Albums</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground hover:text-foreground w-fit"
                asChild
              >
                <a href="/contact" className="gap-2 flex">
                  <Phone className="h-4 w-4" />
                  <span>Contact</span>
                </a>
              </Button>
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
                <a href={`mailto:${contactInfo.email}`} className="gap-2 flex">
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
                <a href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="gap-2 flex">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
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
            <p className="flex items-center gap-1">
              <CopyleftIcon />
              <span>Copyleft 2026 Lens Illumination. Licensed under GPL-3.0-only.</span>
              <a
                href="/LICENSE.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline ml-1 flex items-center gap-1"
              >
                View license
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span>Made by</span>
              <a
                href="https://github.com/Jquob"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline flex items-center gap-1"
              >
                <Github className="h-4 w-4" />
                Jacob Orr
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
