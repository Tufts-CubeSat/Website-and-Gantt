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
    description: "The Tufts CubeSat team is executing the SPACE RACCOON mission, a 14-month initiative to develop a compact 2U satellite for detecting, classifying, and assessing space debris in Low Earth Orbit using advanced computer vision and machine learning.",
    keywords: ["home", "landing", "main", "overview", "tufts", "cubesat", "space raccoon", "debris detection", "satellite"],
    category: "Main",
    priority: 10,
  }),
  team: createPageMetadata({
    id: "team",
    title: "Meet Our Team",
    href: "/team",
    description: "Meet our team members and collaborators working on the CubeSat project. ",
    keywords: ["team", "members", "students", "faculty", "advisors", "collaborators", "people", "staff"],
    category: "About",
    priority: 8,
  }),
  "space-racoon": createPageMetadata({
    id: "space-racoon",
    title: "SPACE RACOON",
    href: "/space-racoon",
    description: "The initiative aims to build and launch a satellite to detect, classify, and assess the risk of collisions with space debris in Low Earth Orbit using onboard computer vision and machine learning within a compact 2U satellite. As part of this effort, SPACE RACCOON will provide open-source, high-fidelity data on debris location and size to support safer orbital operations and future mission planning.",
    keywords: ["space racoon", "mission", "satellite", "specifications", "technical", "objectives", "launch", "payload", "design", "cubesat"],
    category: "Mission",
    priority: 10,
  }),
  "space-racoon-timeline": createPageMetadata({
    id: "space-racoon-timeline",
    title: "Timeline",
    href: "/space-racoon/timeline",
    description: "Project timeline and milestones for the SPACE RACOON CubeSat mission. View the Gantt chart showing project phases, dependencies, and progress.",
    keywords: ["timeline", "gantt", "schedule", "milestones", "project phases", "progress", "space racoon"],
    category: "Mission",
    priority: 9,
  }),
  resources: createPageMetadata({
    id: "resources",
    title: "Resources",
    href: "/resources",
    description: "Documentation, guides, research papers, technical documentation, helpful links, and educational resources for the CubeSat project.",
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

