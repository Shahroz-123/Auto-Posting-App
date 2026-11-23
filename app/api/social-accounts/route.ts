import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SocialPlatform } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const where = companyId ? { companyId: Number(companyId) } : {};

    const accounts = await prisma.socialAccount.findMany({
      where,
      include: {
        credential: true,
        company: {
          select: { id: true, name: true, initials: true },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, platform, accountName, accessToken, connected = true } = body;

    if (!companyId || !platform || !accountName) {
      return NextResponse.json(
        { error: "companyId, platform, and accountName are required" },
        { status: 400 }
      );
    }

    const platformEnum = platform.toUpperCase() as SocialPlatform;

    // Check if an account already exists for this company + platform
    const existing = await prisma.socialAccount.findFirst({
      where: {
        companyId: Number(companyId),
        platform: platformEnum,
      },
      include: { credential: true },
    });

    let socialAccount;

    if (existing) {
      socialAccount = await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accountName,
          connected: Boolean(connected),
        },
      });

      if (accessToken) {
        if (existing.credential) {
          await prisma.oAuthCredential.update({
            where: { id: existing.credential.id },
            data: { accessToken, updatedAt: new Date() },
          });
        } else {
          await prisma.oAuthCredential.create({
            data: {
              companyId: Number(companyId),
              socialAccountId: existing.id,
              platform: platformEnum,
              accessToken,
            },
          });
        }
      }
    } else {
      socialAccount = await prisma.socialAccount.create({
        data: {
          companyId: Number(companyId),
          platform: platformEnum,
          accountName,
          connected: Boolean(connected),
          credential: accessToken
            ? {
                create: {
                  companyId: Number(companyId),
                  platform: platformEnum,
                  accessToken,
                },
              }
            : undefined,
        },
        include: { credential: true },
      });
    }

    return NextResponse.json(socialAccount, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const companyId = searchParams.get("companyId");
    const platform = searchParams.get("platform");

    if (id) {
      await prisma.socialAccount.delete({
        where: { id: Number(id) },
      });
      return NextResponse.json({ success: true, message: "Account deleted" });
    }

    if (companyId && platform) {
      const platformEnum = platform.toUpperCase() as SocialPlatform;
      await prisma.socialAccount.updateMany({
        where: {
          companyId: Number(companyId),
          platform: platformEnum,
        },
        data: {
          connected: false,
        },
      });
      return NextResponse.json({ success: true, message: "Account disconnected" });
    }

    return NextResponse.json(
      { error: "id or (companyId and platform) required" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

