import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all entries (with optional date filtering for history)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const order = searchParams.get("order") || "desc";
  const days = searchParams.get("days");
  const userId = searchParams.get("userId"); // For viewing other users' entries
  const visibility = searchParams.get("visibility"); // Filter by visibility

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

  // If viewing own entries, show all
  // If viewing another user's entries, apply visibility filtering
  let whereClause: {
    createdAt?: { gte: Date };
    userId?: string;
    visibility?: string | { in: string[] };
  } = { ...dateFilter };

  if (userId && userId !== session.user.id) {
    // Viewing another user's entries - check if we're friends
    const friendship = await prisma.follow.findFirst({
      where: {
        followerId: session.user.id,
        followingId: userId,
        status: "accepted",
      },
    });

    const isFriend = !!friendship;

    whereClause.userId = userId;
    if (isFriend) {
      // Friends can see public and friends-only entries
      whereClause.visibility = { in: ["public", "friends"] };
    } else {
      // Non-friends can only see public entries
      whereClause.visibility = "public";
    }
  } else {
    // Viewing own entries
    whereClause.userId = session.user.id;
    if (visibility) {
      whereClause.visibility = visibility;
    }
  }

  const entries = await prisma.entry.findMany({
    where: whereClause,
    orderBy: {
      createdAt: order === "asc" ? "asc" : "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json(entries);
}

// POST create new entry
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, visibility = "private" } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const entry = await prisma.entry.create({
    data: {
      content,
      visibility,
      userId: session.user.id,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

// PUT update entry
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, content, visibility } = body;

  if (!id || !content) {
    return NextResponse.json(
      { error: "ID and content are required" },
      { status: 400 }
    );
  }

  // Verify ownership
  const existingEntry = await prisma.entry.findUnique({
    where: { id },
  });

  if (!existingEntry || existingEntry.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const entry = await prisma.entry.update({
    where: { id },
    data: {
      content,
      ...(visibility && { visibility }),
    },
  });

  return NextResponse.json(entry);
}

// DELETE entry
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
  const existingEntry = await prisma.entry.findUnique({
    where: { id },
  });

  if (!existingEntry || existingEntry.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.entry.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
