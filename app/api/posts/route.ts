import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SocialPlatform, PostStatus } from "@prisma/client";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        company: true,
        author: true,
        publishLogs: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, caption, hashtags, platforms, status, scheduledAt, mediaUrl } = body;

    const prismaPlatforms = (platforms || []).map((p: string) =>
      p.toUpperCase() as SocialPlatform
    );

    let prismaStatus: PostStatus = PostStatus.DRAFT;
    if (status === "scheduled") prismaStatus = PostStatus.SCHEDULED;
    else if (status === "publishing" || status === "published") prismaStatus = PostStatus.PUBLISHED;

    const newPost = await prisma.post.create({
      data: {
        companyId: Number(companyId),
        caption,
        hashtags: hashtags || null,
        platforms: prismaPlatforms,
        status: prismaStatus,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: prismaStatus === PostStatus.PUBLISHED ? new Date() : null,
        mediaUrl: mediaUrl || null,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

