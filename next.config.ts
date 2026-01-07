import type { NextConfig } from "next";

// Repository name for GitHub Pages
const repoName = "Website-and-Gantt";

const nextConfig: NextConfig = {
  // Configure for GitHub Pages deployment
  // This automatically prefixes all paths (including images, links, etc.) with the repository name
  basePath: process.env.NODE_ENV === "production" ? `/${repoName}` : "",
  
  // Trailing slash for GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
