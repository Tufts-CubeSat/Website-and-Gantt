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
  } catch {
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
  const meetingTimeZone = "America/New_York";
  const now = new Date();

  const nowParts = getDatePartsInTimeZone(now, meetingTimeZone);
  const isMonday = nowParts.weekday === 1; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const isPastCutoff = nowParts.hour >= 21; // 9 PM local meeting time

  const daysUntilMonday =
    isMonday && !isPastCutoff
      ? 0
      : isMonday && isPastCutoff
      ? 7
      : (8 - nowParts.weekday) % 7;

  const meetingDate = new Date(
    Date.UTC(
      nowParts.year,
      nowParts.month - 1,
      nowParts.day + daysUntilMonday,
      12,
      0,
      0,
      0
    )
  );
  const meetingParts = getDatePartsInTimeZone(meetingDate, meetingTimeZone);

  return `${meetingParts.month}/${meetingParts.day}`;
}

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
}