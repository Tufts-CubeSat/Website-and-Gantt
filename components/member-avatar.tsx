import Image from "next/image";

const PLACEHOLDER_PHOTO = "/cubesat_1u_internet_example.jpg";

/**
 * Portrait for a team member. Uses the photo from public/team/ when present,
 * otherwise a placeholder CubeSat image.
 */
export function MemberAvatar({ name, photo, size = "md" }: { name: string; photo?: string; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-40 w-32 sm:h-48 sm:w-40" : "h-24 w-20";

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg bg-[var(--home-border)] ${dims}`}>
      <Image
        src={photo ?? PLACEHOLDER_PHOTO}
        alt={photo ? `Portrait of ${name}` : ""}
        fill
        sizes={size === "lg" ? "160px" : "80px"}
        priority={size === "lg"}
        className="object-cover"
      />
    </div>
  );
}
