import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all bookmarks (with optional search)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");

  let whereClause: {
    userId: string;
    OR?: { url?: { contains: string }; title?: { contains: string }; notes?: { contains: string } }[];
  } = {
    userId: session.user.id,
  };

  if (search) {
    whereClause = {
      userId: session.user.id,
      OR: [
        { url: { contains: search } },
        { title: { contains: search } },
        { notes: { contains: search } },
      ],
    };
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(bookmarks);
}

// POST create new bookmark
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url, title, notes } = body;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      url,
      title,
      notes,
      userId: session.user.id,
    },
  });

  return NextResponse.json(bookmark, { status: 201 });
}

// PUT update bookmark
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, url, title, notes } = body;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // Verify ownership
  const existingBookmark = await prisma.bookmark.findUnique({
    where: { id },
  });

  if (!existingBookmark || existingBookmark.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bookmark = await prisma.bookmark.update({
    where: { id },
    data: {
      ...(url && { url }),
      ...(title !== undefined && { title }),
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json(bookmark);
}

// DELETE bookmark
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // Verify ownership
  const existingBookmark = await prisma.bookmark.findUnique({
    where: { id },
  });

  if (!existingBookmark || existingBookmark.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.bookmark.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
