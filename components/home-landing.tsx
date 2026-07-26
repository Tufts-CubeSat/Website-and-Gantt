"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Github, Mail, MapPin } from "lucide-react";

const pillars = [
  {
    label: "Vision payload",
    detail:
      "Modified GoPro hardware paired with onboard ML to detect and classify debris streaks.",
  },
  {
    label: "Open source",
    detail:
      "Flight software and data released for the aerospace community and future missions.",
  },
  {
    label: "Full stack build",
    detail:
      "Structures, power, RF, and radiation-hardened systems engineered in parallel.",
  },
];

export function HomeLanding({ lastUpdated }: { lastUpdated: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="home-landing relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[var(--home-ink)] text-[var(--home-fog)]">
      <div className="home-stars pointer-events-none absolute inset-0" aria-hidden />
      <div className="home-orbit pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--home-signal)_16%,transparent),transparent_68%)]"
        aria-hidden
      />

      {/* Hero */}
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:px-10 lg:px-14">
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
      </section>

      {/* Mission pillars */}
      <section className="relative border-t border-[var(--home-border)] px-6 py-16 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--home-signal)]">
            2025–2026 development
          </p>
          <h2 className="mb-10 max-w-xl font-[family-name:var(--font-home-display)] text-3xl font-semibold tracking-tight text-[var(--home-text)] md:text-4xl">
            Edge-of-orbit engineering, built on campus.
          </h2>
          <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
            {pillars.map((pillar, index) => (
              <li
                key={pillar.label}
                className={`transition-all duration-700 ease-out ${
                  ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: `${400 + index * 120}ms` }}
              >
                <p className="mb-2 font-[family-name:var(--font-home-display)] text-lg font-semibold text-[var(--home-text)]">
                  {pillar.label}
                </p>
                <p className="text-sm leading-relaxed text-[var(--home-muted)]">
                  {pillar.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact strip */}
      <section className="relative border-t border-[var(--home-border)] px-6 py-10 md:px-10 lg:px-14">
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
