import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Loader2, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type PricingItem = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export default function Pricing() {
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Pricing - Lens Illumination";
  }, []);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const pricingDoc = await getDoc(doc(db, "settings", "pricing"));
        if (pricingDoc.exists()) {
          const data = pricingDoc.data();
          if (data.items && Array.isArray(data.items)) {
            setPricingItems(data.items);
          }
        }
      } catch (err) {
        console.error("Failed to load pricing", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold">Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional photography packages tailored to your needs
          </p>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate("/admin");
                setTimeout(() => {
                  const pricingSection = document.querySelector('[data-pricing-management]');
                  if (pricingSection) {
                    const offset = pricingSection.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                  }
                }, 300);
              }}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage Pricing
            </Button>
          )}
        </div>

        {pricingItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No pricing packages available yet.</p>
            <Button onClick={() => navigate("/contact")}>Contact Me</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingItems.map((item) => (
              <Card key={item.id} className="flex flex-col hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="text-2xl">{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-6 flex-1">
                    <div className="text-4xl font-bold text-primary mb-1">
                      ${item.price}
                    </div>
                    <p className="text-sm text-muted-foreground">Starting price</p>
                  </div>
                  <Button size="lg" className="w-full" onClick={() => navigate("/contact")}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
