"use client";

import { useState, useEffect } from "react";
import { History, ArrowUpDown, Calendar, Loader2 } from "lucide-react";
import DayEntryBlock from "@/components/DayEntryBlock";

interface Entry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/entries?order=${sortOrder}&days=7`);
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [sortOrder]);

  const handleUpdate = async (id: string, content: string) => {
    try {
      const response = await fetch("/api/entries", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, content }),
      });

      if (response.ok) {
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === id ? { ...entry, content } : entry
          )
        );
      }
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/entries?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, Entry[]>);

  // Sort grouped entries by time within each day
  Object.keys(groupedEntries).forEach((date) => {
    groupedEntries[date].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  });

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <History className="text-amber-400" size={28} />
          <h1 className="text-3xl font-bold text-zinc-100">History</h1>
        </div>
        <button
          onClick={toggleSortOrder}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-zinc-300"
        >
          <ArrowUpDown size={18} />
          {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-2 mb-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 text-zinc-400">
        <Calendar size={18} />
        <span>Showing entries from the last 7 days</span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-amber-400" size={40} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4">
            <History className="text-zinc-500" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">
            No entries yet
          </h3>
          <p className="text-zinc-500">
            Start by creating your first TIL entry!
          </p>
        </div>
      )}

      {/* Entries List - Consolidated by Date */}
      {!isLoading && entries.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, dateEntries], index) => (
            <div
              key={date}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <DayEntryBlock
                date={date}
                entries={dateEntries}
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
