const ACCESS_STORAGE_PREFIX = "lens-illumination-access";

export type AccessKind = "album" | "folder";

export type AccessRecord = {
  isPublic?: boolean;
  passwordEnabled?: boolean;
  passwordHash?: string | null;
  kind?: string;
  folderId?: string | null;
};

export const getAccessStorageKey = (kind: AccessKind, id: string) => `${ACCESS_STORAGE_PREFIX}:${kind}:${id}`;

export const readStoredAccessHash = (kind: AccessKind, id: string) => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(getAccessStorageKey(kind, id));
};

export const storeAccessHash = (kind: AccessKind, id: string, hash: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getAccessStorageKey(kind, id), hash);
};

export const clearStoredAccessHash = (kind: AccessKind, id: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getAccessStorageKey(kind, id));
};

export const hashPassword = async (password: string) => {
  const normalized = password.trim();
  const encoded = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};
