"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, Loader2 } from "lucide-react";
import Editor from "@/components/Editor";
import ReviewModal from "@/components/ReviewModal";
import VisibilitySelector from "@/components/VisibilitySelector";

type Visibility = "private" | "friends" | "public";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [showReview, setShowReview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleSubmit = () => {
    if (!content.trim() || content === "<p></p>") {
      return;
    }
    setShowReview(true);
  };

  const handleSave = async (finalContent: string, finalVisibility: Visibility) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: finalContent, visibility: finalVisibility }),
      });

      if (response.ok) {
        setShowReview(false);
        setContent("");
        setVisibility("private");
        setEditorKey((prev) => prev + 1); // Force editor to remount and clear
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
        <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-lg">
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
          key={editorKey}
          content={content}
          onChange={setContent}
          placeholder="What did you learn today? Share your discoveries, insights, or that 'aha!' moment..."
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <VisibilitySelector value={visibility} onChange={setVisibility} />
        
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || content === "<p></p>"}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-amber-500/20"
        >
          <Send size={20} />
          Review Entry
        </button>
      </div>

      {/* Tips Section */}
      <div className="mt-12 p-6 bg-zinc-800/30 dark:bg-zinc-800/30 light:bg-zinc-100 rounded-xl border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200">
        <h3 className="text-lg font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 mb-3">
          💡 Tips for great TIL entries:
        </h3>
        <ul className="space-y-2 text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
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
          visibility={visibility}
          onSave={handleSave}
          onClose={() => setShowReview(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
