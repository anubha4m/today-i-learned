"use client";

import { useState } from "react";
import {
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Check,
  Link as LinkIcon,
} from "lucide-react";

interface Bookmark {
  id: string;
  url: string;
  title: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onUpdate: (id: string, data: { url?: string; title?: string; notes?: string }) => void;
  onDelete: (id: string) => void;
}

export default function BookmarkCard({
  bookmark,
  onUpdate,
  onDelete,
}: BookmarkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(bookmark.url);
  const [editTitle, setEditTitle] = useState(bookmark.title || "");
  const [editNotes, setEditNotes] = useState(bookmark.notes || "");

  const date = new Date(bookmark.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleSave = () => {
    onUpdate(bookmark.id, {
      url: editUrl,
      title: editTitle,
      notes: editNotes,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditUrl(bookmark.url);
    setEditTitle(bookmark.title || "");
    setEditNotes(bookmark.notes || "");
    setIsEditing(false);
  };

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 overflow-hidden transition-all hover:border-zinc-600">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <LinkIcon size={14} />
            <span>{getDomain(bookmark.url)}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                  title="Save"
                >
                  <Check size={18} />
                </button>
              </>
            ) : (
              <>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                  title="Open link"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => onDelete(bookmark.id)}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">URL</label>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Optional title"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="What did you learn from this?"
                rows={3}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium text-zinc-100 mb-2">
              {bookmark.title || getDomain(bookmark.url)}
            </h3>
            {bookmark.notes && (
              <p className="text-zinc-400 text-sm leading-relaxed">
                {bookmark.notes}
              </p>
            )}
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-amber-400 hover:text-amber-300 truncate max-w-full"
            >
              {bookmark.url}
            </a>
          </>
        )}
      </div>
    </div>
  );
}

