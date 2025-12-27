"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, History, Bookmark, Share2, Users } from "lucide-react";
import UserMenu from "./UserMenu";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Today", icon: PenLine },
    { href: "/history", label: "History", icon: History },
    { href: "/friends", label: "Friends", icon: Users },
    { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { href: "/share", label: "Share", icon: Share2 },
  ];

  // Don't show navigation on auth pages
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 dark:bg-zinc-900/95 light:bg-white/95 backdrop-blur-lg border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 md:relative md:border-t-0 md:border-b md:bg-transparent z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around md:justify-between items-center py-2 md:py-4">
          {/* Navigation Links */}
          <div className="flex justify-around md:justify-start md:gap-6 flex-1 md:flex-initial">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-zinc-100"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs md:text-sm font-medium">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu - Desktop only in nav, mobile has bottom position */}
          <div className="hidden md:block">
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Mobile User Menu - Fixed position in top right */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <UserMenu />
      </div>
    </nav>
  );
}
