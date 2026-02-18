import { useState } from "react";
import ImageErrorPanel from "@/components/ImageErrorPanel";
import { Loader2 } from "lucide-react";

interface GalleryImageProps {
  src: string;
  alt: string;
  onClick?: () => void;
}

function GalleryImage({ src, alt, onClick }: GalleryImageProps) {
  const [imageError, setImageError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    // Try full-size if thumbnail fails; otherwise show error
    if (!useFallback) {
      setUseFallback(true);
      setIsLoading(true);
    } else {
      setImageError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const displaySrc = useFallback ? src.replace("/thumb-", "/") : src;

  return (
    <div className="relative mb-2 break-inside-avoid overflow-hidden rounded shadow-md bg-muted h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {imageError ? (
        <ImageErrorPanel />
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 animate-fade-in">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <img
            src={displaySrc}
            alt={alt}
            className={`w-full h-full object-cover cursor-pointer rounded transition-all duration-500 ${isLoading ? 'opacity-0' : 'opacity-100 animate-fade-in-scale'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            onClick={onClick}
          />
        </>
      )}
    </div>
  );
}

export default GalleryImage;