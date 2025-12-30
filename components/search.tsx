"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { search, getContentExcerpt, type SearchableItem } from "@/lib/search-index";

/**
 * Highlight matching text in a string with React elements
 */
function highlightText(text: string, query: string): (string | React.ReactElement)[] {
  if (!query) return [text];

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="bg-yellow-200 text-black font-medium">
        {part}
      </span>
    ) : (
      part
    )
  );
}

interface SearchProps {
  /** Custom className for the search container */
  className?: string;
  /** Custom width for desktop search (default: w-96) */
  width?: string;
}

export function Search({ className = "", width = "w-96" }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchableItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Update results when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = search(searchQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = () => {
    setSearchQuery("");
    setIsFocused(false);
  };

  return (
    <div ref={searchRef} className={`relative ${width} ${className}`}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
        <input
          type="text"
          placeholder="Search pages and content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full bg-white/10 text-white placeholder:text-white/60 rounded-lg pl-10 pr-4 py-2 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
          aria-label="Search"
          aria-expanded={isFocused && results.length > 0}
          aria-haspopup="listbox"
        />
      </div>

      {/* Search Results Dropdown */}
      {isFocused && searchQuery && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-black/10 overflow-hidden max-h-96 overflow-y-auto z-50">
          {results.length > 0 ? (
            <div className="py-2" role="listbox">
              {results.map((item) => {
                const excerpt = getContentExcerpt(item.content, searchQuery);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={handleResultClick}
                    className="block px-4 py-3 hover:bg-black/5 transition-colors duration-150 border-b border-black/5 last:border-b-0"
                    role="option"
                  >
                    <div className="font-medium text-black mb-1">
                      {highlightText(item.title, searchQuery)}
                    </div>
                    {item.category && (
                      <div className="text-xs text-black/40 mb-1 font-medium uppercase tracking-wide">
                        {item.category}
                      </div>
                    )}
                    <div className="text-xs text-black/50 mb-1 font-mono">{item.href}</div>
                    <div className="text-sm text-black/70 line-clamp-2">
                      {highlightText(excerpt, searchQuery)}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-3 text-black/60 text-sm" role="status">
              No results found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

