"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Search } from "./search";
import { ThemeToggle } from "./theme-toggle";

// Navigation items with support for dropdowns
const navItems = [
  { name: "Home", href: "/" },
  { name: "Team", href: "/team" },
  { 
    name: "SPACE RACCOON", 
    href: "/space-raccoon",
    children: [
      { name: "Overview", href: "/space-raccoon" },
      { name: "Timeline", href: "/space-raccoon/timeline" },
    ]
  },
  { name: "Resources", href: "/resources" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  
  const toggleDropdown = (itemName: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };
  
  const isActive = (href: string) => {
    if (href === "/space-raccoon") {
      // Only active if exactly /space-raccoon, not subpages
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isDropdownOpen = (item: (typeof navItems)[number]) => {
    if (Object.prototype.hasOwnProperty.call(openDropdowns, item.name)) {
      return openDropdowns[item.name];
    }

    return (
      pathname === item.href ||
      item.children?.some(
        (child) =>
          pathname === child.href || pathname.startsWith(child.href + "/")
      ) === true
    );
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="site-header fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 md:px-8">
        {/* Mobile: Hamburger on left, Logo + Title on right */}
        <div className="md:hidden flex items-center justify-between w-full">
          <button
            className="shell-focus p-2 text-[var(--shell-text)] transition-transform duration-200 hover:scale-110 active:scale-95"
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
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/CubeSat-Logo1.png"
              alt="Tufts CubeSat Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <h1 className="text-[var(--shell-text)] font-semibold text-lg">Tufts CubeSat Team</h1>
          </Link>
        </div>

        {/* Desktop: Logo + Title on left, Search on right */}
        <div className="hidden md:flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/CubeSat-Logo1.png"
              alt="Tufts CubeSat Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <h1 className="text-[var(--shell-text)] font-semibold text-xl">Tufts CubeSat Team</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Search />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/45 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside
        className={`site-sidebar fixed left-0 top-16 h-[calc(100%-4rem)] w-64 z-40 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav aria-label="Main navigation" className="flex flex-col justify-center h-full gap-6 px-8">
          {navItems.map((item, index) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = isDropdownOpen(item);
            const itemActive = isActive(item.href);
            
            return (
              <div key={item.href} style={{
                transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : "0ms",
              }}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`text-lg font-medium transition-all duration-200 relative group flex items-center gap-2 w-full ${
                        itemActive
                          ? "text-black"
                          : "text-black/60 hover:text-black"
                      }`}
                    >
                      {item.name}
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span
                        className={`absolute left-0 bottom-0 h-0.5 bg-black transition-all duration-300 ${
                          itemActive ? "w-8" : "w-0 group-hover:w-6"
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="ml-4 mt-2 flex flex-col gap-3">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`text-base font-medium transition-all duration-200 relative group ${
                                childActive
                                  ? "text-black"
                                  : "text-black/60 hover:text-black hover:translate-x-1"
                              }`}
                            >
                              {child.name}
                              <span
                                className={`absolute left-0 bottom-0 h-0.5 bg-black transition-all duration-300 ${
                                  childActive ? "w-6" : "w-0 group-hover:w-4"
                                }`}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-lg font-medium transition-all duration-200 relative group ${
                      itemActive
                        ? "text-black"
                        : "text-black/60 hover:text-black hover:translate-x-1"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                    <span
                      className={`absolute left-0 bottom-0 h-0.5 bg-black transition-all duration-300 ${
                        itemActive ? "w-8" : "w-0 group-hover:w-6"
                      }`}
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
        <div className="absolute right-0 top-0 bottom-0 w-px bg-[var(--shell-border)]" />
        <div className="absolute bottom-6 left-8">
          <ThemeToggle />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="site-sidebar hidden md:flex fixed left-0 top-16 h-[calc(100%-4rem)] w-64 flex-col items-center justify-center">
        <nav aria-label="Main navigation" className="flex flex-col gap-6 w-full px-8">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = isDropdownOpen(item);
            const itemActive = isActive(item.href);
            
            return (
              <div key={item.href}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`text-lg font-medium transition-all duration-200 relative group flex items-center gap-2 w-full ${
                        itemActive
                          ? "text-black"
                          : "text-black/60 hover:text-black"
                      }`}
                    >
                      {item.name}
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span
                        className={`absolute left-0 bottom-0 h-0.5 bg-black transition-all duration-300 ${
                          itemActive ? "w-8" : "w-0 group-hover:w-6"
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="ml-4 mt-2 flex flex-col gap-3">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`text-base font-medium transition-all duration-200 relative group ${
                                childActive
                                  ? "text-black"
                                  : "text-black/60 hover:text-black hover:translate-x-1"
                              }`}
                            >
                              {child.name}
                              <span
                                className={`absolute left-0 bottom-0 h-0.5 bg-black transition-all duration-300 ${
                                  childActive ? "w-6" : "w-0 group-hover:w-4"
                                }`}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-lg font-medium transition-all duration-200 relative group ${
                      itemActive
                        ? "text-black"
                        : "text-black/60 hover:text-black hover:translate-x-1"
                    }`}
                  >
                    {item.name}
                    <span
                      className={`absolute left-0 bottom-0 h-0.5 bg-black transition-all duration-300 ${
                        itemActive ? "w-8" : "w-0 group-hover:w-6"
                      }`}
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
        <div className="absolute right-0 top-0 bottom-0 w-px bg-[var(--shell-border)]" />
      </aside>
    </>
  );
}
