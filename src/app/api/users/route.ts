import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET search users or get user by ID
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const userId = searchParams.get("id");

  if (userId) {
    // Get specific user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        isPublic: true,
        createdAt: true,
        _count: {
          select: {
            entries: {
              where: { visibility: "public" },
            },
            followers: {
              where: { status: "accepted" },
            },
            following: {
              where: { status: "accepted" },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check follow status
    const followStatus = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    return NextResponse.json({
      ...user,
      followStatus: followStatus?.status || null,
      isFollowing: followStatus?.status === "accepted",
    });
  }

  if (search) {
    // Search users
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } }, // Exclude self
          {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        isPublic: true,
      },
      take: 20,
    });

    return NextResponse.json(users);
  }

  return NextResponse.json({ error: "Search query required" }, { status: 400 });
}

