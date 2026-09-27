import { pagesData } from "@/lib/pages-data";
import type { Metadata } from "next";
import Link from "next/link";
import { Github, Globe, Linkedin, Mail } from "lucide-react";
import AnnouncementBanner from "@/components/announcementbanner";
import { MemberAvatar } from "@/components/member-avatar";
import { Reveal } from "@/components/home/reveal";
import { getNextMeeting } from "@/lib/utils";
import { getMemberPhoto } from "@/lib/team-photos";
import {
  allTeamMeeting,
  alumni,
  getMemberEmail,
  getSubteam,
  members,
  specialThanks,
  subteams,
  type Member,
} from "@/lib/team-data";

const pageMetadata = pagesData.team;

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

function websiteLabel(url: string): { label: string; isGithub: boolean } {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return { label: host === "github.com" ? "GitHub" : "Website", isGithub: host === "github.com" };
  } catch {
    return { label: "Website", isGithub: false };
  }
}

function MemberCard({ member, size = "md" }: { member: Member; size?: "md" | "lg" }) {
  const color = getSubteam(member.subteams[0]).color;
  const email = getMemberEmail(member);

  return (
    <div className="home-panel-surface flex h-full items-center gap-4 p-3 pr-4">
      <MemberAvatar name={member.name} photo={getMemberPhoto(member.slug)} color={color} size={size} />
      <div className="min-w-0">
        <p className={`font-semibold text-[var(--home-text)] ${size === "lg" ? "text-xl" : ""}`}>{member.name}</p>
        {member.roles.map((role) => (
          <p key={role} className="text-sm text-[var(--home-muted)]">
            {role}
          </p>
        ))}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--home-signal)] hover:underline"
            title={`Email ${member.name}`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </a>
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--home-signal)] hover:underline"
              title={`${member.name} on LinkedIn`}
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          )}
          {member.website &&
            (() => {
              const { label, isGithub } = websiteLabel(member.website);
              const Icon = isGithub ? Github : Globe;
              return (
                <a
                  href={member.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--home-signal)] hover:underline"
                  title={`${member.name}'s ${label}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </a>
              );
            })()}
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  // All-team meeting: Tuesdays; roll over to next week after 7:30pm.
  const nextMeeting = getNextMeeting(2, 20);
  const projectLeads = members.filter((m) => m.lead === "project");
  const teamsWithMembers = subteams.map((subteam) => ({
    subteam,
    people: members.filter((m) => m.lead !== "project" && m.subteams.includes(subteam.id)),
  }));

  return (
    <main className="home-landing min-h-screen bg-[var(--home-ink)] px-6 py-10 text-[var(--home-fog)] md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--home-signal)]">Fall 2026</p>
        <h1 className="mb-6 font-[family-name:var(--font-home-display)] text-4xl font-bold tracking-tight text-[var(--home-text)]">
          {pageMetadata.title}
        </h1>

        <AnnouncementBanner
          badge="Upcoming"
          message={`All-Team Meeting: Tuesday, ${nextMeeting} @ ${allTeamMeeting.time.split(" ")[0]}, ${allTeamMeeting.location}`}
          mobileMessage={`All-Team: Tue ${nextMeeting}, ${allTeamMeeting.time.split(" ")[0]} @ ${allTeamMeeting.location}`}
          variant="red"
        />

        <section className="mb-14">
          <h2 className="mb-4 font-[family-name:var(--font-home-display)] text-2xl font-semibold text-[var(--home-text)]">Project Leads</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {projectLeads.map((member, i) => (
              <Reveal key={member.slug} delay={i * 100}>
                <MemberCard member={member} size="lg" />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mb-14 space-y-10">
          {teamsWithMembers.map(({ subteam, people }) => (
            <div key={subteam.id} id={subteam.id} className="scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--home-border)] pb-2">
                <h2 className="flex items-center gap-3 font-[family-name:var(--font-home-display)] text-2xl font-semibold text-[var(--home-text)]">
                  <span className="h-3 w-3 rounded-full" style={{ background: subteam.color }} aria-hidden />
                  {subteam.name}
                  {subteam.isNew && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--home-bg)]" style={{ background: subteam.color }}>
                      New
                    </span>
                  )}
                </h2>
                <Link href={`/subteams#${subteam.id}`} className="text-sm text-[var(--home-signal)] hover:underline">
                  About {subteam.name} →
                </Link>
              </div>
              {people.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {people
                    .sort((a, b) => Number(!!b.lead) - Number(!!a.lead))
                    .map((member, i) => (
                      <Reveal as="li" key={member.slug} delay={i * 70}>
                        <MemberCard member={member} />
                      </Reveal>
                    ))}
                </ul>
              ) : (
                <p className="text-sm italic text-[var(--home-muted)]">
                  {subteam.isNew ? "Just getting started. Come to a meeting to join!" : "No members yet."}
                </p>
              )}
            </div>
          ))}
        </section>

        <div className="grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="mb-4 font-[family-name:var(--font-home-display)] text-2xl font-semibold text-[var(--home-text)]">Special Thanks</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {specialThanks.map((name) => (
                <li key={name} className="home-panel-surface p-3 text-sm text-[var(--home-text)]">
                  {name}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-4 font-[family-name:var(--font-home-display)] text-2xl font-semibold text-[var(--home-text)]">Alumni</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {alumni.map((name) => (
                <li key={name} className="home-panel-surface p-3 text-sm text-[var(--home-text)]">
                  {name}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
