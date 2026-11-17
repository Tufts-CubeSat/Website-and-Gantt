import Image from "next/image";
import { employers } from "@/lib/team-data";

export function EmployerMarquee() {
  // The list is rendered twice so the -50% translate loops seamlessly.
  const loop = [...employers, ...employers];

  return (
    <section className="relative overflow-hidden border-t border-[var(--home-border)] py-16" aria-labelledby="employers-heading">
      <div className="mx-auto mb-8 max-w-7xl px-6 md:px-10 lg:px-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--home-signal)]">Where we and our alumni work</p>
        <h2 id="employers-heading" className="max-w-2xl text-2xl font-semibold tracking-tight text-[var(--home-text)] md:text-3xl">
          Skills from CubeSat carry into industry.
        </h2>
      </div>
      <div className="pointer-events-none relative select-none [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <ul className="marquee-track flex w-max items-center gap-6 pr-6">
          {loop.map((employer, i) => (
            <li
              key={`${employer.name}-${i}`}
              aria-hidden={i >= employers.length}
              className="flex shrink-0 items-center rounded-lg bg-white px-5 py-4"
            >
              {/* White chip keeps dark and colored logos legible in both themes. */}
              <Image
                src={employer.logo}
                alt={i >= employers.length ? "" : employer.name}
                width={employer.width}
                height={employer.height}
                draggable={false}
                className="h-8 w-auto md:h-10"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
