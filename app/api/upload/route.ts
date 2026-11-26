import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_DB_BLOB_BYTES,
  MAX_UPLOAD_SIZE_BYTES,
  inferMediaType,
  saveFileToDisk,
} from "@/lib/media-storage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyIdRaw = formData.get("companyId") as string | null;
    const requestedType = formData.get("fileType") as string | null;
    const customName = formData.get("fileName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum 50 MB upload limit" },
        { status: 413 }
      );
    }

    if (file.type && !ALLOWED_MEDIA_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 415 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "application/octet-stream";
    const fileType = inferMediaType(mimeType, requestedType);
    const displayName = (customName && customName.trim()) || file.name;

    const storeInDb = buffer.byteLength <= MAX_DB_BLOB_BYTES;
    // Always write to disk for large files (>10MB), and best-effort for smaller files
    const diskUrl = await saveFileToDisk(buffer, displayName, mimeType);

    if (!storeInDb && !diskUrl) {
      return NextResponse.json(
        { error: "File is too large for database storage and disk storage is unavailable" },
        { status: 500 }
      );
    }

    const companyId = companyIdRaw ? Number(companyIdRaw) : NaN;
    let mediaRecord = null;
    let publicUrl = diskUrl || "";

    if (Number.isInteger(companyId) && companyId > 0) {
      const created = await prisma.media.create({
        data: {
          companyId,
          fileName: displayName,
          fileUrl: diskUrl || "/api/media/pending",
          fileType,
          mimeType,
          fileSize: buffer.byteLength,
          data: storeInDb ? buffer : null,
        },
        select: {
          id: true,
        },
      });

      if (storeInDb) {
        publicUrl = `/api/media/${created.id}/file`;
      }

      mediaRecord = await prisma.media.update({
        where: { id: created.id },
        data: { fileUrl: publicUrl },
        select: {
          id: true,
          companyId: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          mimeType: true,
          fileSize: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      url: publicUrl,
      fileName: displayName,
      fileType,
      mimeType,
      size: buffer.byteLength,
      mediaRecord,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
