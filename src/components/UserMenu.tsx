"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, Settings, LogOut, Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function UserMenu() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-medium rounded-xl transition-all"
      >
        Sign In
      </Link>
    );
  }

  const userInitial = session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-zinc-200 transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold text-sm">
            {userInitial}
          </div>
        )}
        <ChevronDown
          size={16}
          className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-800 dark:bg-zinc-800 light:bg-white border border-zinc-700 dark:border-zinc-700 light:border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fadeIn">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-zinc-700 dark:border-zinc-700 light:border-zinc-200">
            <p className="text-sm font-medium text-zinc-100 dark:text-zinc-100 light:text-zinc-900 truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 truncate">
              {session.user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-100 transition-colors"
            >
              <User size={18} />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-100 transition-colors"
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>

            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex items-center gap-3 px-4 py-2 w-full text-left text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-100 transition-colors"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-zinc-700 dark:border-zinc-700 light:border-zinc-200 py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/auth/signin" });
              }}
              className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-400 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-100 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

