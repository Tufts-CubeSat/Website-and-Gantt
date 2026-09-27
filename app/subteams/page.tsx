import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, MapPin } from "lucide-react";
import { pagesData } from "@/lib/pages-data";
import { allTeamMeeting, channels, subteams, type Subteam } from "@/lib/team-data";
import { Reveal } from "@/components/home/reveal";

const pageMetadata = pagesData.subteams;

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

function ListBlock({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-muted)]">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-[var(--home-text)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubteamSection({ subteam, index }: { subteam: Subteam; index: number }) {
  return (
    <Reveal as="section">
      <div id={subteam.id} className="home-panel-surface relative scroll-mt-24 overflow-hidden p-6 md:p-8">
        <span className="absolute inset-y-0 left-0 w-1" style={{ background: subteam.color }} aria-hidden />
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold tabular-nums text-[var(--home-muted)]">{String(index + 1).padStart(2, "0")}</p>
            <h2 className="flex items-center gap-3 font-[family-name:var(--font-home-display)] text-3xl font-bold tracking-tight text-[var(--home-text)]">
              {subteam.name}
              {subteam.isNew && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--home-bg)]" style={{ background: subteam.color }}>
                  New this year
                </span>
              )}
            </h2>
            <p className="mt-2 max-w-xl text-[var(--home-muted)]">{subteam.tagline}</p>
          </div>
          {subteam.meeting ? (
            <dl className="shrink-0 space-y-1.5 text-sm text-[var(--home-text)]">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" style={{ color: subteam.color }} aria-hidden />
                <dt className="sr-only">When</dt>
                <dd>
                  {subteam.meeting.day}, {subteam.meeting.time}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: subteam.color }} aria-hidden />
                <dt className="sr-only">Where</dt>
                <dd>{subteam.meeting.location}</dd>
              </div>
            </dl>
          ) : (
            <p className="shrink-0 text-sm text-[var(--home-muted)]">Meeting time coming soon</p>
          )}
        </div>

        {subteam.about && (
          <div className="mb-6 max-w-3xl space-y-3">
            {subteam.about.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-[var(--home-text)]">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {subteam.whatWeDo.length > 0 && (
          <ul className="mb-8 flex flex-wrap gap-2">
            {subteam.whatWeDo.map((item) => (
              <li key={item} className="story-chip px-2.5 py-1 text-xs font-medium text-[var(--home-text)]">
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          <ListBlock title="This semester" items={subteam.semesterGoals} color={subteam.color} />
          <ListBlock title="Looking ahead" items={subteam.futureGoals} color={subteam.color} />
          <ListBlock title="What you'll learn" items={subteam.learn} color={subteam.color} />
          <ListBlock title="Why join?" items={subteam.whyJoin ?? []} color={subteam.color} />
        </div>

      </div>
    </Reveal>
  );
}

export default function SubteamsPage() {
  return (
    <main className="home-landing min-h-screen bg-[var(--home-ink)] px-6 py-10 text-[var(--home-fog)] md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--home-signal)]">Fall 2026</p>
        <h1 className="mb-4 font-[family-name:var(--font-home-display)] text-4xl font-bold tracking-tight text-[var(--home-text)]">
          {pageMetadata.title}
        </h1>
        <p className="mb-8 max-w-2xl text-[var(--home-muted)]">
          SPACE RACCOON is built by five subteams working in parallel. No experience is needed: every subteam teaches the
          tools it uses. Pick one (or two) and come to a meeting.
        </p>

        <nav aria-label="Subteams" className="mb-10 flex flex-wrap gap-2">
          {subteams.map((s) => (
            <Link
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2 border border-[var(--home-border)] px-3 py-1.5 text-sm text-[var(--home-text)] transition-colors hover:border-[var(--home-signal)]"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
              {s.name}
            </Link>
          ))}
        </nav>

        <div className="home-panel-surface mb-10 grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-muted)]">All-team meeting</h2>
            <p className="font-[family-name:var(--font-home-display)] text-xl font-semibold text-[var(--home-text)]">
              {allTeamMeeting.day}, {allTeamMeeting.time}
            </p>
            <p className="text-[var(--home-muted)]">{allTeamMeeting.location}</p>
          </div>
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-muted)]">Stay in touch</h2>
            <ul className="space-y-1 text-[var(--home-text)]">
              {channels.map((c) => (
                <li key={c.name}>
                  <span className="font-semibold">{c.name}</span> <span className="text-[var(--home-muted)]">· {c.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {subteams.map((subteam, i) => (
            <SubteamSection key={subteam.id} subteam={subteam} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
