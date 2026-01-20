import { useState } from "react";
import { AlertCircle } from "lucide-react";

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
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 border border-red-200 text-center p-4">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-xs text-red-600 font-semibold">Usage Limit Exceeded</p>
          <p className="text-xs text-red-500/70 mt-1">Backblaze quota limit</p>
        </div>
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