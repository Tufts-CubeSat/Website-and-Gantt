"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Github, Mail, MapPin } from "lucide-react";
import { StarfieldCanvas } from "./home/starfield-canvas";
import { MissionStory } from "./home/mission-story";
import { ExplodedCubeSat } from "./home/exploded-cubesat";
import { SubteamGrid } from "./home/subteam-grid";
import { Roadmap } from "./home/roadmap";
import { EmployerMarquee } from "./home/employer-marquee";

const missionStats = [
  { value: "2U", label: "CubeSat form factor" },
  { value: "LEO", label: "Low Earth Orbit" },
  { value: "14 mo", label: "Mission duration" },
  { value: "2029", label: "Target launch" },
];

export function HomeLanding({ lastUpdated }: { lastUpdated: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="home-landing relative min-h-[calc(100vh-4rem)] overflow-x-clip bg-[var(--home-ink)] text-[var(--home-fog)]">
      <StarfieldCanvas className="fixed inset-0 z-0" />
      <div className="home-orbit pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--home-signal)_16%,transparent),transparent_68%)]"
        aria-hidden
      />

      {/* Hero */}
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] content-center max-w-7xl items-center gap-10 px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:px-10 lg:px-14">
        <div
          className={`relative z-10 max-w-xl transition-all duration-1000 ease-out ${
            ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p className="mb-5 font-[family-name:var(--font-home-display)] text-4xl font-bold tracking-tight text-[var(--home-text)] sm:text-5xl md:text-6xl">
            Tufts CubeSat Team
          </p>
          <h1 className="mb-4 max-w-lg text-xl font-medium leading-snug text-[var(--home-fog)] sm:text-2xl">
            Building Tufts&apos;s first satellite to see space debris before it becomes a threat.
          </h1>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-[var(--home-muted)] sm:text-base">
            SPACE RACCOON is a 2U CubeSat mission using onboard computer vision
            and machine learning to detect, classify, and assess collision risk
            in Low Earth Orbit.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/space-raccoon"
              className="group inline-flex items-center gap-2 bg-[var(--home-signal)] px-5 py-2.5 text-sm font-semibold text-[var(--home-ink)] transition-transform duration-300 hover:translate-x-0.5"
            >
              Explore the mission
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/team"
              className="inline-flex items-center gap-2 border border-[var(--home-border)] px-5 py-2.5 text-sm font-medium text-[var(--home-text)] transition-colors duration-300 hover:border-[var(--home-signal)] hover:bg-[color-mix(in_srgb,var(--home-signal)_8%,transparent)]"
            >
              Meet the team
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-4 gap-4 border-t border-[var(--home-border)] pt-6">
            {missionStats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-[family-name:var(--font-home-display)] text-xl font-bold text-[var(--home-text)] sm:text-2xl">
                  {stat.value}
                </dd>
                <dd className="mt-1 text-[11px] leading-tight text-[var(--home-muted)]">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          className={`relative z-10 flex items-center justify-center transition-all delay-200 duration-1000 ease-out ${
            ready ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="home-satellite-glow absolute inset-[12%] rounded-full" aria-hidden />
          <div className="home-satellite-float relative w-full max-w-lg">
            <Image
              src="/CubeSat Onhape.png"
              alt="SPACE RACCOON CubeSat CAD model with exploded internal stack"
              width={900}
              height={900}
              priority
              className="h-auto w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>

        <a
          href="#story-heading"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--home-muted)] transition-colors hover:text-[var(--home-text)] md:flex"
        >
          Scroll the mission <ArrowDown className="h-3.5 w-3.5 motion-safe:animate-bounce" />
        </a>
      </section>

      <div className="relative z-10">
        <MissionStory />
        <ExplodedCubeSat />
        <SubteamGrid />
        <Roadmap />
        <EmployerMarquee />
      </div>

      {/* Contact strip */}
      <section className="relative z-10 border-t border-[var(--home-border)] px-6 py-10 md:px-10 lg:px-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-8 text-sm">
            <a
              href="mailto:William.Goldman@tufts.edu"
              className="group flex items-start gap-2 text-[var(--home-muted)] transition-colors hover:text-[var(--home-text)]"
            >
              <Mail className="mt-0.5 h-4 w-4 text-[var(--home-signal)]" />
              <span>
                <span className="block text-xs uppercase tracking-wider text-[var(--home-muted)]">
                  Email
                </span>
                William.Goldman@tufts.edu
              </span>
            </a>
            <div className="flex items-start gap-2 text-[var(--home-muted)]">
              <MapPin className="mt-0.5 h-4 w-4 text-[var(--home-signal)]" />
              <span>
                <span className="block text-xs uppercase tracking-wider text-[var(--home-muted)]">
                  Location
                </span>
                Halligan Hall, Tufts University
              </span>
            </div>
            <Link
              href="https://github.com/Tufts-CubeSat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 text-[var(--home-muted)] transition-colors hover:text-[var(--home-text)]"
            >
              <Github className="mt-0.5 h-4 w-4 text-[var(--home-signal)]" />
              <span>
                <span className="block text-xs uppercase tracking-wider text-[var(--home-muted)]">
                  GitHub
                </span>
                Tufts-CubeSat
              </span>
            </Link>
          </div>
          <p className="text-xs text-[var(--home-muted)]">Last updated: {lastUpdated}</p>
        </div>
      </section>
    </main>
  );
}
