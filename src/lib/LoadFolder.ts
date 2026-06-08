import { db } from "../firebase";
import { collection, doc, getDoc, getDocs, query, where, type DocumentData, type DocumentReference } from "firebase/firestore";

const PROXY_URL = "https://b2-proxy.lensillumination.workers.dev";

type LoadedImage = {
  id: string;
  title: string;
  src: string;
  fullSrc: string;
};

type LoadedAlbumSummary = {
  id: string;
  name: string;
  heroImage: LoadedImage | null;
  imagesCount: number;
  isPublic: boolean;
};

export type LoadedFolder = {
  id: string;
  name: string;
  isPublic: boolean;
  passwordEnabled?: boolean;
  passwordHash?: string | null;
  coverAlbumId?: string | null;
  createdAt?: any;
  albums: LoadedAlbumSummary[];
  coverImage: LoadedImage | null;
};

export type FolderMeta = {
  id: string;
  name: string;
  isPublic: boolean;
  passwordEnabled: boolean;
  passwordHash: string | null;
  coverAlbumId: string | null;
  createdAt?: any;
};

const resolveImageAsset = async (imageRef: DocumentReference<unknown, DocumentData> | null | undefined) => {
  if (!imageRef) return null;

  const imageDoc = await getDoc(imageRef);
  if (!imageDoc.exists()) return null;

  const imageData = imageDoc.data() as any;
  return {
    id: imageDoc.id,
    title: imageData.name,
    src: `${PROXY_URL}/${imageData["thumbnail-name"] || imageData["file-name"]}`,
    fullSrc: `${PROXY_URL}/${imageData["file-name"]}`,
  } satisfies LoadedImage;
};

const resolveFolderCover = async (coverAlbumId: string | null | undefined) => {
  if (!coverAlbumId) return null;

  const albumSnap = await getDoc(doc(db, "albums", coverAlbumId));
  if (!albumSnap.exists()) return null;

  const albumData = albumSnap.data() as any;
  if (albumData.kind === "folder") return null;

  const heroImage = await resolveImageAsset(albumData.heroImage);
  if (heroImage) return heroImage;

  const firstImageRef = Array.isArray(albumData.images) ? albumData.images[0] : null;
  return resolveImageAsset(firstImageRef);
};

export const loadFolderMeta = async (folderId: string): Promise<FolderMeta | null> => {
  const folderSnap = await getDoc(doc(db, "albums", folderId));
  if (folderSnap.exists()) {
    const folderData = folderSnap.data() as any;
    if (folderData.kind === "folder") {
      return {
        id: folderSnap.id,
        name: folderData.name,
        isPublic: folderData.isPublic ?? true,
        passwordEnabled: folderData.passwordEnabled ?? false,
        passwordHash: folderData.passwordHash ?? null,
        coverAlbumId: folderData.coverAlbumId ?? null,
        createdAt: folderData.createdAt,
      };
    }
  }

  const legacyFolderSnap = await getDoc(doc(db, "folders", folderId));
  if (!legacyFolderSnap.exists()) return null;

  const folderData = legacyFolderSnap.data() as any;

  return {
    id: legacyFolderSnap.id,
    name: folderData.name,
    isPublic: folderData.isPublic ?? true,
    passwordEnabled: folderData.passwordEnabled ?? false,
    passwordHash: folderData.passwordHash ?? null,
    coverAlbumId: folderData.coverAlbumId ?? null,
    createdAt: folderData.createdAt,
  };
};

export const loadFolderAlbums = async (folderId: string): Promise<LoadedAlbumSummary[]> => {
  const childSnap = await getDocs(query(collection(db, "albums"), where("folderId", "==", folderId)));
  const albums: LoadedAlbumSummary[] = [];

  for (const childDoc of childSnap.docs) {
    const childData = childDoc.data() as any;
    if (childData.kind === "folder") continue;

    albums.push({
      id: childDoc.id,
      name: childData.name,
      heroImage: await resolveImageAsset(childData.heroImage),
      imagesCount: Array.isArray(childData.images) ? childData.images.length : 0,
      isPublic: childData.isPublic ?? true,
    });
  }

  albums.sort((a, b) => a.name.localeCompare(b.name));
  return albums;
};

export const loadFolder = async (folderId: string): Promise<LoadedFolder | null> => {
  const folderMeta = await loadFolderMeta(folderId);
  if (!folderMeta) return null;

  return {
    ...folderMeta,
    albums: await loadFolderAlbums(folderMeta.id),
    coverImage: await resolveFolderCover(folderMeta.coverAlbumId ?? null),
  };
};
