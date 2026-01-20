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

interface Album {
  name: string;
  images: Array<{ id: string; src: string; fullSrc: string; title: string }>;
}

export function AlbumView() {
  const { id: albumId } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [error, setError] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; fullSrc: string; title: string } | null>(null);
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

  const forceDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Download failed");
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
    <main className="min-h-screen py-8">
      <header className="mb-10 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">{album.name}</h1>
          <p className="mt-2 text-gray-500">{album.images.length} Photos</p>
        </div>
        
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownloadAll}
            disabled={isDownloading || album.images.length === 0}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleShareAlbum}
          >
            <Share2 className="h-4 w-4" />
            Share Album
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCopyAlbumLink}
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          {user && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/admin")}
            >
              <Settings className="h-4 w-4" />
              Admin Dashboard
            </Button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4">
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
              <img
                src={fullscreenImage!.fullSrc}
                alt={fullscreenImage!.title}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.style.display !== 'none') {
                    img.style.display = 'none';
                    // Show error message
                    const container = img.parentElement;
                    if (container) {
                      const error = document.createElement('div');
                      error.className = 'flex flex-col items-center justify-center text-white';
                      error.innerHTML = `
                        <svg class="h-12 w-12 mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="font-medium">Usage Limit Exceeded</p>
                        <p class="text-sm text-gray-300 mt-1">Backblaze quota limit reached</p>
                      `;
                      container.appendChild(error);
                    }
                  }
                }}
              />
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