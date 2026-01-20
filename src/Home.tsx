import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Settings, ArrowRight, Image as ImageIcon } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";

type PublicAlbum = {
  id: string;
  name: string;
  imagesCount: number;
  createdAt?: any;
};

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [albums, setAlbums] = useState<PublicAlbum[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

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

  const heroCta = useMemo(() => (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        size="lg"
        variant="outline"
        onClick={() => navigate("/contact")}
      >
        Contact Us
      </Button>
      {!loadingAuth && user && (
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate("/admin")}
          className="gap-2 dark:text-foreground text-slate-900 dark:border-border border-slate-900/20"
        >
          <Settings className="h-4 w-4" />
          Admin Dashboard
        </Button>
      )}
    </div>
  ), [albums, navigate, loadingAuth, user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero */}
        <header className="pt-16 sm:pt-20 pb-12 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
            Illuminate your stories with effortless album sharing.
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200/80 max-w-3xl mx-auto">
            Curate, protect, and share your photography albums. Manage private client sets or showcase public galleries—all from one streamlined admin.
          </p>
          {heroCta}
        </header>

        {/* Public Albums */}
        <section className="pt-24 space-y-8">
          <div className="text-center space-y-4 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Public Albums</h2>
            <p className="text-base text-slate-700 dark:text-slate-300/80 max-w-2xl mx-auto">
              Browse our collection of shared photography albums.
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
            <div className="text-center py-10 text-slate-600 dark:text-slate-300/80">Loading public albums…</div>
          ) : albums.length === 0 ? (
            <div className="text-center py-10 text-slate-600 dark:text-slate-300/80">No public albums yet. Check back soon!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.slice(0, 3).map((album) => (
                <div
                  key={album.id}
                  className="rounded-xl border border-border bg-white shadow-lg dark:bg-white/5 dark:border-white/5 backdrop-blur hover:-translate-y-1 transition-transform p-4 flex flex-col gap-3 cursor-pointer"
                  onClick={() => navigate(`/album/${album.id}`)}
                >
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200">
                    <ImageIcon className="h-10 w-10 opacity-70" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{album.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300/70">{album.imagesCount} image(s)</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/album/${album.id}`);
                  }} className="w-full">
                    View Album
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;