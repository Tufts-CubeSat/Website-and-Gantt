// Server-only: uses the filesystem. Import from server components only.
import fs from "fs";
import path from "path";

const PHOTO_DIR = path.join(process.cwd(), "public", "team");
const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/**
 * Returns the public URL for a member's portrait if one has been added to
 * public/team/<slug>.<ext>, otherwise undefined (callers fall back to initials).
 * Resolved at build time, so adding a photo only requires dropping in a file.
 */
export function getMemberPhoto(slug: string): string | undefined {
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(PHOTO_DIR, `${slug}.${ext}`))) {
      return `/team/${slug}.${ext}`;
    }
  }
  return undefined;
}
