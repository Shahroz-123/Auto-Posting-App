import fs from "fs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUploadDiskPath } from "@/lib/media-storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = Number(id);

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        mimeType: true,
        data: true,
      },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const contentType = media.mimeType || "application/octet-stream";
    const safeFileName = media.fileName.replace(/["\r\n]/g, "");

    if (media.data) {
      const body = Buffer.from(media.data);
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(body.byteLength),
          "Content-Disposition": `inline; filename="${safeFileName}"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const diskPath = resolveUploadDiskPath(media.fileUrl);
    if (diskPath && fs.existsSync(diskPath)) {
      const fileBuffer = await fs.promises.readFile(diskPath);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(fileBuffer.byteLength),
          "Content-Disposition": `inline; filename="${safeFileName}"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return NextResponse.json(
      { error: "Media binary not available in storage" },
      { status: 404 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to serve media";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

