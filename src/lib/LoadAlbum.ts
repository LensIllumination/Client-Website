import { db } from "../firebase";
import { doc, DocumentReference, getDoc, type DocumentData } from "firebase/firestore";

const PROXY_URL = "https://b2-proxy.lensillumination.workers.dev";

export const loadAlbum = async (albumId : string) => {
  const albumSnap = await getDoc(doc(db, "albums", albumId));
  if (!albumSnap.exists()) return null;

  const { name, images: imageRefs, heroImage: heroImageRef } = albumSnap.data();

  // Resolve References to actual image data
  const imageDocs = await Promise.all(
    imageRefs.map((ref: DocumentReference<unknown, DocumentData>) => getDoc(ref))
  );

  // Resolve hero image if set
  let heroImage = null;
  if (heroImageRef) {
    const heroDoc = await getDoc(heroImageRef);
    if (heroDoc.exists()) {
      const heroData = heroDoc.data() as any;
      heroImage = {
        id: heroDoc.id,
        title: heroData.name,
        src: `${PROXY_URL}/${heroData["thumbnail-name"] || heroData["file-name"]}`,
        fullSrc: `${PROXY_URL}/${heroData["file-name"]}`
      };
    }
  }

  return {
    name,
    heroImage,
    images: imageDocs.map(snap => {
      const data = snap.data() as any;
      return {
        id: snap.id,
        title: data.name,
        // Use thumbnail for src, fallback to file-name if no thumbnail
        src: `${PROXY_URL}/${data["thumbnail-name"] || data["file-name"]}`,
        // Store full-size URL for fullscreen
        fullSrc: `${PROXY_URL}/${data["file-name"]}`
      };
    })
  };
};