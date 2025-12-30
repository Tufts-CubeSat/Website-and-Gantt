import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { execSync } from "child_process"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the last updated date for the website.
 * Tries to get the last git commit date, falls back to build time.
 */
export function getLastUpdated(): string {
  // Try to get git commit date (works at build time in server components)
  try {
    const gitDate = execSync('git log -1 --format=%ci HEAD', { 
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    if (gitDate) {
      return new Date(gitDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    // Git not available or not a git repo, fall back to build time
  }
  
  // Fallback to current date (build time)
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
