"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Settings, Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
    <div className="animate-fadeIn max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-amber-400" size={28} />
        <h1 className="text-3xl font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
          Settings
        </h1>
      </div>

      {/* Theme Settings */}
      <div className="bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-white border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 mb-4">
          Appearance
        </h2>

        <div>
          <label className="block text-sm font-medium text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-3">
            Theme
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-xl border transition-all ${
                theme === "dark"
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                  : "bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <Moon size={24} />
              <div className="text-left">
                <p className="font-medium">Dark</p>
                <p className="text-xs opacity-70">Easy on the eyes</p>
              </div>
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-xl border transition-all ${
                theme === "light"
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                  : "bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <Sun size={24} />
              <div className="text-left">
                <p className="font-medium">Light</p>
                <p className="text-xs opacity-70">Bright and clear</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-white border border-zinc-700/50 dark:border-zinc-700/50 light:border-zinc-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 mb-4">
          Account
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Email</label>
            <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
              {session.user?.email}
            </p>
          </div>

          <div>
            <label className="block text-sm text-zinc-500 mb-1">Name</label>
            <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
              {session.user?.name || "Not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

