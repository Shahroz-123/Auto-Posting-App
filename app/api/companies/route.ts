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

