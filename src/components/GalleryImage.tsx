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
    <div className="relative mb-4 break-inside-avoid overflow-hidden rounded-lg shadow-md bg-gray-100 h-full">
      {imageError ? (
        <ImageErrorPanel />
      ) : (
        <img
          src={displaySrc}
          alt={alt}
          className="w-full h-full object-cover bg-gray-100 cursor-pointer"
          onError={handleImageError}
          onClick={onClick}
        />
      )}
    </div>
  );
}

export default GalleryImage;