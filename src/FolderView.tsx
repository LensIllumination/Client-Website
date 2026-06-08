import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Image as ImageIcon, Loader2, Share2, Copy } from "lucide-react";
import { loadFolder, loadFolderMeta, type LoadedFolder, type FolderMeta } from "@/lib/LoadFolder";
import AccessGate from "@/components/AccessGate";
import { hashPassword, readStoredAccessHash, storeAccessHash } from "@/lib/contentAccess";
import { toast } from "sonner";

export default function FolderView() {
  const { id: folderId } = useParams<{ id: string }>();
  const [folder, setFolder] = useState<LoadedFolder | null>(null);
  const [folderMeta, setFolderMeta] = useState<FolderMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Folder - Lens Illumination";
  }, []);

  useEffect(() => {
    if (!folderId) return;

    setLoading(true);
    loadFolderMeta(folderId).then((meta) => {
      if (!meta) {
        navigate("/404", { replace: true });
        return;
      }

      document.title = `${meta.name} - Lens Illumination`;
      setFolderMeta(meta);

      const passwordRequired = !!(meta.passwordEnabled && meta.passwordHash);
      const storedHash = readStoredAccessHash("folder", meta.id);
      setUnlocked(!passwordRequired || storedHash === meta.passwordHash);
      setPassword("");
      setPasswordError("");
      if (!passwordRequired || storedHash === meta.passwordHash) {
        loadFolder(meta.id).then((data) => {
          setFolder(data);
          setLoading(false);
        }).catch((error) => {
          console.error("Failed to load folder albums", error);
          navigate("/404", { replace: true });
        });
      } else {
        setFolder({
          ...meta,
          albums: [],
          coverImage: null,
        });
        setLoading(false);
      }
    });
  }, [folderId, navigate]);

  const handleUnlock = async () => {
    if (!folderMeta) return;

    if (!password.trim()) {
      setPasswordError("Enter the folder password.");
      return;
    }

    setCheckingPassword(true);
    try {
      const passwordHash = await hashPassword(password);
      if (folderMeta.passwordEnabled && folderMeta.passwordHash && passwordHash === folderMeta.passwordHash) {
        storeAccessHash("folder", folderMeta.id, passwordHash);
        const data = await loadFolder(folderMeta.id);
        setFolder(data);
        setUnlocked(true);
        setPasswordError("");
        setPassword("");
        return;
      }

      setPasswordError("Incorrect password.");
    } finally {
      setCheckingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!folder) return null;

  const folderUrl = folderId ? `${window.location.origin}/folder/${folderId}` : "";

  const handleShareFolder = async () => {
    if (!folderId || !folderMeta) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: folderMeta.name, text: folderMeta.name, url: folderUrl });
        return;
      }
      await navigator.clipboard.writeText(folderUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Share folder error:", error);
      toast.error("Please try again later");
    }
  };

  const handleCopyFolderLink = async () => {
    if (!folderId) return;
    try {
      await navigator.clipboard.writeText(folderUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Copy folder link error:", error);
      toast.error("Please try again later");
    }
  };

  if (!unlocked) {
    return (
      <AccessGate
        title={folder.name}
        description="This folder is password protected."
        password={password}
        onPasswordChange={setPassword}
        onSubmit={handleUnlock}
        submitting={checkingPassword}
        error={passwordError}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 pt-24">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] items-stretch">
          <Card className="overflow-hidden border-muted-foreground/10 shadow-lg">
            <div className="aspect-[4/3] bg-muted overflow-hidden flex items-center justify-center">
              {folder.coverImage ? (
                <img src={folder.coverImage.fullSrc} alt={folder.name} className="w-full h-full object-cover" />
              ) : (
                <FolderOpen className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
          </Card>

          <div className="flex flex-col justify-center space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Folder</p>
              <h1 className="text-4xl sm:text-5xl font-bold mt-2">{folder.name}</h1>
              <p className="text-muted-foreground mt-3">{folder.albums.length} album(s) in this folder</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate("/albums")}>Back to Albums</Button>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
              <Button variant="secondary" onClick={handleShareFolder} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Folder
              </Button>
              <Button variant="secondary" onClick={handleCopyFolderLink} className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold">Albums</h2>
              <p className="text-sm text-muted-foreground">Open any album below to view its contents.</p>
            </div>
          </div>

          {folder.albums.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No albums have been added here yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {folder.albums.map((album) => (
                <Card
                  key={album.id}
                  className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                  onClick={() => navigate(`/album/${album.id}`)}
                >
                  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {album.heroImage ? (
                      <img src={album.heroImage.src} alt={album.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{album.name}</CardTitle>
                    <CardDescription>{album.imagesCount} image(s)</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-5">
                    <Button className="w-full" variant="secondary">View Album</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
