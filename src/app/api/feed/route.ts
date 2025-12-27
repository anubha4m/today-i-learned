import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET friends' feed - entries from people I follow
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get("days") || "7";

  // Get users I'm following
  const following = await prisma.follow.findMany({
    where: {
      followerId: session.user.id,
      status: "accepted",
    },
    select: {
      followingId: true,
    },
  });

  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return NextResponse.json([]);
  }

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(days));

  // Get entries from followed users that are visible to friends
  const entries = await prisma.entry.findMany({
    where: {
      userId: { in: followingIds },
      visibility: { in: ["public", "friends"] },
      createdAt: { gte: daysAgo },
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
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return NextResponse.json(entries);
}

