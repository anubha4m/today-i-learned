"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Lock, Users, ChevronDown } from "lucide-react";

type Visibility = "private" | "friends" | "public";

interface VisibilitySelectorProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
}

const visibilityOptions: { value: Visibility; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: "private",
    label: "Private",
    description: "Only you can see this",
    icon: Lock,
  },
  {
    value: "friends",
    label: "Friends",
    description: "Only friends can see this",
    icon: Users,
  },
  {
    value: "public",
    label: "Public",
    description: "Anyone can see this",
    icon: Globe,
  },
];

export default function VisibilitySelector({ value, onChange }: VisibilitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = visibilityOptions.find((opt) => opt.value === value) || visibilityOptions[0];
  const Icon = selectedOption.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 rounded-xl text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-200 transition-colors"
      >
        <Icon size={16} />
        <span className="text-sm">{selectedOption.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-zinc-800 dark:bg-zinc-800 light:bg-white border border-zinc-700 dark:border-zinc-700 light:border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fadeIn">
          {visibilityOptions.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-start gap-3 px-4 py-3 w-full text-left transition-colors ${
                  isSelected
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-100"
                }`}
              >
                <OptionIcon size={18} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 light:text-zinc-400">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

