"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    document.documentElement.style.colorScheme = nextIsDark ? "dark" : "light";
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="shell-focus inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--shell-border)] text-[var(--shell-muted)] transition-colors hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]"
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
    >
      <Sun className="theme-icon-light hidden h-[18px] w-[18px]" aria-hidden />
      <Moon className="theme-icon-dark h-[18px] w-[18px]" aria-hidden />
    </button>
  );
}
