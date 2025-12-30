/**
 * Pages Data
 * 
 * Centralized source of truth for all page metadata.
 * Both pages and search index import from here to ensure consistency.
 */

import { createPageMetadata, type PageMetadata } from "./page-metadata";

/**
 * All page metadata definitions
 * This is the single source of truth for page content
 */
export const pagesData: Record<string, PageMetadata> = {
  home: createPageMetadata({
    id: "home",
    title: "Home",
    href: "/",
    description: "Welcome to the Tufts CubeSat project main landing page. Learn about our mission, objectives, and latest updates on the SPACE RACOON satellite project.",
    keywords: ["home", "landing", "main", "overview", "tufts", "cubesat"],
    category: "Main",
    priority: 10,
  }),
  team: createPageMetadata({
    id: "team",
    title: "Team",
    href: "/team",
    description: "Meet our team members, students, faculty advisors, and collaborators working on the CubeSat project. Learn about the people behind SPACE RACOON and their roles in the mission.",
    keywords: ["team", "members", "students", "faculty", "advisors", "collaborators", "people", "staff"],
    category: "About",
    priority: 8,
  }),
  "space-racoon": createPageMetadata({
    id: "space-racoon",
    title: "SPACE RACOON",
    href: "/space-racoon",
    description: "SPACE RACOON mission details, satellite specifications, technical information, project objectives, launch timeline, and mission goals. Learn about the CubeSat design, payload, and scientific objectives.",
    keywords: ["space racoon", "mission", "satellite", "specifications", "technical", "objectives", "launch", "payload", "design", "cubesat"],
    category: "Mission",
    priority: 10,
  }),
  resources: createPageMetadata({
    id: "resources",
    title: "Resources",
    href: "/resources",
    description: "Documentation, guides, research papers, technical documentation, helpful links, and educational resources for the CubeSat project. Access project documentation and learning materials.",
    keywords: ["resources", "documentation", "guides", "papers", "research", "technical", "links", "education", "materials", "docs"],
    category: "Resources",
    priority: 7,
  }),
};

/**
 * Helper to get page metadata by ID
 */
export function getPageMetadata(id: string): PageMetadata | undefined {
  return pagesData[id];
}

/**
 * Helper to get page metadata by href
 */
export function getPageMetadataByHref(href: string): PageMetadata | undefined {
  return Object.values(pagesData).find((page) => page.href === href);
}

