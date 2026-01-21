import { useEffect, useState } from "react";
import { collection, getDocs, query, where, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";

type PublicAlbum = {
  id: string;
  name: string;
  imagesCount: number;
  createdAt?: any;
  heroImageUrl?: string;
};

export default function PublicAlbums() {
  const [albums, setAlbums] = useState<PublicAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Albums - Lens Illumination";
  }, []);
  useEffect(() => {
    const fetchPublicAlbums = async () => {
      try {
        const q = query(collection(db, "albums"), where("isPublic", "==", true));
        const snap = await getDocs(q);
        const list: PublicAlbum[] = [];
        
        for (const doc of snap.docs) {
          const data = doc.data();
          let heroImageUrl: string | undefined;
          
          if (data.heroImage) {
            try {
              const heroDoc = await getDoc(data.heroImage);
              if (heroDoc.exists()) {
                const heroData = (heroDoc.data() as any);
                const PROXY_URL = "https://b2-proxy.lensillumination.workers.dev";
                heroImageUrl = `${PROXY_URL}/${heroData["thumbnail-name"] || heroData["file-name"]}`;
              }
            } catch (err) {
              console.error("Failed to load hero image", err);
            }
          }
          
          list.push({
            id: doc.id,
            name: data.name,
            imagesCount: (data.images || []).length,
            createdAt: data.createdAt,
            heroImageUrl,
          });
        }
        
        const norm = (d: any) => (d?.toMillis ? d.toMillis() : d?.seconds ? d.seconds * 1000 : d || 0);
        list.sort((a, b) => norm(b.createdAt) - norm(a.createdAt));
        setAlbums(list);
      } catch (err) {
        console.error("Failed to load public albums", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicAlbums();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-background px-4 py-8 pt-24">
      <div className="max-w-6xl mx-auto w-full">
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Public Albums
          </h1>
          <p className="text-muted-foreground">
            Explore my photography albums and projects
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading albums...</div>
        ) : albums.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No public albums yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Card
                key={album.id}
                onClick={() => navigate(`/album/${album.id}`)}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col"
              >
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {album.heroImageUrl ? (
                    <img src={album.heroImageUrl} alt={album.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="font-semibold truncate">{album.name}</p>
                    <p className="text-sm text-muted-foreground">{album.imagesCount} image(s)</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/album/${album.id}`);
                    }}
                    className="w-full mt-auto"
                  >
                    View Album
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
