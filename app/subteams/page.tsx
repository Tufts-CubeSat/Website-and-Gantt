import type { Metadata } from "next";
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

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-muted)]">{title}</h3>
      <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-[var(--home-text)] marker:text-[var(--home-muted)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SubteamSection({ subteam }: { subteam: Subteam }) {
  return (
    <Reveal as="section">
      <div id={subteam.id} className="home-panel-surface scroll-mt-24 p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-[var(--home-text)]">
              {subteam.name}
              {subteam.isNew && (
                <span className="border border-[var(--home-border)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--home-muted)]">
                  New this year
                </span>
              )}
            </h2>
            <p className="mt-2 max-w-xl text-[var(--home-muted)]">{subteam.tagline}</p>
          </div>
          {subteam.meeting ? (
            <dl className="shrink-0 space-y-1.5 text-sm text-[var(--home-text)]">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[var(--home-muted)]" aria-hidden />
                <dt className="sr-only">When</dt>
                <dd>
                  {subteam.meeting.day}, {subteam.meeting.time}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--home-muted)]" aria-hidden />
                <dt className="sr-only">Where</dt>
                <dd>{subteam.meeting.location}</dd>
              </div>
            </dl>
          ) : (
            <p className="shrink-0 text-sm text-[var(--home-muted)]">Meeting time coming soon</p>
          )}
        </div>

        {subteam.about && <p className="mb-6 max-w-3xl leading-relaxed text-[var(--home-text)]">{subteam.about}</p>}

        <div className="grid gap-8 md:grid-cols-3">
          <ListBlock title="This semester" items={subteam.semesterGoals} />
          <ListBlock title="Looking ahead" items={subteam.futureGoals} />
          <ListBlock title="What you'll learn" items={subteam.learn} />
          <ListBlock title="Why join?" items={subteam.whyJoin ?? []} />
        </div>
      </div>
    </Reveal>
  );
}

export default function SubteamsPage() {
  return (
    <main className="home-landing min-h-screen bg-[var(--home-ink)] px-6 py-10 text-[var(--home-fog)] md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--home-text)]">{pageMetadata.title}</h1>
        <p className="mb-8 max-w-2xl text-[var(--home-muted)]">SPACE RACCOON is built by five subteams:</p>

        <div className="space-y-6">
          {subteams.map((subteam) => (
            <SubteamSection key={subteam.id} subteam={subteam} />
          ))}
        </div>

        <div className="home-panel-surface mt-10 grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-muted)]">All-team meeting</h2>
            <p className="text-xl font-semibold text-[var(--home-text)]">
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
      </div>
    </main>
  );
}
