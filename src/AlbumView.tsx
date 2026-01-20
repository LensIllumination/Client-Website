import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadAlbum } from "./lib/LoadAlbum";
import { Button } from "@/components/ui/button";
import GalleryImage from "@/components/GalleryImage";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { X, Settings, Download, Share2, Copy } from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";
import ImageErrorPanel from "@/components/ImageErrorPanel";

interface Album {
  name: string;
  heroImage?: { id: string; src: string; fullSrc: string; title: string } | null;
  images: Array<{ id: string; src: string; fullSrc: string; title: string }>;
}

export function AlbumView() {
  const { id: albumId } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [error, setError] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; fullSrc: string; title: string } | null>(null);
  const [fullscreenLoadError, setFullscreenLoadError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageSizes, setImageSizes] = useState<Map<string, string>>(new Map());
  const navigate = useNavigate();

  // Generate random height for each image (weighted towards shorter images)
  const getImageHeight = (imageId: string): string => {
    if (imageSizes.has(imageId)) {
      return imageSizes.get(imageId)!;
    }
    
    // More short images, fewer tall images (weighted distribution)
    const heights = [
      'h-48', 'h-48', 'h-48', 'h-48',  // 4x short
      'h-56', 'h-56', 'h-56',           // 3x 
      'h-64', 'h-64',                   // 2x medium
      'h-72',                           // 1x
      'h-80',                           // 1x tall
      'h-96'                            // 1x very tall
    ];
    const randomHeight = heights[Math.floor(Math.random() * heights.length)];
    
    setImageSizes(new Map(imageSizes.set(imageId, randomHeight)));
    return randomHeight;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!albumId) return;

    loadAlbum(albumId).then((data) => {
      if (data) {
        setAlbum(data);
      } else {
        setError(true);
      }
    });
  }, [albumId]);

  useEffect(() => {
    // Reset error when a new image is opened in fullscreen
    setFullscreenLoadError(false);
  }, [fullscreenImage]);

  const handleShareAlbum = async () => {
    if (!albumId || !album) return;
    const url = `${window.location.origin}/album/${albumId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: album.name, text: album.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to share link");
    }
  };

  const handleCopyAlbumLink = async () => {
    if (!albumId || !album) return;
    const url = `${window.location.origin}/album/${albumId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy link");
    }
  };

  const isB2QuotaError = (status: number, errorText: string): boolean => {
    if (status === 403) {
      const lowerError = (errorText || "").toLowerCase();
      return (
        lowerError.includes("quota") ||
        lowerError.includes("limit") ||
        lowerError.includes("bandwidth") ||
        lowerError.includes("account_cap_exceeded") ||
        lowerError.includes("service_unavailable")
      );
    }
    return false;
  };

  const forceDownload = async (url: string, filename: string) => {
    let notified = false;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        const isQuota = isB2QuotaError(res.status, errorText);
        const message = isQuota
          ? "Usage Limit Exceeded — Backblaze quota limit reached"
          : `Download failed (${res.status})`;
        toast.error(message);
        notified = true;
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed", err);
      if (!notified) {
        toast.error("Download failed");
      }
    }
  };

  const handleShareFullscreen = async (image: { fullSrc: string; title: string }) => {
    const url = image.fullSrc;
    try {
      if (navigator.share) {
        await navigator.share({ title: image.title, text: image.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
      toast.error("Share failed");
    }
  };

   const handleDownloadAll = async () => {
     if (!album) return;
   
     setIsDownloading(true);
     const toastId = toast.loading("Preparing download...");
   
     try {
       const zip = new JSZip();
       const folder = zip.folder(album.name);
     
       if (!folder) throw new Error("Failed to create zip folder");
     
       // Download all images and add to zip
       for (let i = 0; i < album.images.length; i++) {
         const img = album.images[i];
         toast.loading(`Downloading ${i + 1} of ${album.images.length}...`, { id: toastId });
       
         try {
          const response = await fetch(img.fullSrc);
           const blob = await response.blob();
          const extension = img.fullSrc.split('.').pop()?.split('?')[0] || 'jpg';
           folder.file(`${img.title || `image-${i + 1}`}.${extension}`, blob);
         } catch (error) {
           console.error(`Failed to download ${img.title}:`, error);
         }
       }
     
       toast.loading("Creating zip file...", { id: toastId });
       const content = await zip.generateAsync({ type: "blob" });
     
       const link = document.createElement("a");
       link.href = URL.createObjectURL(content);
       link.download = `${album.name}.zip`;
       link.click();
     
       toast.success("Download complete!", { id: toastId });
     } catch (error: any) {
       console.error(error);
       toast.error("Download failed", { id: toastId, description: error.message });
     } finally {
       setIsDownloading(false);
     }
   };

  if (error) return <div className="p-10 text-center">Album not found.</div>;
  if (!album) return <div className="p-10 text-center animate-pulse">Loading gallery...</div>;

  return (
    <main className="min-h-screen pt-2 pb-8">
      {/* Hero Image Section with Overlay */}
      <div className="mx-auto max-w-7xl px-4 mb-4">
        <div className="relative w-full h-[calc(100vh-120px)] rounded-xl overflow-hidden shadow-2xl">
          {/* Hero Image */}
          {album.heroImage ? (
            <div 
              className="cursor-pointer w-full h-full"
              onClick={() => setFullscreenImage(album.heroImage!)}
            >
              <GalleryImage
                src={album.heroImage.src}
                alt={album.heroImage.title}
                onClick={() => setFullscreenImage(album.heroImage!)}
              />
            </div>
          ) : (
            <img
              src="https://picsum.photos/seed/hero/1920/1080"
              alt="Hero placeholder"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Overlay with Album Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
            <div className="text-center mb-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">{album.name}</h1>
              <p className="mt-2 text-white/90 text-lg">{album.images.length} Photos</p>
            </div>
            
            <div className="flex justify-center gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 backdrop-blur-sm bg-white/90 hover:bg-white text-slate-900"
                onClick={handleDownloadAll}
                disabled={isDownloading || album.images.length === 0}
              >
                <Download className="h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download All"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 backdrop-blur-sm bg-white/90 hover:bg-white text-slate-900"
                onClick={handleShareAlbum}
              >
                <Share2 className="h-4 w-4" />
                Share Album
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 backdrop-blur-sm bg-white/90 hover:bg-white text-slate-900"
                onClick={handleCopyAlbumLink}
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
              {user && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 backdrop-blur-sm bg-white/90 hover:bg-white text-slate-900"
                  onClick={() => navigate("/admin")}
                >
                  <Settings className="h-4 w-4" />
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-12">
        {/* CSS Masonry Grid using Tailwind columns */}
        <div className="columns-2 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
          {album.images.map((img) => {
            const height = getImageHeight(img.id);
            return (
              <div
                key={img.id}
                className={`cursor-pointer mb-4 break-inside-avoid rounded-lg ${height}`}
              >
                <GalleryImage
                  src={img.src}
                  alt={img.title}
                  onClick={() => setFullscreenImage(img)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="w-full h-full flex flex-col gap-4">
            <div className="bg-black/70 backdrop-blur rounded-lg p-3 flex flex-nowrap gap-1 items-center justify-between overflow-x-auto">
              <div className="flex flex-nowrap gap-1 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 text-xs md:text-xs whitespace-nowrap px-3 py-2 md:px-2 md:py-1 h-10 md:h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareFullscreen(fullscreenImage!);
                  }}
                >
                  <Share2 className="h-4 w-4 md:h-3 md:w-3" />
                  <span>Share</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 text-xs md:text-xs whitespace-nowrap px-3 py-2 md:px-2 md:py-1 h-10 md:h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    forceDownload(fullscreenImage!.fullSrc, fullscreenImage!.title);
                  }}
                >
                  <Download className="h-4 w-4 md:h-3 md:w-3" />
                  <span>High-Res</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 text-xs md:text-xs whitespace-nowrap px-3 py-2 md:px-2 md:py-1 h-10 md:h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    forceDownload(fullscreenImage!.src, `thumb-${fullscreenImage!.title}`);
                  }}
                >
                  <Download className="h-4 w-4 md:h-3 md:w-3" />
                  <span>Low-Res</span>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2 md:p-1 h-10 md:h-8 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenImage(null);
                }}
              >
                <X className="h-6 w-6 md:h-5 md:w-5" />
              </Button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {fullscreenLoadError ? (
                <div className="w-full h-full max-w-full max-h-full">
                  <ImageErrorPanel />
                </div>
              ) : (
                <img
                  src={fullscreenImage!.fullSrc}
                  alt={fullscreenImage!.title}
                  className="max-h-full max-w-full object-contain"
                  onError={() => {
                    setFullscreenLoadError(true);
                    toast.error("Usage Limit Exceeded — Backblaze quota limit reached");
                  }}
                />
              )}
            </div>

            {fullscreenImage!.title && (
              <div className="bg-black/60 text-white p-4 rounded-lg">
                <p className="font-medium">{fullscreenImage!.title}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}