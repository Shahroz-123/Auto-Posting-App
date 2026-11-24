import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("companyId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory in public folder
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean filename and create unique timestamped name
    const ext = path.extname(file.name) || (file.type.startsWith("image/") ? ".png" : ".mp4");
    const sanitizedBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);
    const uniqueFileName = `${Date.now()}-${sanitizedBase}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    // Determine type
    const fileType = file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("image/")
      ? "image"
      : "graphic";

    let mediaRecord = null;
    if (companyId && Number(companyId)) {
      mediaRecord = await prisma.media.create({
        data: {
          companyId: Number(companyId),
          fileName: file.name,
          fileUrl: publicUrl,
          fileType,
        },
        include: {
          company: true,
        },
      });
    }

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
      fileType,
      size: file.size,
      mediaRecord,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

