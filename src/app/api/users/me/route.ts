import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET current user's profile
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      isPublic: true,
      theme: true,
      createdAt: true,
      _count: {
        select: {
          entries: true,
          bookmarks: true,
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

  return NextResponse.json(user);
}

// PATCH update current user's profile
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, bio, isPublic, theme } = body;

  const updateData: {
    name?: string;
    bio?: string;
    isPublic?: boolean;
    theme?: string;
  } = {};

  if (name !== undefined) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (isPublic !== undefined) updateData.isPublic = isPublic;
  if (theme !== undefined) updateData.theme = theme;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      isPublic: true,
      theme: true,
    },
  });

  return NextResponse.json(user);
}

