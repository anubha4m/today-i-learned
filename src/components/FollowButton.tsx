"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Clock, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  initialStatus: "accepted" | "pending" | null;
  onStatusChange?: (status: "accepted" | "pending" | null) => void;
}

export default function FollowButton({
  userId,
  initialStatus,
  onStatusChange,
}: FollowButtonProps) {
  const [status, setStatus] = useState<"accepted" | "pending" | null>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        const newStatus = data.status as "accepted" | "pending";
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/follow?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStatus(null);
        onStatusChange?.(null);
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-zinc-400 rounded-xl cursor-not-allowed"
      >
        <Loader2 className="animate-spin" size={16} />
        Loading...
      </button>
    );
  }

  if (status === "accepted") {
    return (
      <button
        onClick={handleUnfollow}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-red-500/20 hover:text-red-400 text-zinc-300 rounded-xl transition-colors group"
      >
        <UserCheck size={16} />
        <span className="group-hover:hidden">Following</span>
        <span className="hidden group-hover:inline">Unfollow</span>
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button
        onClick={handleUnfollow}
        className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-colors group"
      >
        <Clock size={16} />
        <span className="group-hover:hidden">Pending</span>
        <span className="hidden group-hover:inline">Cancel</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-medium rounded-xl transition-all"
    >
      <UserPlus size={16} />
      Follow
    </button>
  );
}

