import fs from "fs";
import path from "path";

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_DB_BLOB_BYTES = 10 * 1024 * 1024; // 10 MB stored directly in PostgreSQL

export const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

export type MediaAssetType = "image" | "video" | "graphic";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Infers the normalized asset category from MIME type and optional user override.
 */
export function inferMediaType(
  mimeType: string,
  requestedType?: string | null
): MediaAssetType {
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  if (requestedType === "graphic" || mimeType === "image/svg+xml") {
    return "graphic";
  }
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  return "graphic";
}

/**
 * Generates a safe unique filename for disk storage.
 */
export function buildUniqueFileName(originalName: string, mimeType: string): string {
  const fallbackExt = mimeType.startsWith("video/")
    ? ".mp4"
    : mimeType === "image/svg+xml"
      ? ".svg"
      : ".png";
  const ext = path.extname(originalName).toLowerCase() || fallbackExt;
  const sanitizedBase = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);

  return `${Date.now()}-${sanitizedBase || "asset"}${ext}`;
}

/**
 * Best-effort write to public/uploads for local dev and large video files.
 * Returns the public URL if written, or null if the filesystem is read-only.
 */
export async function saveFileToDisk(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string | null> {
  try {
    await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
    const uniqueFileName = buildUniqueFileName(originalName, mimeType);
    const targetPath = path.join(UPLOADS_DIR, uniqueFileName);
    await fs.promises.writeFile(targetPath, buffer);
    return `/uploads/${uniqueFileName}`;
  } catch (err) {
    console.warn("Disk upload skipped/failed (falling back to DB storage):", err);
    return null;
  }
}

/**
 * Safely resolves a `/uploads/...` URL inside public/uploads to prevent path traversal.
 */
export function resolveUploadDiskPath(fileUrl: string): string | null {
  if (!fileUrl.startsWith("/uploads/")) {
    return null;
  }
  const relativeName = path.basename(fileUrl.slice("/uploads/".length));
  if (!relativeName) {
    return null;
  }
  const resolved = path.resolve(UPLOADS_DIR, relativeName);
  if (!resolved.startsWith(path.resolve(UPLOADS_DIR))) {
    return null;
  }
  return resolved;
}

/**
 * Deletes an uploaded file from public/uploads if it exists.
 */
export async function deleteFileFromDisk(fileUrl: string): Promise<void> {
  const diskPath = resolveUploadDiskPath(fileUrl);
  if (!diskPath) return;

  try {
    await fs.promises.unlink(diskPath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") {
      console.warn("Failed to remove file from disk:", err);
    }
  }
}

