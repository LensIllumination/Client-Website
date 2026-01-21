import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Mail, MapPin, Phone, Settings, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

type ContactInfo = {
  email: string;
  phone: string;
  location: string;
  instagram: string;
};

export default function Contact() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "contect@lensillumination.ca",
    phone: "+1 (555) 123-4567",
    location: "Toronto, ON, CA",
    instagram: "@lensillumination",
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const contactDoc = await getDoc(doc(db, "settings", "contact"));
        if (contactDoc.exists()) {
          const data = contactDoc.data();
          setContactInfo({
            email: data.email || "contect@lensillumination.ca",
            phone: data.phone || "+1 (555) 123-4567",
            location: data.location || "Toronto, ON, CA",
            instagram: data.instagram || "@lensillumination",
          });
        }
      } catch (error) {
        console.error("Failed to load contact info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground">
            Have questions? Reach out directly through the options below and I'll get back to you as soon as possible.
          </p>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate("/admin");
                setTimeout(() => {
                  const contactSection = document.getElementById('contact-info');
                  if (contactSection) {
                    const offset = contactSection.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                  }
                }, 500);
              }}
              className="gap-2 mt-4"
            >
              <Settings className="h-4 w-4" />
              Edit Contact Info
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Contact Info Cards */}
          <Card className="h-full">
            <CardContent className="h-full flex flex-col items-center justify-center gap-3 text-center py-6">
              <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground text-sm">{contactInfo.email}</p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <a href={`mailto:${contactInfo.email}`}>Email me</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="h-full flex flex-col items-center justify-center gap-3 text-center py-6">
              <Phone className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-muted-foreground text-sm">{contactInfo.phone}</p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <a href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}>Call</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="h-full flex flex-col items-center justify-center gap-3 text-center py-6">
              <MapPin className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Location</h3>
              <p className="text-muted-foreground text-sm">{contactInfo.location}</p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.location)}`}
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
              <p className="text-muted-foreground text-sm">{contactInfo.instagram}</p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <a href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">Follow</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
