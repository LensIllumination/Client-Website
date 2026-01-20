import { useEffect, useState } from "react";
import { collection, getDocs, query, where, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

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
    const fetchPublicAlbums = async () => {
      try {
        const q = query(collection(db, "albums"), where("isPublic", "==", true));
        const snap = await getDocs(q);
        const list: PublicAlbum[] = [];
        
        for (const doc of snap.docs) {
          const data = doc.data();
          let heroImageUrl: string | undefined;
          
          if (data.heroImageRef) {
            try {
              const heroDoc = await getDoc(data.heroImageRef);
              if (heroDoc.exists()) {
                heroImageUrl = (heroDoc.data() as any)?.src;
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
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">
              Public Albums
            </h1>
            <p className="text-lg text-slate-700 dark:text-slate-300/80">
              Browse our collection of shared photography albums
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-slate-600 dark:text-slate-400">Loading albums...</p>
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600 dark:text-slate-400">No public albums yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => navigate(`/album/${album.id}`)}
                className="rounded-xl border border-border bg-white shadow-lg dark:bg-white/5 dark:border-white/5 backdrop-blur hover:-translate-y-1 transition-transform cursor-pointer overflow-hidden flex flex-col gap-3"
              >
                <div className="aspect-video rounded-t-lg bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 overflow-hidden">
                  {album.heroImageUrl ? (
                    <img src={album.heroImageUrl} alt={album.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 opacity-70" />
                  )}
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{album.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300/70">{album.imagesCount} image(s)</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/album/${album.id}`);
                    }}
                    className="w-full"
                  >
                    View Album
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
