/**
 * Search Index
 * 
 * This file automatically builds the search index from the centralized pages data.
 * This ensures the search index always matches the actual page content.
 */

import { pagesData } from "./pages-data";
import type { PageMetadata } from "./page-metadata";

export interface SearchableItem {
  /** Unique identifier for the item */
  id: string;
  /** Display title/name */
  title: string;
  /** URL path */
  href: string;
  /** Main content/description to search */
  content: string;
  /** Additional keywords for better search matching */
  keywords?: string[];
  /** Category or section */
  category?: string;
  /** Priority/weight for search ranking (higher = more important) */
  priority?: number;
}

/**
 * Convert page metadata to searchable item
 */
function metadataToSearchableItem(metadata: PageMetadata): SearchableItem {
  return {
    id: metadata.id,
    title: metadata.title,
    href: metadata.href,
    content: metadata.description,
    keywords: metadata.keywords,
    category: metadata.category,
    priority: metadata.priority,
  };
}

/**
 * All searchable items in the application
 * Automatically built from centralized pages data
 */
export const searchIndex: SearchableItem[] = Object.values(pagesData).map(
  metadataToSearchableItem
);

/**
 * Search function that filters items based on query
 * 
 * @param query - Search query string
 * @returns Filtered and ranked search results
 */
export function search(query: string): SearchableItem[] {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/);

  // Score each item based on matches
  const scoredItems = searchIndex.map((item) => {
    let score = 0;
    const lowerTitle = item.title.toLowerCase();
    const lowerContent = item.content.toLowerCase();
    const lowerKeywords = item.keywords?.join(" ").toLowerCase() || "";

    // Title matches are highest priority
    if (lowerTitle.includes(lowerQuery)) {
      score += 100;
    } else {
      queryWords.forEach((word) => {
        if (lowerTitle.includes(word)) {
          score += 50;
        }
      });
    }

    // Keyword matches are high priority
    queryWords.forEach((word) => {
      if (lowerKeywords.includes(word)) {
        score += 30;
      }
    });

    // Content matches
    if (lowerContent.includes(lowerQuery)) {
      score += 20;
    } else {
      queryWords.forEach((word) => {
        if (lowerContent.includes(word)) {
          score += 10;
        }
      });
    }

    // Boost by priority
    score += (item.priority || 0) * 2;

    return { item, score };
  });

  // Filter out items with no matches and sort by score
  return scoredItems
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/**
 * Get a content excerpt around a search match
 * 
 * @param content - Full content string
 * @param query - Search query
 * @param excerptLength - Maximum length of excerpt
 * @returns Excerpt with context around match
 */
export function getContentExcerpt(
  content: string,
  query: string,
  excerptLength: number = 120
): string {
  if (!query) {
    return content.length > excerptLength
      ? content.substring(0, excerptLength) + "..."
      : content;
  }

  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerContent.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return content.length > excerptLength
      ? content.substring(0, excerptLength) + "..."
      : content;
  }

  // Try to center the match in the excerpt
  const start = Math.max(0, matchIndex - excerptLength / 2);
  const end = Math.min(content.length, start + excerptLength);

  let excerpt = content.substring(start, end);
  if (start > 0) excerpt = "..." + excerpt;
  if (end < content.length) excerpt = excerpt + "...";

  return excerpt;
}
