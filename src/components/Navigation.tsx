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
    <>
      {/* Mobile Header with User Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 theme-bg border-b theme-border backdrop-blur-lg bg-opacity-95">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold theme-accent">TIL</h1>
          <UserMenu />
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block relative border-b theme-border">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Navigation Links */}
            <div className="flex gap-6">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      isActive
                        ? "text-amber-400 bg-amber-500/10"
                        : "theme-text-secondary hover:theme-text hover:bg-opacity-10 hover:bg-amber-500"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 theme-bg border-t theme-border backdrop-blur-lg bg-opacity-95 safe-bottom">
        <div className="flex justify-around items-center py-2 px-2">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0 ${
                  isActive
                    ? "text-amber-400 bg-amber-500/10"
                    : "theme-text-muted"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
