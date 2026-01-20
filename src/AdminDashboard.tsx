import React, { useState, useEffect, useCallback, memo } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  arrayRemove,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

// shadcn components
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  ChevronRight,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  Maximize2,
  Share2,
  QrCode,
  X,
   Download,
  Copy,
} from "lucide-react";

const WORKER_URL = "https://b2-proxy.lensillumination.workers.dev";

// Helper function to detect B2 quota/limit errors
const isB2QuotaError = (status: number, errorText: string): boolean => {
  if (status === 403) {
    const lowerError = errorText.toLowerCase();
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

// Helper function to get user-friendly error message
const getB2ErrorMessage = (status: number, errorText: string): string => {
  if (isB2QuotaError(status, errorText)) {
    return "Backblaze storage quota exceeded. Please upgrade your account or delete some files.";
  }
  if (status === 403) {
    return "Access denied. Please check your authentication.";
  }
  if (status >= 500) {
    return "Backblaze service error. Please try again later.";
  }
  return errorText || `Error (${status})`;
};

interface Album {
  id: string;
  name: string;
  images?: any[];
  createdAt?: any;
  isPublic?: boolean;
  heroImage?: any;
}

interface ImageItem {
  id: string;
  name: string;
  "file-name": string;
  "thumbnail-name"?: string;
  uploadedAt?: any;
  size?: number;
}

// Memoized Image Card Component
const ImageCard = memo(({ 
  image, 
  isSelected, 
  onToggleSelection, 
  onOpenFullscreen,
  isHero,
  onSetHero,
  onRemoveHero
}: { 
  image: ImageItem; 
  isSelected: boolean; 
  onToggleSelection: (id: string) => void;
  onOpenFullscreen: (image: ImageItem) => void;
  isHero?: boolean;
  onSetHero?: (imageId: string) => void;
  onRemoveHero?: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const handleImageError = async () => {
    // If thumbnail failed and not tried fallback yet, try full-size image
    if (!useFallback && image["file-name"]) {
      setUseFallback(true);
    } else {
      // Both thumbnail and full-size failed - mark as error
      setImageError(true);
    }
  };

  const imageSrc = useFallback 
    ? `${WORKER_URL}/${image["file-name"]}`
    : `${WORKER_URL}/${image["thumbnail-name"] || image["file-name"]}`;

  return (
    <div
      className={`border rounded-lg overflow-hidden relative ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(image.id)}
          className="h-6 w-6 md:h-5 md:w-5 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Fullscreen Button */}
      {!imageError && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-3 right-3 h-10 w-10 md:h-8 md:w-8 p-0 shadow-md z-10"
          onClick={() => onOpenFullscreen(image)}
        >
          <Maximize2 className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      )}

      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
        {imageError ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-xs text-red-600 font-medium text-center">Usage Limit</p>
            <p className="text-xs text-red-500/70 text-center mt-1">Exceeded</p>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={image.name}
            className="w-full h-full object-cover cursor-pointer"
            loading="lazy"
            onClick={() => onOpenFullscreen(image)}
            onError={handleImageError}
          />
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="font-medium text-sm md:text-xs truncate" title={image.name}>
          {image.name}
        </p>
        <p className="text-sm md:text-xs text-muted-foreground">
          {image.size ? `${(image.size / 1024).toFixed(1)} KB` : "Unknown"}
        </p>
        {isHero !== undefined && (
          <div className="pt-1">
            {isHero ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Hero</span>
                {onRemoveHero && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHero();
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ) : (
              onSetHero && !imageError && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetHero(image.id);
                  }}
                >
                  Set as Hero
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ImageCard.displayName = "ImageCard";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumImages, setAlbumImages] = useState<ImageItem[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumPublic, setNewAlbumPublic] = useState(true);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [fullscreenImage, setFullscreenImage] = useState<ImageItem | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const qrRef = React.useRef<SVGSVGElement | null>(null);
  const navigate = useNavigate();

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load albums
  useEffect(() => {
    if (user) {
      loadAlbums();
    }
  }, [user]);

  // Load album images when the selected album changes (by id),
  // avoid reloading on visibility/name tweaks.
  useEffect(() => {
    if (selectedAlbum) {
      loadAlbumImages();
    }
  }, [selectedAlbum?.id]);

  const loadAlbums = async () => {
    try {
      const albumsRef = collection(db, "albums");
      const snapshot = await getDocs(albumsRef);
      const albumsList: Album[] = [];
      snapshot.forEach((doc) => {
        albumsList.push({
          id: doc.id,
          name: doc.data().name,
          images: doc.data().images || [],
          createdAt: doc.data().createdAt,
          isPublic: doc.data().isPublic ?? true,
          heroImage: doc.data().heroImage,
        });
      });
      const norm = (d: any) => (d?.toMillis ? d.toMillis() : d?.seconds ? d.seconds * 1000 : d || 0);
      setAlbums(albumsList.sort((a, b) => norm(b.createdAt) - norm(a.createdAt)));
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load albums");
    }
  };

  const loadAlbumImages = async () => {
    if (!selectedAlbum || !selectedAlbum.images || selectedAlbum.images.length === 0) {
      setAlbumImages([]);
      setLoadingImages(false);
      return;
    }
    
    setLoadingImages(true);
    try {
      const images: ImageItem[] = [];
      
      // Fetch each image document referenced in the album's images array
      for (const imageRef of selectedAlbum.images) {
        const imageDoc = await getDoc(doc(db, "images", imageRef.id));
        if (imageDoc.exists()) {
          images.push({
            id: imageDoc.id,
            name: imageDoc.data().name,
            "file-name": imageDoc.data()["file-name"],
            "thumbnail-name": imageDoc.data()["thumbnail-name"],
            uploadedAt: imageDoc.data().uploadedAt,
            size: imageDoc.data().size,
          });
        }
      }
      
      setAlbumImages(images);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load images");
    } finally {
      setLoadingImages(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      toast.error("Album name is required");
      return;
    }

    setIsCreatingAlbum(true);
    try {
      await addDoc(collection(db, "albums"), {
        name: newAlbumName,
        images: [],
        createdAt: new Date(),
        isPublic: newAlbumPublic,
      });
      setNewAlbumName("");
      setNewAlbumPublic(true);
      loadAlbums();
      toast.success(`Album "${newAlbumName}" created!`);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to create album");
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  const handleRenameAlbum = async (albumId: string) => {
    if (!renameValue.trim()) {
      toast.error("Album name is required");
      return;
    }

    try {
      await updateDoc(doc(db, "albums", albumId), {
        name: renameValue,
      });
      setIsRenaming(null);
      setRenameValue("");
      loadAlbums();
      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum({ ...selectedAlbum, name: renameValue });
      }
      toast.success("Album renamed!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to rename album");
    }
  };

  const handleToggleAlbumVisibility = async (album: Album, nextPublic: boolean) => {
    try {
      await updateDoc(doc(db, "albums", album.id), { isPublic: nextPublic });
      setSelectedAlbum((prev) => (prev && prev.id === album.id ? { ...prev, isPublic: nextPublic } : prev));
      setAlbums((prev) => prev.map((a) => (a.id === album.id ? { ...a, isPublic: nextPublic } : a)));
      toast.success(`Album set to ${nextPublic ? "Public" : "Private"}`);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update visibility");
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm("Are you sure you want to delete this album?")) return;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User session not found.");

      const toastId = toast.loading("Deleting album and files...");
      const idToken = await user.getIdToken(true);

      const albumRef = doc(db, "albums", albumId);
      const albumSnap = await getDoc(albumRef);
      if (!albumSnap.exists()) {
        toast.error("Album not found", { id: toastId });
        return;
      }

      const imageRefs = (albumSnap.data().images as any[]) || [];
      let deletedFromBucket = 0;
      let failedBucket = 0;

      // Delete all files from bucket FIRST, before touching Firestore
      for (const imageRef of imageRefs) {
        const imageSnap = await getDoc(imageRef);
        if (imageSnap.exists()) {
          const data = imageSnap.data() as Record<string, any>;
          const fileName = data["file-name"] as string;
          const thumbName = data["thumbnail-name"] as string | undefined;

          try {
            if (fileName) {
              await deleteFromWorker(fileName, idToken);
              deletedFromBucket++;
            }
            if (thumbName) {
              await deleteFromWorker(thumbName, idToken);
              deletedFromBucket++;
            }
          } catch (err) {
            console.warn(`Failed to delete file for image ${imageSnap.id}:`, err);
            failedBucket++;
          }
        }
      }

      // Then delete image documents from Firestore
      for (const imageRef of imageRefs) {
        await deleteDoc(imageRef);
      }

      // Finally delete the album document
      await deleteDoc(albumRef);
      if (selectedAlbum?.id === albumId) setSelectedAlbum(null);
      await loadAlbums();
      
      const message = failedBucket > 0 
        ? `Album deleted. Deleted ${deletedFromBucket} files (${failedBucket} failed).`
        : `Album deleted successfully with all ${deletedFromBucket} files.`;
      toast.success(message, { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to delete album", { description: error.message });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedAlbum || selectedImages.size === 0) return;
    if (!confirm(`Are you sure you want to remove ${selectedImages.size} image(s) from the album?`)) return;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User session not found.");

      const toastId = toast.loading(`Deleting ${selectedImages.size} image(s)...`);
      const idToken = await user.getIdToken(true);
      
      let deletedFromBucket = 0;
      let failedBucket = 0;

      // Delete files from bucket first
      for (const imageId of selectedImages) {
        const imageRef = doc(db, "images", imageId);
        const imageSnap = await getDoc(imageRef);
        
        if (imageSnap.exists()) {
          const data = imageSnap.data() as Record<string, any>;
          const fileName = data["file-name"] as string;
          const thumbName = data["thumbnail-name"] as string | undefined;

          try {
            if (fileName) {
              await deleteFromWorker(fileName, idToken);
              deletedFromBucket++;
            }
            if (thumbName) {
              await deleteFromWorker(thumbName, idToken);
              deletedFromBucket++;
            }
          } catch (err) {
            console.warn(`Failed to delete files for image ${imageId}:`, err);
            failedBucket++;
          }
        }
      }

      // Then remove from album in Firestore
      const albumRef = doc(db, "albums", selectedAlbum.id);
      for (const imageId of selectedImages) {
        const imageRef = doc(db, "images", imageId);
        await updateDoc(albumRef, {
          images: arrayRemove(imageRef),
        });
        // Delete the image document itself
        await deleteDoc(imageRef);
      }
      
      // Refresh selected album data
      const albumDoc = await getDoc(albumRef);
      if (albumDoc.exists()) {
        setSelectedAlbum({
          id: albumDoc.id,
          name: albumDoc.data().name,
          images: albumDoc.data().images || [],
          createdAt: albumDoc.data().createdAt,
        });
      }

      await loadAlbums();
      
      setSelectedImages(new Set());
      const message = failedBucket > 0
        ? `${selectedImages.size} image(s) deleted (${failedBucket} file deletions failed).`
        : `${selectedImages.size} image(s) deleted successfully.`;
      toast.success(message, { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to delete images", { description: error.message });
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(imageId)) {
        newSelection.delete(imageId);
      } else {
        newSelection.add(imageId);
      }
      return newSelection;
    });
  };

  const selectAllImages = () => {
    setSelectedImages(prev => {
      if (prev.size === albumImages.length) {
        return new Set();
      } else {
        return new Set(albumImages.map(img => img.id));
      }
    });
  };

  const getAlbumUrl = useCallback(() => {
    return `${window.location.origin}/album/${selectedAlbum?.id}`;
  }, [selectedAlbum?.id]);

  const handleShareLink = useCallback(async () => {
    const url = getAlbumUrl();
    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedAlbum?.name || "Album",
          text: selectedAlbum?.name || "",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to share link");
    }
  }, [getAlbumUrl, selectedAlbum?.name]);

  const handleCopyLink = useCallback(async () => {
    const url = getAlbumUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  }, [getAlbumUrl]);

  const handleToggleSelection = useCallback((imageId: string) => {
    toggleImageSelection(imageId);
  }, []);

  const handleOpenFullscreen = useCallback((image: ImageItem) => {
    setFullscreenImage(image);
  }, []);

  const handleSetHeroImage = async (imageRef: any) => {
    if (!selectedAlbum) return;
    try {
      await updateDoc(doc(db, "albums", selectedAlbum.id), { heroImage: imageRef });
      setSelectedAlbum((prev) => (prev ? { ...prev, heroImage: imageRef } : prev));
      setAlbums((prev) => prev.map((a) => (a.id === selectedAlbum.id ? { ...a, heroImage: imageRef } : a)));
      toast.success("Hero image set!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to set hero image");
    }
  };

  const handleRemoveHeroImage = async () => {
    if (!selectedAlbum) return;
    try {
      await updateDoc(doc(db, "albums", selectedAlbum.id), { heroImage: null });
      setSelectedAlbum((prev) => (prev ? { ...prev, heroImage: null } : prev));
      setAlbums((prev) => prev.map((a) => (a.id === selectedAlbum.id ? { ...a, heroImage: null } : a)));
      toast.success("Hero image removed");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to remove hero image");
    }
  };

  const deleteFromWorker = async (fileName: string, idToken: string) => {
    try {
      const res = await fetch(`${WORKER_URL}/${fileName}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to delete ${fileName}: ${res.status}`, text);
        throw new Error(`Worker delete failed: ${res.status} ${text}`);
      }
      console.log(`Successfully deleted ${fileName}`);
    } catch (err) {
      console.error(`Error deleting ${fileName}:`, err);
      throw err;
    }
  };

  const forceDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      
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

  const handleShareFullscreen = async (image: ImageItem) => {
    const url = `${WORKER_URL}/${image["file-name"]}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: image.name,
          text: image.name,
          url,
        });
      } else {
        toast.error("Sharing not supported on this device");
      }
    } catch (err) {
      console.error("Share failed", err);
      toast.error("Share failed");
    }
  };

  const handleDownloadQRCode = () => {
    if (!qrRef.current) return;
    try {
      const svg = qrRef.current;
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedAlbum?.name || "album"}-qr.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("QR download failed", err);
      toast.error("Failed to download QR");
    }
  };

  const createThumbnail = async (file: File, maxWidth: number = 600): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          },
          file.type,
          0.85 // Quality for JPEG
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!files || !selectedAlbum) {
      toast.error("Missing Info", { description: "Please select files and an album." });
      return;
    }

    setIsUploading(true);
    setOverallProgress(0);
    
    const fileArray = Array.from(files);
    let completedCount = 0;

    for (const file of fileArray) {
      const toastId = toast.loading(`Uploading ${file.name}...`);
      
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User session not found.");

        const idToken = await user.getIdToken(true);
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
        const fileName = `${Date.now()}-${safeName}`;
        const thumbFileName = `thumb-${fileName}`;

        // Create thumbnail
        const thumbnailBlob = await createThumbnail(file);

        // Upload full-size image
        const b2Res = await fetch(`${WORKER_URL}/${fileName}`, {
          method: "PUT",
          body: file,
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": file.type,
          },
        });

        if (!b2Res.ok) {
          const errorText = await b2Res.text();
          const friendlyError = getB2ErrorMessage(b2Res.status, errorText);
          console.error("B2 upload failed", { status: b2Res.status, error: errorText });
          throw new Error(friendlyError);
        }

        // Upload thumbnail
        const thumbRes = await fetch(`${WORKER_URL}/${thumbFileName}`, {
          method: "PUT",
          body: thumbnailBlob,
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": file.type,
          },
        });

        if (!thumbRes.ok) {
          const errorText = await thumbRes.text();
          const friendlyError = getB2ErrorMessage(thumbRes.status, errorText);
          console.error("B2 thumbnail upload failed", { status: thumbRes.status, error: errorText });
          throw new Error(friendlyError);
        }

        const imgRef = await addDoc(collection(db, "images"), {
          name: file.name,
          "file-name": fileName,
          "thumbnail-name": thumbFileName,
          uploadedAt: new Date(),
          size: file.size,
          type: file.type
        });

        const albumRef = doc(db, "albums", selectedAlbum.id);
        await updateDoc(albumRef, {
          images: arrayUnion(imgRef),
        });

        completedCount++;
        setOverallProgress((completedCount / fileArray.length) * 100);
        
        toast.success(`Success: ${file.name}`, {
          id: toastId,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });

      } catch (error: any) {
        console.error(error);
        toast.error(`Failed: ${file.name}`, {
          id: toastId,
          description: error.message,
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        });
      }
    }

    setIsUploading(false);
    
    if (completedCount === 0) {
      toast.error("Upload failed", {
        description: `All ${fileArray.length} file(s) failed to upload.`,
      });
    } else if (completedCount === fileArray.length) {
      toast.success("Upload complete", {
        description: `Successfully uploaded all ${completedCount} file(s).`,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFiles(null);
      await loadAlbums();
      // Refresh selected album data
      const albumDoc = await getDoc(doc(db, "albums", selectedAlbum.id));
      if (albumDoc.exists()) {
        setSelectedAlbum({
          id: albumDoc.id,
          name: albumDoc.data().name,
          images: albumDoc.data().images || [],
          createdAt: albumDoc.data().createdAt,
        });
      }
    } else {
      toast.warning("Partial upload", {
        description: `Successfully uploaded ${completedCount} of ${fileArray.length} file(s).`,
      });
      await loadAlbums();
      // Refresh selected album data
      const albumDoc = await getDoc(doc(db, "albums", selectedAlbum.id));
      if (albumDoc.exists()) {
        setSelectedAlbum({
          id: albumDoc.id,
          name: albumDoc.data().name,
          images: albumDoc.data().images || [],
          createdAt: albumDoc.data().createdAt,
        });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast.success("Signed out!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    navigate("/admin/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Albums List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Albums</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Create New Album */}
                <div className="space-y-2 pb-3 border-b">
                  <Label htmlFor="newAlbum" className="text-sm">
                    Create Album
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="newAlbum"
                      placeholder="Album name"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      disabled={isCreatingAlbum}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateAlbum}
                      disabled={isCreatingAlbum || !newAlbumName.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-sm">
                    <Switch
                      checked={newAlbumPublic}
                      onCheckedChange={setNewAlbumPublic}
                      disabled={isCreatingAlbum}
                      ariaLabel="Toggle public album"
                    />
                    <Label htmlFor="newAlbumPublic" className="text-sm">Public album</Label>
                  </div>
                </div>

                {/* Albums List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {albums.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No albums yet
                    </p>
                  ) : (
                    albums.map((album) => (
                      <button
                        key={album.id}
                        onClick={() => setSelectedAlbum(album)}
                        className={`w-full text-left p-3 rounded-lg border flex items-center justify-between ${
                          selectedAlbum?.id === album.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/20 border-muted-foreground/20"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{album.name}</p>
                          <p className="text-xs opacity-75 flex items-center gap-2">
                            <span>{album.images?.length || 0} images</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${album.isPublic ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {album.isPublic ? "Public" : "Private"}
                            </span>
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Album Details & Images */}
          <div className="lg:col-span-2">
            {selectedAlbum ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {isRenaming === selectedAlbum.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="text-xl font-bold"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              handleRenameAlbum(selectedAlbum.id)
                            }
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsRenaming(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <CardTitle className="text-2xl mb-2">
                            {selectedAlbum.name}
                          </CardTitle>
                          <CardDescription>
                            {albumImages.length} image(s) in this album
                          </CardDescription>
                        </div>
                      )}
                    </div>

                    {isRenaming !== selectedAlbum.id && (
                      <div className="flex gap-2 ml-2 flex-wrap items-center">
                        <div className="flex items-center gap-2 pr-2 border-r border-muted-foreground/20">
                          <div className="flex items-center gap-2 text-xs">
                            <Switch
                              checked={!!selectedAlbum.isPublic}
                              onCheckedChange={(val) => handleToggleAlbumVisibility(selectedAlbum, val)}
                              ariaLabel="Toggle album visibility"
                            />
                            <span>Public</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleShareLink}
                          title="Share album"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyLink}
                          title="Copy album link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowQRCode(true)}
                          title="Show QR code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsRenaming(selectedAlbum.id);
                            setRenameValue(selectedAlbum.name);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAlbum(selectedAlbum.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upload Section */}
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <UploadCloud className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Upload Images</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="pictures" className="text-sm">Select Photos</Label>
                        <Input 
                          ref={fileInputRef}
                          id="pictures"
                          type="file" 
                          multiple 
                          accept="image/*"
                          onChange={(e) => setFiles(e.currentTarget.files)} 
                          disabled={isUploading}
                          className="file:text-primary file:font-semibold cursor-pointer text-base"
                        />
                      </div>

                      {isUploading && (
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between text-xs font-medium text-muted-foreground">
                            <span>Upload Progress</span>
                            <span>{Math.round(overallProgress)}%</span>
                          </div>
                          <Progress value={overallProgress} className="h-2 w-full" />
                        </div>
                      )}

                      <Button 
                        onClick={handleUpload} 
                        disabled={isUploading || !files} 
                        className="w-full font-bold"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing Queue...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Upload to {selectedAlbum.name}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Images Section */}
                  {loadingImages ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4 animate-spin" />
                      <p className="text-muted-foreground">
                        Loading images...
                      </p>
                    </div>
                  ) : albumImages.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                      <p className="text-muted-foreground">
                        No images in this album yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload images using the form above
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Bulk Actions Bar */}
                      <div className="flex items-center justify-between gap-3 p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedImages.size === albumImages.length && albumImages.length > 0}
                            onChange={selectAllImages}
                            className="h-4 w-4 cursor-pointer"
                          />
                          <span className="text-sm font-medium">
                            {selectedImages.size > 0
                              ? `${selectedImages.size} selected`
                              : "Select all"}
                          </span>
                        </div>
                        {selectedImages.size > 0 && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleBulkDelete}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Selected
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {albumImages.map((image) => {
                          const imageRef = selectedAlbum.images?.find((ref: any) => ref.id === image.id);
                          const isHeroImage = selectedAlbum.heroImage?.id === image.id;
                          return (
                            <ImageCard
                              key={image.id}
                              image={image}
                              isSelected={selectedImages.has(image.id)}
                              onToggleSelection={handleToggleSelection}
                              onOpenFullscreen={handleOpenFullscreen}
                              isHero={isHeroImage}
                              onSetHero={() => handleSetHeroImage(imageRef)}
                              onRemoveHero={handleRemoveHeroImage}
                            />
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">Select an album to view its images</p>
                </CardContent>
              </Card>
            )}
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
                      handleShareFullscreen(fullscreenImage);
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
                      forceDownload(`${WORKER_URL}/${fullscreenImage["file-name"]}`, fullscreenImage.name);
                    }}
                  >
                    <Download className="h-4 w-4 md:h-3 md:w-3" />
                    <span>High-Res</span>
                  </Button>
                  {fullscreenImage["thumbnail-name"] && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1 text-xs md:text-xs whitespace-nowrap px-3 py-2 md:px-2 md:py-1 h-10 md:h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        forceDownload(`${WORKER_URL}/${fullscreenImage["thumbnail-name"]}`, `thumb-${fullscreenImage.name}`);
                      }}
                    >
                      <Download className="h-4 w-4 md:h-3 md:w-3" />
                      <span>Low-Res</span>
                    </Button>
                  )}
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
                  src={`${WORKER_URL}/${fullscreenImage["file-name"]}`}
                  alt={fullscreenImage.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="bg-black/60 text-white p-4 rounded-lg">
                <p className="font-medium">{fullscreenImage.name}</p>
                <p className="text-sm opacity-75">
                  {fullscreenImage.size ? `${(fullscreenImage.size / 1024).toFixed(1)} KB` : "Unknown size"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRCode && selectedAlbum && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQRCode(false)}
          >
            <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Album QR Code
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQRCode(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Scan to view {selectedAlbum.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG ref={qrRef} value={getAlbumUrl()} size={256} />
                </div>
                <div className="text-center space-y-2 w-full">
                  <p className="text-sm text-muted-foreground break-all">
                    {getAlbumUrl()}
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleDownloadQRCode}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShareLink}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
