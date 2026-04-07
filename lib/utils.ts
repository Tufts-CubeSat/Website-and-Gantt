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

export function getNextMondayMeeting(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  
  const isMonday = day === 1;
  const isPastCutoff = now.getHours() >= 21; // 9 PM
  
  // Days until next Monday
  let daysUntilMonday: number;
  if (isMonday && !isPastCutoff) {
    daysUntilMonday = 0; // Still show today's meeting
  } else if (isMonday && isPastCutoff) {
    daysUntilMonday = 7; // Meeting passed, jump to next Monday
  } else {
    daysUntilMonday = (8 - day) % 7; // Next Monday from any other day
  }

  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);

  // Format as M/D
  const month = nextMonday.getMonth() + 1;
  const date = nextMonday.getDate();
  return `${month}/${date}`;
}