import React from "react";
import { loadAlbum } from "./lib/LoadAlbum";
import GalleryImage from "./components/GalleryImage";

interface Album {
  name: string;
  images: Array<{ id: string; src: string; title: string }>;
}

export function Gallery({ albumId }: { albumId: string }) {
  const [album, setAlbum] = React.useState<Album | null>(null);


  React.useEffect(() => {
    loadAlbum(albumId).then(setAlbum);
  }, [albumId]);

  if (!album) return <p>Loading...</p>;

  return (
    <div className="w-full flex justify-center px-2">
      <div
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 max-w-6xl w-full"
      >
        {album.images.map((img) => (
          <GalleryImage key={img.id} src={img.src} alt={img.title} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full flex justify-center px-2">
      <div
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 max-w-6xl w-full"
      >
        {displayImages.map((img) => (
          <GalleryImage key={img.id} src={img.src} alt={img.title} />
        ))}
      </div>
    </div>
  );
}