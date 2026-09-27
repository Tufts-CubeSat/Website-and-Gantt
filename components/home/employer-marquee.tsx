import { collaborators, employers } from "@/lib/team-data";

export function EmployerMarquee() {
  // The list is rendered twice so the -50% translate loops seamlessly.
  const loop = [...employers, ...employers];

  return (
    <section className="relative overflow-hidden border-t border-[var(--home-border)] py-16" aria-labelledby="employers-heading">
      <div className="mx-auto mb-8 max-w-7xl px-6 md:px-10 lg:px-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--home-signal)]">Where we and our alumni work</p>
        <h2 id="employers-heading" className="max-w-2xl font-[family-name:var(--font-home-display)] text-2xl font-semibold tracking-tight text-[var(--home-text)] md:text-3xl">
          Skills from CubeSat carry into industry. We also collaborate with {collaborators.join(" and ")}.
        </h2>
      </div>
      <div className="marquee relative [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <ul className="marquee-track flex w-max gap-14 pr-14">
          {loop.map((name, i) => (
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= employers.length}
              className="whitespace-nowrap font-[family-name:var(--font-home-display)] text-3xl font-bold tracking-tight text-[var(--home-muted)] opacity-70 md:text-4xl"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
