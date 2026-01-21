import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground">
            Have questions? Reach out directly through the options below and I'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Contact Info Cards */}
          <Card className="h-full">
            <CardContent className="h-full flex flex-col items-center justify-center gap-3 text-center py-6">
              <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground text-sm">contect@lensillumination.ca</p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <a href="mailto:contect@lensillumination.ca">Email me</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="h-full flex flex-col items-center justify-center gap-3 text-center py-6">
              <Phone className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <a href="tel:+15551234567">Call</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="h-full flex flex-col items-center justify-center gap-3 text-center py-6">
              <MapPin className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Location</h3>
              <p className="text-muted-foreground text-sm">Toronto, ON, CA</p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Toronto%2C%20ON%2C%20Canada"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Maps
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="h-full flex flex-col items-center justify-center gap-3 text-center py-6">
              <Instagram className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Instagram</h3>
              <p className="text-muted-foreground text-sm">@lensillumination</p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <a href="https://instagram.com/lensillumination" target="_blank" rel="noreferrer">Follow</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
