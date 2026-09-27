"use client";

import Link from "next/link";
import { useRef } from "react";
import { milestones } from "@/lib/team-data";
import { gsap, useGsap } from "./use-gsap";

/** 2026–27 milestones on a line that draws itself as you scroll past. */
export function Roadmap() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(root.current);
    const scrollTrigger = { trigger: root.current, start: "top 75%", end: "bottom 60%", scrub: 0.5 };

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
      gsap.timeline({ scrollTrigger })
        .from(q(".r-line"), { scaleX: 0, transformOrigin: "left center", ease: "none", duration: 1 }, 0)
        .from(q(".r-item"), { autoAlpha: 0, y: 16, stagger: 0.15, duration: 0.25 }, 0.05);
    });
    mm.add("(prefers-reduced-motion: no-preference) and (max-width: 767px)", () => {
      gsap.timeline({ scrollTrigger })
        .from(q(".r-line"), { scaleY: 0, transformOrigin: "center top", ease: "none", duration: 1 }, 0)
        .from(q(".r-item"), { autoAlpha: 0, x: -16, stagger: 0.15, duration: 0.25 }, 0.05);
    });
  });

  return (
    <section ref={root} className="relative border-t border-[var(--home-border)] px-6 py-20 md:px-10 lg:px-14" aria-labelledby="roadmap-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--home-signal)]">Roadmap</p>
            <h2 id="roadmap-heading" className="max-w-xl font-[family-name:var(--font-home-display)] text-3xl font-semibold tracking-tight text-[var(--home-text)] md:text-4xl">
              This year on the way to launch.
            </h2>
          </div>
          <Link href="/space-raccoon/timeline" className="text-sm font-medium text-[var(--home-signal)] hover:underline">
            Full timeline →
          </Link>
        </div>

        <div className="relative">
          <div className="r-line absolute left-[7px] top-0 h-full w-px bg-[var(--home-signal)] md:left-0 md:top-[7px] md:h-px md:w-full" aria-hidden />
          <ol className="relative grid gap-8 md:grid-cols-6 md:gap-4">
            {milestones.map((m) => (
              <li key={m.month} className="r-item relative pl-8 md:pl-0 md:pt-8">
                <span className="absolute left-0 top-0.5 h-[15px] w-[15px] rounded-full border-2 border-[var(--home-signal)] bg-[var(--home-bg)] md:top-0" aria-hidden />
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-muted)]">{m.month}</p>
                <ul className="space-y-1.5">
                  {m.items.map((item) => (
                    <li key={item} className="text-sm font-medium leading-snug text-[var(--home-text)]">
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
