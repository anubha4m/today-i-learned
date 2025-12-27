"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, History, Bookmark, Share2 } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Today", icon: PenLine },
    { href: "/history", label: "History", icon: History },
    { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { href: "/share", label: "Share", icon: Share2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 md:relative md:border-t-0 md:border-b md:bg-transparent">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around md:justify-start md:gap-8 py-2 md:py-4">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs md:text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

