import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, Settings } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

type PublicAlbum = {
  id: string;
  name: string;
  imagesCount: number;
  createdAt?: any;
};

type PricingItem = {
  id: string;
  name: string;
  description: string;
  price: number;
};

function Home() {
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [albums, setAlbums] = useState<PublicAlbum[]>([]);
  const [heroTitle, setHeroTitle] = useState("My photography, beautifully presented.");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Welcome to my photography portfolio. Explore my latest work, browse albums, and get in touch to discuss your project."
  );
  const [heroImage, setHeroImage] = useState("https://picsum.photos/seed/hero/1920/1080");
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [aboutTitle, setAboutTitle] = useState("About Us");
  const [aboutContent, setAboutContent] = useState(
    "Welcome to our photography studio. We specialize in capturing life's most precious moments with creativity and passion."
  );
  const albumsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPublicAlbums = async () => {
      try {
        const q = query(collection(db, "albums"), where("isPublic", "==", true));
        const snap = await getDocs(q);
        const list: PublicAlbum[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            name: data.name,
            imagesCount: (data.images || []).length,
            createdAt: data.createdAt,
          });
        });
        const norm = (d: any) => (d?.toMillis ? d.toMillis() : d?.seconds ? d.seconds * 1000 : d || 0);
        list.sort((a, b) => norm(b.createdAt) - norm(a.createdAt));
        setAlbums(list);
      } catch (err) {
        console.error("Failed to load public albums", err);
      } finally {
        setLoadingAlbums(false);
      }
    };
    fetchPublicAlbums();
  }, []);

  useEffect(() => {
    const fetchHomeSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "home"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          if (data.heroTitle) setHeroTitle(data.heroTitle);
          if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle);
          if (data.heroImage?.url) setHeroImage(data.heroImage.url);
          else if (data.heroImageUrl) setHeroImage(data.heroImageUrl);
        }
      } catch (err) {
        console.error("Failed to load home settings", err);
      }
    };
    fetchHomeSettings();
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
      }
    };
    fetchPricing();
  }, []);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const aboutDoc = await getDoc(doc(db, "settings", "about"));
        if (aboutDoc.exists()) {
          const data = aboutDoc.data();
          if (data.title) setAboutTitle(data.title);
          if (data.content) setAboutContent(data.content);
        }
      } catch (err) {
        console.error("Failed to load about data", err);
      }
    };
    fetchAboutData();
  }, []);

  const heroCta = useMemo(() => {
    const scrollToAlbums = () => {
      albumsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const scrollToPricing = () => {
      pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
      <div className="flex justify-center gap-2 flex-wrap">
        <Button
          size="lg"
          variant="secondary"
          onClick={scrollToAlbums}
        >
          View Albums
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        {pricingItems.length > 0 && (
          <Button
            size="lg"
            variant="secondary"
            onClick={scrollToPricing}
          >
            View Pricing
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        <Button
          size="lg"
          variant="secondary"
          onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          About Us
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate("/contact")}
        >
          Contact Me
        </Button>
      </div>
    );
  }, [navigate, pricingItems.length]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Image Section */}
      <div className="mx-auto max-w-7xl px-4 mb-4">
        <div className="relative w-full h-[calc(100vh-120px)] rounded-xl overflow-hidden shadow-2xl">
          <img
            src={heroImage}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          
          {/* Edit Button (Admin Only) */}
          {user && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate("/admin");
                setTimeout(() => {
                  const headerSection = document.getElementById('homepage-header');
                  if (headerSection) {
                    const offset = headerSection.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                  }
                }, 500);
              }}
              className="absolute top-4 right-4 gap-2 bg-white hover:bg-white/90 text-black shadow-lg z-10"
            >
              <Settings className="h-4 w-4" />
              Edit Header
            </Button>
          )}
          
          {/* Overlay with Hero Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
            <div className="text-center mb-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                {heroTitle}
              </h1>
              <p className="mt-3 text-white/90 text-lg drop-shadow">
                {heroSubtitle}
              </p>
            </div>
            
            {heroCta}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" ref={aboutRef}>
        <section className="space-y-8">
          <div className="text-center space-y-4 flex flex-col items-center">
            <h2 className="text-3xl font-bold">{aboutTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed whitespace-pre-wrap">
              {aboutContent}
            </p>
            <div className="flex gap-3 flex-wrap justify-center pt-2">
              <Button
                size="lg"
                asChild
                className="gap-2"
              >
                <a href="/contact">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              {user && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    navigate("/admin");
                    setTimeout(() => {
                      const aboutSection = document.getElementById('about-section');
                      if (aboutSection) {
                        const offset = aboutSection.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top: offset, behavior: 'smooth' });
                      }
                    }, 300);
                  }}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Edit About
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Featured Albums Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" ref={albumsRef}>
        {/* Public Albums */}
        <section className="space-y-8">
          <div className="text-center space-y-4 flex flex-col items-center">
            <h2 className="text-3xl font-bold">Latest Albums</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Check out my latest photography albums and projects.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/albums")}
                className="gap-2"
              >
                View All Albums
                <ArrowRight className="h-4 w-4" />
              </Button>
              {user && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    navigate("/admin");
                    setTimeout(() => {
                      const target = document.getElementById("albums-management") || document.querySelector('[data-albums-management]');
                      if (target) {
                        const offset = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top: offset, behavior: "smooth" });
                      }
                    }, 300);
                  }}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Albums
                </Button>
              )}
            </div>
          </div>

          {loadingAlbums ? (
            <div className="text-center py-10 text-muted-foreground">Loading public albums…</div>
          ) : albums.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No public albums yet. Check back soon!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.slice(0, 3).map((album) => (
                <Card
                  key={album.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                  onClick={() => navigate(`/album/${album.id}`)}
                >
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <p className="font-semibold truncate">{album.name}</p>
                      <p className="text-sm text-muted-foreground">{album.imagesCount} image(s)</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/album/${album.id}`);
                    }} className="w-full mt-auto">
                      View Album
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Pricing Section */}
        {pricingItems.length > 0 && (
          <section className="space-y-8 mt-16" ref={pricingRef}>
            <div className="text-center space-y-4 flex flex-col items-center">
              <h2 className="text-3xl font-bold">Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional photography packages tailored to your needs
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/pricing")}
                  className="gap-2"
                >
                  View All Packages
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    size="lg"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingItems.slice(0, 3).map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-semibold mb-2">{item.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                    <div className="mt-auto">
                      <div className="text-4xl font-bold text-primary mb-1">
                        ${item.price}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Starting price</p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => navigate("/contact")}
                      >
                        Get Started
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Home;