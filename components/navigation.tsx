"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Search } from "./search";

// Simple navigation items - just for the sidebar
const navItems = [
  { name: "Home", href: "/" },
  { name: "Team", href: "/team" },
  { name: "SPACE RACOON", href: "/space-racoon" },
  { name: "Resources", href: "/resources" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black z-50 flex items-center justify-between px-4 md:px-8 shadow-lg">
        {/* Mobile: Hamburger on left, Title on right */}
        <div className="md:hidden flex items-center justify-between w-full">
          <button
            className="p-2 text-white transition-transform duration-200 hover:scale-110 active:scale-95"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <Menu
                className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "opacity-0 rotate-90 scale-0"
                    : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <X
                className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-90 scale-0"
                }`}
              />
            </div>
          </button>
          <h1 className="text-white font-semibold text-lg">Tufts CubeSat</h1>
        </div>

        {/* Desktop: Title on left, Search on right */}
        <div className="hidden md:flex items-center justify-between w-full">
          <h1 className="text-white font-semibold text-xl">Tufts CubeSat</h1>
          <Search />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100%-4rem)] w-64 bg-white z-40 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col justify-center h-full gap-6 px-8">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-lg font-medium transition-all duration-200 relative group ${
                pathname === item.href
                  ? "text-black"
                  : "text-black/60 hover:text-black hover:translate-x-1"
              }`}
              style={{
                transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : "0ms",
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
              <span
                className={`absolute left-0 bottom-0 h-0.5 bg-black transition-all duration-300 ${
                  pathname === item.href ? "w-8" : "w-0 group-hover:w-6"
                }`}
              />
            </Link>
          ))}
        </nav>
        {/* Black vertical bar on the right */}
        <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-black/20" />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100%-4rem)] w-64 flex-col items-center justify-center bg-white">
        <nav className="flex flex-col gap-6 w-full px-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-lg font-medium transition-all duration-200 relative group ${
                pathname === item.href
                  ? "text-black"
                  : "text-black/60 hover:text-black hover:translate-x-1"
              }`}
            >
              {item.name}
              <span
                className={`absolute left-0 bottom-0 h-0.5 bg-black transition-all duration-300 ${
                  pathname === item.href ? "w-8" : "w-0 group-hover:w-6"
                }`}
              />
            </Link>
          ))}
        </nav>
        {/* Black vertical bar on the right */}
        <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-black/20" />
      </aside>
    </>
  );
}
