import { useState } from "react";
import ImageErrorPanel from "@/components/ImageErrorPanel";

interface GalleryImageProps {
  src: string;
  alt: string;
  onClick?: () => void;
}

function GalleryImage({ src, alt, onClick }: GalleryImageProps) {
  const [imageError, setImageError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const handleImageError = () => {
    // Try full-size if thumbnail fails; otherwise show error
    if (!useFallback) {
      setUseFallback(true);
    } else {
      setImageError(true);
    }
  };

  const displaySrc = useFallback ? src.replace("/thumb-", "/") : src;

  return (
    <div className="relative mb-4 break-inside-avoid overflow-hidden rounded-lg shadow-md bg-muted h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {imageError ? (
        <ImageErrorPanel />
      ) : (
        <img
          src={displaySrc}
          alt={alt}
          className="w-full h-full object-cover cursor-pointer rounded-lg transition-transform duration-300"
          onError={handleImageError}
          onClick={onClick}
        />
      )}
    </div>
  );
}

export default GalleryImage;