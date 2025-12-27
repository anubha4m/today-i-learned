"use client";

import { useState } from "react";
import { Edit3, Trash2, X, Check, Clock } from "lucide-react";
import Editor from "./Editor";

interface Entry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DayEntryBlockProps {
  date: string;
  entries: Entry[];
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export default function DayEntryBlock({
  date,
  entries,
  onUpdate,
  onDelete,
}: DayEntryBlockProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const startEditing = (entry: Entry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const handleSave = () => {
    if (editingId) {
      onUpdate(editingId, editContent);
      setEditingId(null);
      setEditContent("");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 overflow-hidden">
      {/* Date Header */}
      <div className="px-5 py-4 bg-zinc-800 border-b border-zinc-700">
        <h2 className="text-xl font-semibold text-amber-400">{date}</h2>
        <p className="text-zinc-500 text-sm mt-1">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
      </div>

      {/* Consolidated Entries */}
      <div className="divide-y divide-zinc-700/50">
        {entries.map((entry) => (
          <div key={entry.id} className="p-5">
            {/* Entry Header with Time */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Clock size={14} />
                <span>{formatTime(entry.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                {editingId === entry.id ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={handleSave}
                      className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(entry)}
                      className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Entry Content */}
            {editingId === entry.id ? (
              <Editor content={editContent} onChange={setEditContent} />
            ) : (
              <div
                className="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-blockquote:my-2 prose-pre:my-2"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

