import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFileFromDisk } from "@/lib/media-storage";

const MEDIA_PUBLIC_SELECT = {
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
} as const;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get("companyId");
    const fileTypeParam = searchParams.get("fileType");

    const where: { companyId?: number; fileType?: string } = {};
    if (companyIdParam && companyIdParam !== "all" && Number(companyIdParam) > 0) {
      where.companyId = Number(companyIdParam);
    }
    if (fileTypeParam && fileTypeParam !== "all") {
      where.fileType = fileTypeParam;
    }

    const media = await prisma.media.findMany({
      where,
      select: MEDIA_PUBLIC_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(media);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch media";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, fileName, fileUrl, fileType, mimeType, fileSize } = body;

    if (!companyId || !fileName) {
      return NextResponse.json(
        { error: "companyId and fileName are required" },
        { status: 400 }
      );
    }

    const newMedia = await prisma.media.create({
      data: {
        companyId: Number(companyId),
        fileName,
        fileUrl: fileUrl || "/previews/placeholder.png",
        fileType: fileType || "image",
        mimeType: mimeType || null,
        fileSize: typeof fileSize === "number" ? fileSize : null,
      },
      select: MEDIA_PUBLIC_SELECT,
    });

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save media";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const mediaId = Number(id);
    const existing = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { id: true, fileUrl: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    await prisma.media.delete({
      where: { id: mediaId },
    });

    await deleteFileFromDisk(existing.fileUrl);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete media";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
