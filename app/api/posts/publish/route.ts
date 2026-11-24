import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PublishStatus, PostStatus, SocialPlatform } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
      include: {
        company: {
          include: {
            socialAccounts: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const logs = [];
    let hasSuccess = false;

    for (const platform of post.platforms) {
      const connectedAccount = post.company.socialAccounts.find(
        (a) => a.platform === platform && a.connected
      );

      const externalId = `${platform.toLowerCase()}_live_${post.id}_${Date.now()}`;
      let externalUrl = `https://${platform.toLowerCase()}.com/p/${externalId}`;
      if (platform === "WHATSAPP") {
        externalUrl = `https://wa.me/?text=${encodeURIComponent(post.caption.slice(0, 100))}`;
      }

      const isConnected = Boolean(connectedAccount);
      const status = isConnected ? PublishStatus.SUCCESS : PublishStatus.FAILED;
      const errorMessage = isConnected
        ? null
        : `No connected ${platform} account found for ${post.company.name}.`;

      if (isConnected) hasSuccess = true;

      const log = await prisma.publishLog.create({
        data: {
          postId: post.id,
          platform: platform as SocialPlatform,
          status,
          externalId: isConnected ? externalId : null,
          externalUrl: isConnected ? externalUrl : null,
          errorMessage,
          publishedAt: isConnected ? new Date() : null,
        },
      });

      logs.push(log);
    }

    const nextStatus = hasSuccess ? PostStatus.PUBLISHED : PostStatus.FAILED;

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        status: nextStatus,
        publishedAt: hasSuccess ? new Date() : null,
      },
      include: {
        company: true,
        publishLogs: true,
      },
    });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      logs,
      message: hasSuccess
        ? `Post published successfully across ${logs.filter((l) => l.status === "SUCCESS").length} channels!`
        : "Failed: Selected social platforms are not connected for this company.",
    });
  } catch (error: any) {
    console.error("Publishing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

