import { db } from "../firebase";
import { doc, DocumentReference, getDoc, type DocumentData } from "firebase/firestore";

const PROXY_URL = "https://b2-proxy.lensillumination.workers.dev";

export const loadAlbum = async (albumId : string) => {
  const albumSnap = await getDoc(doc(db, "albums", albumId));
  if (!albumSnap.exists()) return null;

  const { name, images: imageRefs } = albumSnap.data();

  // Resolve References to actual image data
  const imageDocs = await Promise.all(
    imageRefs.map((ref: DocumentReference<unknown, DocumentData>) => getDoc(ref))
  );

  return {
    name,
    images: imageDocs.map(snap => ({
      id: snap.id,
      title: snap.data().name,
      // Use thumbnail for src, fallback to file-name if no thumbnail
      src: `${PROXY_URL}/${snap.data()["thumbnail-name"] || snap.data()["file-name"]}`,
      // Store full-size URL for fullscreen
      fullSrc: `${PROXY_URL}/${snap.data()["file-name"]}`
    }))
  };
};