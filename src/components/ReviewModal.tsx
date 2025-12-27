"use client";

import { useState } from "react";
import { X, Edit3, Save, Globe, Lock, Users } from "lucide-react";
import Editor from "./Editor";

type Visibility = "private" | "friends" | "public";

interface ReviewModalProps {
  content: string;
  visibility: Visibility;
  onSave: (content: string, visibility: Visibility) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const visibilityOptions: { value: Visibility; label: string; icon: React.ElementType }[] = [
  { value: "private", label: "Private", icon: Lock },
  { value: "friends", label: "Friends", icon: Users },
  { value: "public", label: "Public", icon: Globe },
];

export default function ReviewModal({
  content,
  visibility: initialVisibility,
  onSave,
  onClose,
  isLoading = false,
}: ReviewModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);

  const handleSave = () => {
    onSave(editedContent, visibility);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 dark:bg-zinc-900 light:bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-zinc-700 dark:border-zinc-700 light:border-zinc-200 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700 dark:border-zinc-700 light:border-zinc-200">
          <h2 className="text-xl font-semibold text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
            Review Your Entry
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {editMode ? (
            <Editor content={editedContent} onChange={setEditedContent} />
          ) : (
            <div
              className="prose prose-invert dark:prose-invert light:prose max-w-none bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-zinc-100 rounded-xl p-4 border border-zinc-700 dark:border-zinc-700 light:border-zinc-200"
              dangerouslySetInnerHTML={{ __html: editedContent }}
            />
          )}
        </div>

        {/* Visibility Selector */}
        <div className="px-4 py-3 border-t border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200">
          <p className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mb-2">
            Who can see this entry?
          </p>
          <div className="flex gap-2">
            {visibilityOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setVisibility(value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  visibility === value
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 text-zinc-400 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 hover:border-zinc-600"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-zinc-700 dark:border-zinc-700 light:border-zinc-200 bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-zinc-50">
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 dark:bg-zinc-700 light:bg-zinc-200 hover:bg-zinc-600 dark:hover:bg-zinc-600 light:hover:bg-zinc-300 transition-colors text-zinc-200 dark:text-zinc-200 light:text-zinc-700"
          >
            <Edit3 size={18} />
            {editMode ? "Preview" : "Edit"}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-700 dark:bg-zinc-700 light:bg-zinc-200 hover:bg-zinc-600 dark:hover:bg-zinc-600 light:hover:bg-zinc-300 transition-colors text-zinc-200 dark:text-zinc-200 light:text-zinc-700"
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
