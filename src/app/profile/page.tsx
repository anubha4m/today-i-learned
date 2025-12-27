"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Save,
  Loader2,
  Globe,
  Lock,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  isPublic: boolean;
  theme: string;
  createdAt: string;
  _count: {
    entries: number;
    bookmarks: number;
    followers: number;
    following: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setIsPublic(data.isPublic);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, isPublic }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser((prev) => (prev ? { ...prev, ...updated } : null));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
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
    return null;
  }

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <User className="text-amber-400" size={28} />
        <h1 className="text-3xl font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
          Profile
        </h1>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={20} />
          Profile updated successfully!
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-white border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200 rounded-2xl p-6 mb-6">
        {/* Avatar & Stats */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-6 border-b border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200">
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

          <div className="text-center md:text-left">
            <p className="text-zinc-400 text-sm mb-2">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <span className="flex items-center gap-1 text-zinc-500">
                <Calendar size={14} />
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-zinc-400">
              <span>{user._count.entries} entries</span>
              <span>{user._count.bookmarks} bookmarks</span>
              <span>{user._count.followers} followers</span>
              <span>{user._count.following} following</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-zinc-50 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 rounded-xl text-zinc-100 dark:text-zinc-100 light:text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-zinc-50 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 rounded-xl text-zinc-100 dark:text-zinc-100 light:text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none"
            />
            <p className="text-xs text-zinc-500 mt-1">{bio.length}/200 characters</p>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-3">
              Profile Visibility
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  isPublic
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : "bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-400"
                }`}
              >
                <Globe size={18} />
                <div className="text-left">
                  <p className="font-medium">Public</p>
                  <p className="text-xs opacity-70">Anyone can follow</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  !isPublic
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-400"
                }`}
              >
                <Lock size={18} />
                <div className="text-left">
                  <p className="font-medium">Private</p>
                  <p className="text-xs opacity-70">Approve followers</p>
                </div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-amber-500/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

