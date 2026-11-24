import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        socialAccounts: true,
        _count: {
          select: {
            posts: true,
            tasks: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(companies);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, industry, initials, website } = body;

    const company = await prisma.company.create({
      data: {
        name,
        industry,
        initials,
        website: website || null,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    await prisma.company.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Company and all associated data deleted from database." });
  } catch (error: any) {
    console.error("Delete company error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

