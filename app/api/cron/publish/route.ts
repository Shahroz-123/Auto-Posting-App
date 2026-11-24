import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostStatus, PublishStatus, SocialPlatform } from "@prisma/client";

export async function GET(req: Request) {
  return handleCronPublish();
}

export async function POST(req: Request) {
  return handleCronPublish();
}

async function handleCronPublish() {
  try {
    const now = new Date();

    // Find all scheduled posts whose time has arrived
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        company: {
          include: {
            socialAccounts: true,
          },
        },
      },
    });

    const results = [];

    for (const post of scheduledPosts) {
      let hasSuccess = false;
      const logs = [];

      for (const platform of post.platforms) {
        const connectedAccount = post.company.socialAccounts.find(
          (a) => a.platform === platform && a.connected
        );

        const externalId = `${platform.toLowerCase()}_cron_${post.id}_${Date.now()}`;
        const isConnected = Boolean(connectedAccount);
        const status = isConnected ? PublishStatus.SUCCESS : PublishStatus.FAILED;

        if (isConnected) hasSuccess = true;

        const log = await prisma.publishLog.create({
          data: {
            postId: post.id,
            platform: platform as SocialPlatform,
            status,
            externalId: isConnected ? externalId : null,
            externalUrl: `https://${platform.toLowerCase()}.com/post/${externalId}`,
            errorMessage: isConnected
              ? null
              : `Account disconnected for ${post.company.name}`,
            publishedAt: isConnected ? new Date() : null,
          },
        });
        logs.push(log);
      }

      const updated = await prisma.post.update({
        where: { id: post.id },
        data: {
          status: hasSuccess ? PostStatus.PUBLISHED : PostStatus.FAILED,
          publishedAt: hasSuccess ? new Date() : null,
        },
      });

      results.push({
        postId: post.id,
        company: post.company.name,
        published: hasSuccess,
        logsCount: logs.length,
      });
    }

    return NextResponse.json({
      success: true,
      processedCount: scheduledPosts.length,
      results,
      executedAt: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Cron auto-publish error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

