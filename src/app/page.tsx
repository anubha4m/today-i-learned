"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import Editor from "@/components/Editor";
import ReviewModal from "@/components/ReviewModal";

export default function Home() {
  const [content, setContent] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    if (!content.trim() || content === "<p></p>") {
      return;
    }
    setShowReview(true);
  };

  const handleSave = async (finalContent: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: finalContent }),
      });

      if (response.ok) {
        setShowReview(false);
        setContent("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="text-amber-400" size={32} />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            Today I Learned
          </h1>
        </div>
        <p className="text-zinc-400 text-lg">
          Capture your daily discoveries and insights
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-center animate-fadeIn">
          ✨ Your learning has been saved!
        </div>
      )}

      {/* Editor */}
      <div className="mb-6">
        <Editor
          content={content}
          onChange={setContent}
          placeholder="What did you learn today? Share your discoveries, insights, or that 'aha!' moment..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || content === "<p></p>"}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-amber-500/20"
        >
          <Send size={20} />
          Submit Entry
        </button>
      </div>

      {/* Tips Section */}
      <div className="mt-12 p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
        <h3 className="text-lg font-semibold text-zinc-200 mb-3">
          💡 Tips for great TIL entries:
        </h3>
        <ul className="space-y-2 text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            Be specific about what you learned
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            Include code snippets or examples when relevant
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            Note the context or problem that led to this learning
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            Save bookmarks to reference materials for later
          </li>
        </ul>
      </div>

      {/* Review Modal */}
      {showReview && (
        <ReviewModal
          content={content}
          onSave={handleSave}
          onClose={() => setShowReview(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
