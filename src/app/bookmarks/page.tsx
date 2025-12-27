"use client";

import { useState, useEffect } from "react";
import { Bookmark, Search, Plus, Loader2, Link as LinkIcon, X } from "lucide-react";
import BookmarkCard from "@/components/BookmarkCard";

interface BookmarkType {
  id: string;
  url: string;
  title: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchBookmarks = async (search?: string) => {
    try {
      const url = search ? `/api/bookmarks?search=${encodeURIComponent(search)}` : "/api/bookmarks";
      const response = await fetch(url);
      const data = await response.json();
      setBookmarks(data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchBookmarks(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: newUrl,
          title: newTitle || null,
          notes: newNotes || null,
        }),
      });

      if (response.ok) {
        const newBookmark = await response.json();
        setBookmarks((prev) => [newBookmark, ...prev]);
        setNewUrl("");
        setNewTitle("");
        setNewNotes("");
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdate = async (id: string, data: { url?: string; title?: string; notes?: string }) => {
    try {
      const response = await fetch("/api/bookmarks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...data }),
      });

      if (response.ok) {
        const updatedBookmark = await response.json();
        setBookmarks((prev) =>
          prev.map((bookmark) =>
            bookmark.id === id ? updatedBookmark : bookmark
          )
        );
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bookmark?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bookmarks?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bookmark className="text-amber-400" size={28} />
          <h1 className="text-3xl font-bold text-zinc-100">Bookmarks</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-semibold rounded-xl transition-all"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? "Cancel" : "Add Bookmark"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="mb-8 p-6 bg-zinc-800/50 rounded-xl border border-zinc-700 animate-fadeIn"
        >
          <h3 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
            <LinkIcon size={20} className="text-amber-400" />
            Add New Bookmark
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                URL <span className="text-amber-500">*</span>
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/article"
                required
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Title (optional)
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Give it a memorable title"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="What did you learn from this resource?"
                rows={3}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAdding || !newUrl.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                Save Bookmark
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500"
          size={20}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bookmarks by URL, title, or notes..."
          className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-amber-400" size={40} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && bookmarks.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4">
            <Bookmark className="text-zinc-500" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">
            {searchQuery ? "No bookmarks found" : "No bookmarks yet"}
          </h3>
          <p className="text-zinc-500">
            {searchQuery
              ? "Try a different search term"
              : "Save your learning resources for easy reference!"}
          </p>
        </div>
      )}

      {/* Bookmarks Grid */}
      {!isLoading && bookmarks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {bookmarks.map((bookmark, index) => (
            <div
              key={bookmark.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <BookmarkCard
                bookmark={bookmark}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

