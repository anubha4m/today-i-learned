"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserPlus,
  UserCheck,
  Bell,
  Search,
  Loader2,
  Check,
  X,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
}

interface FollowRequest {
  id: string;
  follower: User;
  createdAt: string;
}

interface Following {
  id: string;
  following: User;
}

interface Follower {
  id: string;
  follower: User;
}

interface Entry {
  id: string;
  content: string;
  visibility: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

type Tab = "feed" | "following" | "followers" | "requests" | "search";

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [feed, setFeed] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "feed") {
        const res = await fetch("/api/feed?days=7");
        const data = await res.json();
        setFeed(data);
      } else if (activeTab === "requests") {
        const res = await fetch("/api/follow?type=requests");
        const data = await res.json();
        setRequests(data);
      } else if (activeTab === "following") {
        const res = await fetch("/api/follow?type=following");
        const data = await res.json();
        setFollowing(data);
      } else if (activeTab === "followers") {
        const res = await fetch("/api/follow?type=followers");
        const data = await res.json();
        setFollowers(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAcceptRequest = async (followId: string) => {
    try {
      await fetch("/api/follow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followId, action: "accept" }),
      });
      setRequests((prev) => prev.filter((r) => r.id !== followId));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (followId: string) => {
    try {
      await fetch("/api/follow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followId, action: "reject" }),
      });
      setRequests((prev) => prev.filter((r) => r.id !== followId));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      // Remove from search results or mark as followed
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error following:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  const tabs = [
    { id: "feed" as Tab, label: "Feed", icon: Users },
    { id: "following" as Tab, label: "Following", icon: UserCheck },
    { id: "followers" as Tab, label: "Followers", icon: Users },
    { id: "requests" as Tab, label: "Requests", icon: Bell, badge: requests.length },
    { id: "search" as Tab, label: "Find", icon: Search },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Users className="text-amber-400" size={28} />
        <h1 className="text-3xl font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
          Friends
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === id
                ? "bg-amber-500/20 text-amber-400"
                : "bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800"
            }`}
          >
            <Icon size={18} />
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-amber-500 text-zinc-900 rounded-full">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && activeTab !== "search" ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-amber-400" size={40} />
        </div>
      ) : (
        <>
          {/* Feed Tab */}
          {activeTab === "feed" && (
            <div className="space-y-4">
              {feed.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No recent updates from friends.</p>
                  <p className="text-sm mt-1">Follow people to see their learnings here!</p>
                </div>
              ) : (
                feed.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-white border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Link href={`/users/${entry.user.id}`}>
                        {entry.user.image ? (
                          <img
                            src={entry.user.image}
                            alt={entry.user.name || "User"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold">
                            {entry.user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link
                          href={`/users/${entry.user.id}`}
                          className="font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-800 hover:text-amber-400"
                        >
                          {entry.user.name}
                        </Link>
                        <p className="text-xs text-zinc-500">
                          {new Date(entry.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div
                      className="prose prose-invert dark:prose-invert light:prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: entry.content }}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Following Tab */}
          {activeTab === "following" && (
            <div className="space-y-3">
              {following.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
                  <p>You&apos;re not following anyone yet.</p>
                </div>
              ) : (
                following.map(({ id, following: user }) => (
                  <UserCard key={id} user={user} />
                ))
              )}
            </div>
          )}

          {/* Followers Tab */}
          {activeTab === "followers" && (
            <div className="space-y-3">
              {followers.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No followers yet.</p>
                </div>
              ) : (
                followers.map(({ id, follower: user }) => (
                  <UserCard key={id} user={user} />
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No pending follow requests.</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-white border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {request.follower.image ? (
                        <img
                          src={request.follower.image}
                          alt={request.follower.name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold">
                          {request.follower.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-800">
                          {request.follower.name}
                        </p>
                        <p className="text-xs text-zinc-500">{request.follower.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by name or email..."
                  className="flex-1 px-4 py-3 bg-zinc-800 dark:bg-zinc-800 light:bg-white border border-zinc-700 dark:border-zinc-700 light:border-zinc-200 rounded-xl text-zinc-100 dark:text-zinc-100 light:text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 font-medium rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>

              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-white border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-800">
                          {user.name}
                        </p>
                        <p className="text-xs text-zinc-500">{user.bio || user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(user.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 font-medium rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all"
                    >
                      <UserPlus size={16} />
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function UserCard({ user }: { user: User }) {
  return (
    <Link
      href={`/users/${user.id}`}
      className="flex items-center gap-3 p-4 bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-white border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200 rounded-xl hover:border-amber-500/50 transition-colors"
    >
      {user.image ? (
        <img
          src={user.image}
          alt={user.name || "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
      <div>
        <p className="font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-800">
          {user.name}
        </p>
        <p className="text-xs text-zinc-500">{user.bio || user.email}</p>
      </div>
    </Link>
  );
}

