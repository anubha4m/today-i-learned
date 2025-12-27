"use client";

import { useState } from "react";
import { X, Edit3, Save } from "lucide-react";
import Editor from "./Editor";

interface ReviewModalProps {
  content: string;
  onSave: (content: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ReviewModal({
  content,
  onSave,
  onClose,
  isLoading = false,
}: ReviewModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    onSave(editedContent);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-zinc-700 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-100">
            Review Your Entry
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {editMode ? (
            <Editor content={editedContent} onChange={setEditedContent} />
          ) : (
            <div
              className="prose prose-invert max-w-none bg-zinc-800/50 rounded-xl p-4 border border-zinc-700"
              dangerouslySetInnerHTML={{ __html: editedContent }}
            />
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-zinc-700 bg-zinc-800/50">
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors text-zinc-200"
          >
            <Edit3 size={18} />
            {editMode ? "Preview" : "Edit"}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors text-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isLoading ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

