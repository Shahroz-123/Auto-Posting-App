import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskPriority } from "@prisma/client";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        company: true,
        assignedTo: true,
      },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, title, priority, dueDate } = body;

    const task = await prisma.task.create({
      data: {
        companyId: Number(companyId),
        title,
        priority: (priority?.toUpperCase() as TaskPriority) || TaskPriority.MEDIUM,
        dueDate: new Date(dueDate),
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, completed } = body;

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { completed: Boolean(completed) },
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

