import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Like an entry
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
    // Check if already liked
    const existing = await prisma.like.findUnique({
      where: {
        userId_entryId: {
          userId: session.user.id,
          entryId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already liked" }, { status: 409 });
    }

    const like = await prisma.like.create({
      data: {
        userId: session.user.id,
        entryId,
      },
    });

    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    console.error("Error liking entry:", error);
    return NextResponse.json({ error: "Failed to like" }, { status: 500 });
  }
}

// DELETE - Unlike an entry
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
    await prisma.like.delete({
      where: {
        userId_entryId: {
          userId: session.user.id,
          entryId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking entry:", error);
    return NextResponse.json({ error: "Failed to unlike" }, { status: 500 });
  }
}

