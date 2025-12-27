import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET follow requests and following/followers lists
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type"); // "requests", "followers", "following"

  if (type === "requests") {
    // Get pending follow requests to me
    const requests = await prisma.follow.findMany({
      where: {
        followingId: session.user.id,
        status: "pending",
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  }

  if (type === "followers") {
    // Get my accepted followers
    const followers = await prisma.follow.findMany({
      where: {
        followingId: session.user.id,
        status: "accepted",
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(followers);
  }

  if (type === "following") {
    // Get users I'm following
    const following = await prisma.follow.findMany({
      where: {
        followerId: session.user.id,
        status: "accepted",
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(following);
  }

  return NextResponse.json({ error: "Type required" }, { status: 400 });
}

// POST create a follow request
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  // Check if user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isPublic: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: userId,
      },
    },
  });

  if (existingFollow) {
    return NextResponse.json(
      { error: "Already following or request pending" },
      { status: 409 }
    );
  }

  // If target user is public, auto-accept. If private, set to pending
  const status = targetUser.isPublic ? "accepted" : "pending";

  const follow = await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: userId,
      status,
    },
  });

  return NextResponse.json(follow, { status: 201 });
}

// PATCH accept or reject a follow request
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { followId, action } = body; // action: "accept" or "reject"

  if (!followId || !action) {
    return NextResponse.json(
      { error: "Follow ID and action required" },
      { status: 400 }
    );
  }

  // Get the follow request
  const follow = await prisma.follow.findUnique({
    where: { id: followId },
  });

  if (!follow || follow.followingId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "reject") {
    await prisma.follow.delete({
      where: { id: followId },
    });
    return NextResponse.json({ success: true, action: "rejected" });
  }

  if (action === "accept") {
    const updated = await prisma.follow.update({
      where: { id: followId },
      data: { status: "accepted" },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// DELETE unfollow a user
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  // Delete the follow relationship
  await prisma.follow.deleteMany({
    where: {
      followerId: session.user.id,
      followingId: userId,
    },
  });

  return NextResponse.json({ success: true });
}

