"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  Search,
  Plus,
  X,
  Copy,
  Check,
  Loader2,
  BookOpen,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";

interface Entry {
  id: string;
  content: string;
  createdAt: string;
}

interface Bookmark {
  id: string;
  url: string;
  title: string | null;
  notes: string | null;
}

export default function SharePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkSearch, setBookmarkSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, bookmarksRes] = await Promise.all([
        fetch("/api/entries?days=7"),
        fetch("/api/bookmarks"),
      ]);
      const entriesData = await entriesRes.json();
      const bookmarksData = await bookmarksRes.json();
      setEntries(entriesData);
      setBookmarks(bookmarksData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEntry = (entry: Entry) => {
    setSelectedEntries((prev) =>
      prev.find((e) => e.id === entry.id)
        ? prev.filter((e) => e.id !== entry.id)
        : [...prev, entry]
    );
  };

  const addBookmark = (bookmark: Bookmark) => {
    if (!selectedBookmarks.find((b) => b.id === bookmark.id)) {
      setSelectedBookmarks((prev) => [...prev, bookmark]);
    }
    setBookmarkSearch("");
  };

  const removeBookmark = (id: string) => {
    setSelectedBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      !selectedBookmarks.find((sb) => sb.id === b.id) &&
      (b.url.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
        b.title?.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
        b.notes?.toLowerCase().includes(bookmarkSearch.toLowerCase()))
  );

  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const generateShareText = () => {
    let text = "✨ What I Learned Recently\n";
    text += "═".repeat(30) + "\n\n";

    if (customNote) {
      text += customNote + "\n\n";
    }

    if (selectedEntries.length > 0) {
      selectedEntries.forEach((entry) => {
        const date = formatDate(entry.createdAt);
        text += `📅 ${date}\n`;
        text += stripHtml(entry.content) + "\n\n";
      });
    }

    if (selectedBookmarks.length > 0) {
      text += "📚 Helpful Resources\n";
      text += "─".repeat(20) + "\n";
      selectedBookmarks.forEach((bookmark) => {
        text += `• ${bookmark.title || bookmark.url}\n`;
        text += `  ${bookmark.url}\n`;
        if (bookmark.notes) {
          text += `  💡 ${bookmark.notes}\n`;
        }
        text += "\n";
      });
    }

    text += "─".repeat(30) + "\n";
    text += "Shared from Today I Learned 📝";

    return text;
  };

  const copyToClipboard = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const hasContent = selectedEntries.length > 0 || selectedBookmarks.length > 0 || customNote;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Share2 className="text-amber-400" size={28} />
        <h1 className="text-3xl font-bold text-zinc-100">Share with Friends</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Select Content */}
        <div className="space-y-6">
          {/* Custom Note */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-4">
            <h3 className="text-lg font-semibold text-zinc-200 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              Add a Personal Note
            </h3>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Hey! Check out what I learned this week..."
              rows={3}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Select Entries */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-4">
            <h3 className="text-lg font-semibold text-zinc-200 mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-amber-400" />
              Select Entries to Share
            </h3>
            {entries.length === 0 ? (
              <p className="text-zinc-500 text-sm">No entries yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {entries.map((entry) => {
                  const isSelected = selectedEntries.find((e) => e.id === entry.id);
                  return (
                    <button
                      key={entry.id}
                      onClick={() => toggleEntry(entry)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-100"
                          : "bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-500 mb-1">
                            {formatDate(entry.createdAt)}
                          </p>
                          <p className="text-sm truncate">
                            {stripHtml(entry.content).substring(0, 80)}...
                          </p>
                        </div>
                        {isSelected && (
                          <Check size={16} className="text-amber-400 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Bookmarks */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-4">
            <h3 className="text-lg font-semibold text-zinc-200 mb-3 flex items-center gap-2">
              <LinkIcon size={18} className="text-amber-400" />
              Add Bookmarks
            </h3>

            {/* Selected Bookmarks */}
            {selectedBookmarks.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedBookmarks.map((bookmark) => (
                  <span
                    key={bookmark.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-200"
                  >
                    {bookmark.title || new URL(bookmark.url).hostname}
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="hover:text-amber-100"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Bookmarks */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500"
                size={16}
              />
              <input
                type="text"
                value={bookmarkSearch}
                onChange={(e) => setBookmarkSearch(e.target.value)}
                placeholder="Search bookmarks to add..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            {/* Bookmark Results */}
            {bookmarkSearch && filteredBookmarks.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {filteredBookmarks.slice(0, 5).map((bookmark) => (
                  <button
                    key={bookmark.id}
                    onClick={() => addBookmark(bookmark)}
                    className="w-full text-left p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-700/50 transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} className="text-amber-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200 truncate">
                        {bookmark.title || bookmark.url}
                      </p>
                      {bookmark.notes && (
                        <p className="text-xs text-zinc-500 truncate">{bookmark.notes}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {bookmarkSearch && filteredBookmarks.length === 0 && (
              <p className="mt-2 text-zinc-500 text-sm">No matching bookmarks found</p>
            )}
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-4 h-fit sticky top-4">
          <h3 className="text-lg font-semibold text-zinc-200 mb-3">Preview</h3>

          {!hasContent ? (
            <div className="text-center py-10 text-zinc-500">
              <Share2 size={40} className="mx-auto mb-3 opacity-50" />
              <p>Select entries or add bookmarks to preview your share</p>
            </div>
          ) : (
            <>
              <div className="bg-zinc-900 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono">
                  {generateShareText()}
                </pre>
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-semibold rounded-xl transition-all"
              >
                {copied ? (
                  <>
                    <Check size={20} />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={20} />
                    Copy to Share
                  </>
                )}
              </button>

              <p className="text-center text-zinc-500 text-sm mt-3">
                Paste in your favorite messaging app
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

