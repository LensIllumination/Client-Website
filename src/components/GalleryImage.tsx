interface GalleryImageProps {
  src: string;
  alt: string;
}

function GalleryImage({ src, alt }: GalleryImageProps) {
  return (
    <div className="mb-4 break-inside-avoid overflow-hidden rounded-lg shadow-md">
      <img
        src={src}
        alt={alt}
        className="w-full bg-gray-100"
      />
    </div>
  );
}

export default GalleryImage