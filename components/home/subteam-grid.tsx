import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { subteams } from "@/lib/team-data";
import { Reveal } from "./reveal";

export function SubteamGrid() {
  return (
    <section className="relative border-t border-[var(--home-border)] px-6 py-20 md:px-10 lg:px-14" aria-labelledby="subteams-heading">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--home-signal)]">Five subteams</p>
        <h2 id="subteams-heading" className="mb-10 max-w-xl font-[family-name:var(--font-home-display)] text-3xl font-semibold tracking-tight text-[var(--home-text)] md:text-4xl">
          Find your part of the spacecraft.
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {subteams.map((subteam, i) => (
            <Reveal as="li" key={subteam.id} delay={i * 90}>
              <Link
                href={`/subteams#${subteam.id}`}
                className="home-panel-surface group relative flex h-full flex-col p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: subteam.color }} aria-hidden />
                <span className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold tabular-nums text-[var(--home-muted)]">{String(i + 1).padStart(2, "0")}</span>
                  {subteam.isNew ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--home-bg)]" style={{ background: subteam.color }}>
                      New
                    </span>
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-[var(--home-muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  )}
                </span>
                <span className="mb-2 font-[family-name:var(--font-home-display)] text-lg font-semibold text-[var(--home-text)]">{subteam.name}</span>
                <span className="mb-4 text-sm leading-relaxed text-[var(--home-muted)]">{subteam.tagline}</span>
                {subteam.meeting && (
                  <span className="mt-auto text-xs text-[var(--home-muted)]">
                    {subteam.meeting.day} · {subteam.meeting.location}
                  </span>
                )}
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
