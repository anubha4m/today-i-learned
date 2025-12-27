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
  Bookmark,
} from "lucide-react";
import FeedEntryCard from "@/components/FeedEntryCard";

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
  isLiked: boolean;
  isSaved: boolean;
  likesCount: number;
  commentsCount: number;
}

type Tab = "feed" | "following" | "followers" | "requests" | "saved" | "search";

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [feed, setFeed] = useState<Entry[]>([]);
  const [savedEntries, setSavedEntries] = useState<Entry[]>([]);
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
      } else if (activeTab === "saved") {
        const res = await fetch("/api/saved");
        const data = await res.json();
        setSavedEntries(data.map((s: { entry: Entry }) => ({
          ...s.entry,
          isLiked: false,
          isSaved: true,
          likesCount: s.entry.likesCount || 0,
          commentsCount: s.entry.commentsCount || 0,
        })));
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
    { id: "saved" as Tab, label: "Saved", icon: Bookmark },
    { id: "following" as Tab, label: "Following", icon: UserCheck },
    { id: "followers" as Tab, label: "Followers", icon: Users },
    { id: "requests" as Tab, label: "Requests", icon: Bell, badge: requests.length },
    { id: "search" as Tab, label: "Find", icon: Search },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-amber-400" size={28} />
        <h1 className="text-2xl md:text-3xl font-bold theme-text">Friends</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl whitespace-nowrap transition-colors text-sm ${
              activeTab === id
                ? "bg-amber-500/20 text-amber-400"
                : "theme-bg-tertiary theme-text-muted hover:theme-text"
            }`}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-zinc-900 rounded-full">
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
                <div className="text-center py-12 theme-text-muted">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No recent updates from friends.</p>
                  <p className="text-sm mt-1">Follow people to see their learnings here!</p>
                </div>
              ) : (
                feed.map((entry) => (
                  <FeedEntryCard key={entry.id} entry={entry} />
                ))
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === "saved" && (
            <div className="space-y-4">
              {savedEntries.length === 0 ? (
                <div className="text-center py-12 theme-text-muted">
                  <Bookmark size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No saved entries yet.</p>
                  <p className="text-sm mt-1">Save entries from your feed to read later!</p>
                </div>
              ) : (
                savedEntries.map((entry) => (
                  <FeedEntryCard key={entry.id} entry={entry} />
                ))
              )}
            </div>
          )}

          {/* Following Tab */}
          {activeTab === "following" && (
            <div className="space-y-3">
              {following.length === 0 ? (
                <div className="text-center py-12 theme-text-muted">
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
                <div className="text-center py-12 theme-text-muted">
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
                <div className="text-center py-12 theme-text-muted">
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No pending follow requests.</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 theme-card border theme-border rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {request.follower.image ? (
                        <img
                          src={request.follower.image}
                          alt={request.follower.name || "User"}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold flex-shrink-0">
                          {request.follower.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium theme-text truncate">
                          {request.follower.name}
                        </p>
                        <p className="text-xs theme-text-muted truncate">{request.follower.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
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
                  className="flex-1 px-4 py-3 theme-input rounded-xl"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 md:px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 font-medium rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>

              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 theme-card border theme-border rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium theme-text truncate">{user.name}</p>
                        <p className="text-xs theme-text-muted truncate">{user.bio || user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(user.id)}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 font-medium rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all flex-shrink-0"
                    >
                      <UserPlus size={16} />
                      <span className="hidden sm:inline">Follow</span>
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
      className="flex items-center gap-3 p-4 theme-card border theme-border rounded-xl hover:border-amber-500/50 transition-colors"
    >
      {user.image ? (
        <img
          src={user.image}
          alt={user.name || "User"}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold flex-shrink-0">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-medium theme-text truncate">{user.name}</p>
        <p className="text-xs theme-text-muted truncate">{user.bio || user.email}</p>
      </div>
    </Link>
  );
}
