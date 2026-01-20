import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/firebase";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";

type PublicAlbum = {
  id: string;
  name: string;
  imagesCount: number;
  createdAt?: any;
};

function Home() {
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [albums, setAlbums] = useState<PublicAlbum[]>([]);
  const albumsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const heroCta = useMemo(() => {
    const scrollToAlbums = () => {
      albumsRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate("/contact")}
        >
          Contact Me
        </Button>
      </div>
    );
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Image Section */}
      <div className="mx-auto max-w-7xl px-4 mb-4">
        <div className="relative w-full h-[calc(100vh-120px)] rounded-xl overflow-hidden shadow-2xl">
          <img
            src="https://picsum.photos/seed/hero/1920/1080"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay with Hero Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
            <div className="text-center mb-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                My photography, beautifully presented.
              </h1>
              <p className="mt-3 text-white/90 text-lg drop-shadow">
                Welcome to my photography portfolio. Explore my latest work, browse albums, and get in touch to discuss your project.
              </p>
            </div>
            
            {heroCta}
          </div>
        </div>
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
            <Button
              size="lg"
              onClick={() => navigate("/albums")}
              className="gap-2"
            >
              View All Albums
              <ArrowRight className="h-4 w-4" />
            </Button>
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
      </div>
    </main>
  );
}

export default Home;