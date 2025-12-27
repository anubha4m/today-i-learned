import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all entries (with optional date filtering for history)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const order = searchParams.get("order") || "desc";
  const days = searchParams.get("days");

  let dateFilter = {};
  if (days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    dateFilter = {
      createdAt: {
        gte: daysAgo,
      },
    };
  }

  const entries = await prisma.entry.findMany({
    where: dateFilter,
    orderBy: {
      createdAt: order === "asc" ? "asc" : "desc",
    },
  });

  return NextResponse.json(entries);
}

// POST create new entry
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const entry = await prisma.entry.create({
    data: {
      content,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

// PUT update entry
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, content } = body;

  if (!id || !content) {
    return NextResponse.json(
      { error: "ID and content are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.entry.update({
    where: { id },
    data: { content },
  });

  return NextResponse.json(entry);
}

// DELETE entry
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID is required" },
      { status: 400 }
    );
  }

  await prisma.entry.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

