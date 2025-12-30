/**
 * Page Metadata System
 * 
 * This system allows pages to define their own metadata (title, description, keywords, etc.)
 * which is then used by both the page itself and the search index.
 * This ensures consistency between what's displayed and what's searchable.
 */

export interface PageMetadata {
  /** Unique identifier for the page */
  id: string;
  /** Display title */
  title: string;
  /** URL path */
  href: string;
  /** Page description (used in search and can be displayed on page) */
  description: string;
  /** Additional keywords for search */
  keywords?: string[];
  /** Category or section */
  category?: string;
  /** Priority/weight for search ranking (higher = more important) */
  priority?: number;
}

/**
 * Helper to create page metadata with defaults
 */
export function createPageMetadata(metadata: PageMetadata): PageMetadata {
  return {
    priority: 5,
    ...metadata,
  };
}

