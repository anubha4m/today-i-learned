"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Send, X } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface Entry {
  id: string;
  content: string;
  visibility: string;
  createdAt: string;
  user: User;
  isLiked: boolean;
  isSaved: boolean;
  likesCount: number;
  commentsCount: number;
}

interface FeedEntryCardProps {
  entry: Entry;
}

export default function FeedEntryCard({ entry }: FeedEntryCardProps) {
  const [isLiked, setIsLiked] = useState(entry.isLiked);
  const [isSaved, setIsSaved] = useState(entry.isSaved);
  const [likesCount, setLikesCount] = useState(entry.likesCount);
  const [commentsCount, setCommentsCount] = useState(entry.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await fetch(`/api/likes?entryId=${entry.id}`, { method: "DELETE" });
      } else {
        await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId: entry.id }),
        });
      }
    } catch {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleSave = async () => {
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);

    try {
      if (wasSaved) {
        await fetch(`/api/saved?entryId=${entry.id}`, { method: "DELETE" });
      } else {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId: entry.id }),
        });
      }
    } catch {
      setIsSaved(wasSaved);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) return;
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?entryId=${entry.id}`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id, content: newComment }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentsCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="theme-card border theme-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4">
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
          <div className="flex-1 min-w-0">
            <Link
              href={`/users/${entry.user.id}`}
              className="font-medium theme-text hover:text-amber-400 transition-colors"
            >
              {entry.user.name}
            </Link>
            <p className="text-xs theme-text-muted">
              {new Date(entry.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t theme-border flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${
            isLiked ? "text-red-500" : "theme-text-muted hover:text-red-500"
          }`}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span className="text-sm">{likesCount > 0 ? likesCount : ""}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className={`flex items-center gap-1.5 transition-colors ${
            showComments ? "text-amber-400" : "theme-text-muted hover:text-amber-400"
          }`}
        >
          <MessageCircle size={20} />
          <span className="text-sm">{commentsCount > 0 ? commentsCount : ""}</span>
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 transition-colors ${
            isSaved ? "text-amber-400" : "theme-text-muted hover:text-amber-400"
          }`}
        >
          <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 border-t theme-border theme-bg-secondary">
          {isLoadingComments ? (
            <p className="text-sm theme-text-muted text-center py-4">Loading comments...</p>
          ) : (
            <>
              {/* Comments List */}
              <div className="space-y-3 mb-4">
                {comments.length === 0 ? (
                  <p className="text-sm theme-text-muted text-center py-2">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      {comment.user.image ? (
                        <img
                          src={comment.user.image}
                          alt={comment.user.name || "User"}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold text-xs flex-shrink-0">
                          {comment.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="theme-card rounded-lg px-3 py-2">
                          <p className="text-xs font-medium theme-text">{comment.user.name}</p>
                          <p className="text-sm theme-text-secondary">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-[10px] theme-text-muted">
                            {new Date(comment.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-[10px] text-red-400 hover:text-red-300"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 text-sm theme-input rounded-lg"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="p-2 bg-amber-500 text-zinc-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

