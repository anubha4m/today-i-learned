"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Calendar, Globe, Lock, Loader2, ArrowLeft } from "lucide-react";
import FollowButton from "@/components/FollowButton";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  isPublic: boolean;
  createdAt: string;
  followStatus: "accepted" | "pending" | null;
  isFollowing: boolean;
  _count: {
    entries: number;
    followers: number;
    following: number;
  };
}

interface Entry {
  id: string;
  content: string;
  visibility: string;
  createdAt: string;
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState<"accepted" | "pending" | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id && id) {
      // Redirect to profile page if viewing own profile
      if (id === session.user.id) {
        router.push("/profile");
        return;
      }
      fetchUserData();
    }
  }, [session?.user?.id, id, router]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch user profile
      const userRes = await fetch(`/api/users?id=${id}`);
      if (!userRes.ok) {
        router.push("/friends");
        return;
      }
      const userData = await userRes.json();
      setUser(userData);
      setFollowStatus(userData.followStatus);

      // Fetch user's entries (visible based on relationship)
      const entriesRes = await fetch(`/api/entries?userId=${id}&days=30`);
      if (entriesRes.ok) {
        const entriesData = await entriesRes.json();
        setEntries(entriesData);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <User size={48} className="mx-auto mb-4 text-zinc-500" />
        <p className="text-zinc-400">User not found</p>
        <Link href="/friends" className="text-amber-400 hover:underline mt-2 inline-block">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Profile Header */}
      <div className="bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-white border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
                {user.name}
              </h1>
              {user.isPublic ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <Globe size={12} />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-700/50 px-2 py-1 rounded-full">
                  <Lock size={12} />
                  Private
                </span>
              )}
            </div>

            {user.bio && (
              <p className="text-zinc-400 mb-3">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
              <span>{user._count.entries} public entries</span>
              <span>{user._count.followers} followers</span>
              <span>{user._count.following} following</span>
            </div>
          </div>

          {/* Follow Button */}
          <FollowButton
            userId={user.id}
            initialStatus={followStatus}
            onStatusChange={setFollowStatus}
          />
        </div>
      </div>

      {/* Entries */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 mb-4">
          Recent Learnings
        </h2>

        {entries.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800/30 dark:bg-zinc-800/30 light:bg-zinc-100 rounded-xl">
            <p className="text-zinc-500">
              {followStatus === "accepted" || user.isPublic
                ? "No visible entries yet."
                : "Follow this user to see their friends-only entries."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-white border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500">
                  <span>
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    {entry.visibility === "public" ? <Globe size={12} /> : <Lock size={12} />}
                    {entry.visibility}
                  </span>
                </div>
                <div
                  className="prose prose-invert dark:prose-invert light:prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

