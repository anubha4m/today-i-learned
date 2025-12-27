import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get saved entries
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const savedEntries = await prisma.savedEntry.findMany({
    where: { userId: session.user.id },
    include: {
      entry: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(savedEntries);
}

// POST - Save an entry
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entryId } = body;

  if (!entryId) {
    return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
  }

  try {
    // Check if already saved
    const existing = await prisma.savedEntry.findUnique({
      where: {
        userId_entryId: {
          userId: session.user.id,
          entryId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already saved" }, { status: 409 });
    }

    const saved = await prisma.savedEntry.create({
      data: {
        userId: session.user.id,
        entryId,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Error saving entry:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// DELETE - Unsave an entry
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const entryId = searchParams.get("entryId");

  if (!entryId) {
    return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
  }

  try {
    await prisma.savedEntry.delete({
      where: {
        userId_entryId: {
          userId: session.user.id,
          entryId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsaving entry:", error);
    return NextResponse.json({ error: "Failed to unsave" }, { status: 500 });
  }
}

