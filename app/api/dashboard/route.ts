import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const companyFilter =
      companyId && companyId !== "all" ? { companyId: Number(companyId) } : {};

    const [totalCompanies, scheduledPosts, publishedPosts, completedTasks, companiesList] =
      await Promise.all([
        prisma.company.count(),
        prisma.post.count({ where: { ...companyFilter, status: "SCHEDULED" } }),
        prisma.post.count({ where: { ...companyFilter, status: "PUBLISHED" } }),
        prisma.task.count({ where: { ...companyFilter, completed: true } }),
        prisma.company.findMany({
          include: {
            _count: {
              select: {
                posts: true,
                tasks: true,
                socialAccounts: true,
              },
            },
          },
          orderBy: { id: "asc" },
        }),
      ]);

    const draftPosts = await prisma.post.count({ where: { ...companyFilter, status: "DRAFT" } });
    const inReviewPosts = await prisma.post.count({ where: { ...companyFilter, status: "IN_REVIEW" } });

    return NextResponse.json({
      stats: {
        totalCompanies,
        scheduledPosts,
        publishedPosts,
        completedTasks,
      },
      pipeline: {
        draft: draftPosts,
        inReview: inReviewPosts,
        scheduled: scheduledPosts,
        published: publishedPosts,
      },
      companies: companiesList,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

