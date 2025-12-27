"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit3, Trash2, X, Check } from "lucide-react";
import Editor from "./Editor";

interface Entry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface EntryCardProps {
  entry: Entry;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export default function EntryCard({
  entry,
  onUpdate,
  onDelete,
}: EntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);

  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSave = () => {
    onUpdate(entry.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(entry.content);
    setIsEditing(false);
  };

  // Get preview text (first 150 chars without HTML)
  const getPreviewText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 overflow-hidden transition-all hover:border-zinc-600">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-amber-400 font-medium">{formattedDate}</p>
            <p className="text-zinc-500 text-sm">{formattedTime}</p>
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
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
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
          <Editor content={editContent} onChange={setEditContent} />
        ) : (
          <>
            {isExpanded ? (
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            ) : (
              <p className="text-zinc-300">{getPreviewText(entry.content)}</p>
            )}
          </>
        )}
      </div>

      {!isEditing && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors border-t border-zinc-700"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={18} />
              <span className="text-sm">Show less</span>
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              <span className="text-sm">Show more</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

