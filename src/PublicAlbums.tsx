import { useEffect, useState } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Image as ImageIcon, Loader2 } from "lucide-react";

type PublicAlbum = {
  id: string;
  name: string;
  imagesCount: number;
  createdAt?: any;
  heroImageUrl?: string;
  folderId?: string | null;
};

type PublicFolder = {
  id: string;
  name: string;
  createdAt?: any;
  coverImageUrl?: string;
  albumCount: number;
};

export default function PublicAlbums() {
  const [albums, setAlbums] = useState<PublicAlbum[]>([]);
  const [folders, setFolders] = useState<PublicFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Albums - Lens Illumination";
  }, []);

  useEffect(() => {
    const fetchPublicAlbums = async () => {
      try {
        const [albumSnap, legacyFolderSnap] = await Promise.all([
          getDocs(collection(db, "albums")),
          getDocs(collection(db, "folders")),
        ]);

        const PROXY_URL = "https://b2-proxy.lensillumination.workers.dev";
        const allDocs = albumSnap.docs.map((albumDoc) => ({ id: albumDoc.id, data: albumDoc.data() as any }));
        const legacyFolderDocs = legacyFolderSnap.docs.map((folderDoc) => ({ id: folderDoc.id, data: folderDoc.data() as any }));
        const folderDocs = [
          ...allDocs.filter(({ data }) => data.kind === "folder" && data.isPublic !== false),
          ...legacyFolderDocs.filter(({ data }) => data.isPublic !== false),
        ];
        const folderMap = new Map(folderDocs.map(({ id, data }) => [id, data]));
        const albumDocs = allDocs.filter(({ data }) => data.kind !== "folder");

        const folderList: PublicFolder[] = [];
        for (const { id, data } of folderDocs) {
          let coverImageUrl: string | undefined;

          if (data.coverAlbumId) {
            try {
              const coverAlbumSnap = await getDoc(doc(db, "albums", data.coverAlbumId));
              if (coverAlbumSnap.exists()) {
                const coverAlbumData = coverAlbumSnap.data() as any;
                if (coverAlbumData.heroImage) {
                  const heroDoc = await getDoc(coverAlbumData.heroImage);
                  if (heroDoc.exists()) {
                    const heroData = heroDoc.data() as any;
                    coverImageUrl = `${PROXY_URL}/${heroData["thumbnail-name"] || heroData["file-name"]}`;
                  }
                }
              }
            } catch (err) {
              console.error("Failed to load folder cover", err);
            }
          }

          const albumCount = albumDocs.filter(({ data: albumData }) => albumData.folderId === id && albumData.isPublic !== false).length;

          folderList.push({
            id,
            name: data.name,
            createdAt: data.createdAt,
            coverImageUrl,
            albumCount,
          });
        }

        const albumList: PublicAlbum[] = [];
        for (const { id, data } of albumDocs) {
          if (data.isPublic === false) continue;
          if (data.folderId && folderMap.has(data.folderId) && folderMap.get(data.folderId)?.isPublic === false) continue;

          let heroImageUrl: string | undefined;
          if (data.heroImage) {
            try {
              const heroDoc = await getDoc(data.heroImage);
              if (heroDoc.exists()) {
                const heroData = heroDoc.data() as any;
                heroImageUrl = `${PROXY_URL}/${heroData["thumbnail-name"] || heroData["file-name"]}`;
              }
            } catch (err) {
              console.error("Failed to load hero image", err);
            }
          }

          albumList.push({
            id,
            name: data.name,
            imagesCount: Array.isArray(data.images) ? data.images.length : 0,
            createdAt: data.createdAt,
            heroImageUrl,
            folderId: data.folderId ?? null,
          });
        }

        const norm = (d: any) => (d?.toMillis ? d.toMillis() : d?.seconds ? d.seconds * 1000 : d || 0);
        folderList.sort((a, b) => norm(b.createdAt) - norm(a.createdAt));
        albumList.sort((a, b) => norm(b.createdAt) - norm(a.createdAt));
        setFolders(folderList);
        setAlbums(albumList);
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
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Public Albums</h1>
          <p className="text-muted-foreground">Explore my photography albums and projects</p>
        </div>

        {loading ? (
          <div className="text-center py-16 flex flex-col items-center animate-fade-in">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading albums...</p>
          </div>
        ) : albums.length === 0 && folders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground animate-fade-in">No public albums yet. Check back soon!</div>
        ) : (
          <div className="space-y-10 animate-fade-in-up">
            {folders.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-semibold">Folders</h2>
                    <p className="text-sm text-muted-foreground">Browse collections of related albums.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {folders.map((folder) => (
                    <Card
                      key={folder.id}
                      onClick={() => navigate(`/folder/${folder.id}`)}
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col"
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                        {folder.coverImageUrl ? (
                          <img src={folder.coverImageUrl} alt={folder.name} className="w-full h-full object-cover" />
                        ) : (
                          <FolderOpen className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4 flex flex-col gap-3 flex-1">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Folder</p>
                          <p className="font-semibold truncate">{folder.name}</p>
                          <p className="text-sm text-muted-foreground">{folder.albumCount} album(s)</p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/folder/${folder.id}`);
                            setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
                          }}
                          className="w-full mt-auto"
                        >
                          View Folder
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {albums.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-semibold">Albums</h2>
                    <p className="text-sm text-muted-foreground">Public albums and shared projects.</p>
                  </div>
                </div>

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
                            setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
                          }}
                          className="w-full mt-auto"
                        >
                          View Album
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
