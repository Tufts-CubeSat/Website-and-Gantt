import Image from "next/image";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/**
 * Portrait for a team member. Uses the photo from public/team/ when present,
 * otherwise an initials tile tinted with the member's subteam color.
 */
export function MemberAvatar({
  name,
  photo,
  color,
  size = "md",
}: {
  name: string;
  photo?: string;
  color: string;
  size?: "md" | "lg";
}) {
  const dims = size === "lg" ? "h-40 w-32 sm:h-48 sm:w-40" : "h-24 w-20";
  const text = size === "lg" ? "text-4xl" : "text-xl";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg ${dims}`}
      style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {photo ? (
        <Image
          src={photo}
          alt={`Portrait of ${name}`}
          fill
          sizes={size === "lg" ? "160px" : "80px"}
          priority={size === "lg"}
          className="object-cover"
        />
      ) : (
        <span
          className={`grid h-full w-full place-items-center font-[family-name:var(--font-home-display)] font-bold ${text}`}
          style={{ color }}
          aria-hidden
        >
          {initials(name)}
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-lg" style={{ boxShadow: `inset 0 0 0 2px ${color}` }} aria-hidden />
    </div>
  );
}
