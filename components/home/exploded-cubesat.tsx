"use client";

import { useRef, type ReactNode } from "react";
import { subteams } from "@/lib/team-data";
import { gsap, HEADER_OFFSET, useGsap } from "./use-gsap";

/**
 * "Scroll to open the CubeSat": an isometric 2U stack that separates into its
 * subsystems as you scroll. The markup is drawn in the exploded state (the
 * static / reduced-motion view); GSAP animates *from* the compact stack.
 */

// Isometric projection: 1 unit = 1 mm, 1U = 100 mm.
const S = 1.25;
const O = { x: 330, y: 600 };
const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
const U = 100;
const HEIGHT_2U = 227;

type P3 = [number, number, number];

function iso([x, y, z]: P3) {
  return { x: O.x + (x - y) * COS * S, y: O.y + (x + y) * SIN * S - z * S };
}

function pts(points: P3[]) {
  return points
    .map((p) => {
      const { x, y } = iso(p);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const shade = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, black)`;

function IsoBox({ x, y, z, w, d, h, color }: { x: number; y: number; z: number; w: number; d: number; h: number; color: string }) {
  const t = z + h;
  return (
    <g strokeWidth={0.8} style={{ stroke: shade(color, 45) }} strokeLinejoin="round">
      <polygon points={pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, t], [x, y + d, t]])} style={{ fill: shade(color, 72) }} />
      <polygon points={pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, t], [x + w, y, t]])} style={{ fill: shade(color, 55) }} />
      <polygon points={pts([[x, y, t], [x + w, y, t], [x + w, y + d, t], [x, y + d, t]])} style={{ fill: color }} />
    </g>
  );
}

function IsoCylinder({ cx, cy, z, r, h, color, children }: { cx: number; cy: number; z: number; r: number; h: number; color: string; children?: ReactNode }) {
  const bottom = iso([cx, cy, z]);
  const top = iso([cx, cy, z + h]);
  const rx = r * S * Math.SQRT2 * COS;
  const ry = r * S * Math.SQRT2 * SIN;
  return (
    <g strokeWidth={0.8} style={{ stroke: shade(color, 45) }}>
      <ellipse cx={bottom.x} cy={bottom.y} rx={rx} ry={ry} style={{ fill: shade(color, 60) }} />
      <rect x={top.x - rx} y={top.y} width={rx * 2} height={bottom.y - top.y} style={{ fill: shade(color, 60), stroke: "none" }} />
      <ellipse cx={top.x} cy={top.y} rx={rx} ry={ry} style={{ fill: color }} />
      {children}
    </g>
  );
}

function Board({ z, color }: { z: number; color: string }) {
  return <IsoBox x={4} y={4} z={z} w={92} d={92} h={3} color={`color-mix(in srgb, ${color} 35%, #0f2a1d)`} />;
}

const colorOf = (id: string) => subteams.find((s) => s.id === id)?.color ?? "#94a3b8";
const POWER = colorOf("power");
const SOFTWARE = colorOf("software");
const STRUCTURES = colorOf("structures");
const COMMS = colorOf("comms");
const PAYLOAD = "#fb923c";

interface Layer {
  name: string;
  owner: string;
  color: string;
  /** Board plus tallest component, in mm. Drives the packing of the compact stack. */
  height: number;
  render: (z: number) => ReactNode;
}

/** Bottom to top: antenna deck at the base, transceiver next to it, GoPro looking out the top. */
const layers: Layer[] = [
  {
    name: "Antenna deck",
    owner: "Comms",
    color: COMMS,
    height: 7,
    render: (z) => {
      const t = z + 3;
      const tapes: [P3, P3][] = [
        [[50, 4, t], [50, -45, t]],
        [[96, 50, t], [145, 50, t]],
        [[50, 96, t], [50, 145, t]],
        [[4, 50, t], [-45, 50, t]],
      ];
      return (
        <>
          <Board z={z} color={COMMS} />
          <IsoBox x={36} y={36} z={t} w={28} d={28} h={4} color={COMMS} />
          {tapes.map(([a, b], i) => {
            const pa = iso(a);
            const pb = iso(b);
            return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} style={{ stroke: "#e2e8f0" }} strokeWidth={2} strokeLinecap="round" />;
          })}
        </>
      );
    },
  },
  {
    name: "VHF/UHF transceiver",
    owner: "Comms",
    color: COMMS,
    height: 13,
    render: (z) => (
      <>
        <Board z={z} color={COMMS} />
        <IsoBox x={18} y={18} z={z + 3} w={56} d={36} h={9} color="#475569" />
        <IsoCylinder cx={80} cy={78} z={z + 3} r={5} h={10} color="#cbd5e1" />
      </>
    ),
  },
  {
    name: "Power system & battery",
    owner: "Power",
    color: POWER,
    height: 25,
    render: (z) => (
      <>
        <Board z={z} color={POWER} />
        <IsoBox x={58} y={12} z={z + 3} w={24} d={18} h={5} color="#334155" />
        <IsoCylinder cx={30} cy={62} z={z + 3} r={13} h={22} color="#64748b" />
        <IsoCylinder cx={62} cy={66} z={z + 3} r={13} h={22} color="#64748b" />
      </>
    ),
  },
  {
    name: "ADCS · reaction wheels",
    owner: "Software · Structures",
    color: STRUCTURES,
    height: 14,
    render: (z) => (
      <>
        <Board z={z} color={STRUCTURES} />
        {[
          [30, 30],
          [70, 34],
          [48, 70],
        ].map(([cx, cy]) => (
          <IsoCylinder key={`${cx}-${cy}`} cx={cx} cy={cy} z={z + 3} r={14} h={11} color={STRUCTURES} />
        ))}
      </>
    ),
  },
  {
    name: "Flight computer & FPGA",
    owner: "Software",
    color: SOFTWARE,
    height: 8,
    render: (z) => (
      <>
        <Board z={z} color={SOFTWARE} />
        <IsoBox x={14} y={14} z={z + 3} w={32} d={32} h={5} color="#1e293b" />
        <IsoBox x={58} y={16} z={z + 3} w={26} d={16} h={4} color="#334155" />
        <IsoBox x={56} y={56} z={z + 3} w={28} d={28} h={4} color={SOFTWARE} />
        <IsoBox x={16} y={62} z={z + 3} w={26} d={20} h={3} color="#334155" />
      </>
    ),
  },
  {
    name: "GoPro vision payload",
    owner: "Payload · Software",
    color: PAYLOAD,
    height: 35,
    render: (z) => {
      const lens = iso([50, 46, z + 35]);
      return (
        <>
          <Board z={z} color={PAYLOAD} />
          <IsoBox x={24} y={24} z={z + 3} w={52} d={44} h={32} color="#1f2937" />
          <ellipse cx={lens.x} cy={lens.y} rx={14 * S * Math.SQRT2 * COS} ry={14 * S * Math.SQRT2 * SIN} style={{ fill: "#0b1220", stroke: PAYLOAD }} strokeWidth={1.2} />
          <ellipse cx={lens.x} cy={lens.y} rx={7 * S * Math.SQRT2 * COS} ry={7 * S * Math.SQRT2 * SIN} style={{ fill: "#38bdf8" }} opacity={0.8} />
        </>
      );
    },
  },
];

/**
 * Compact (closed) heights: pack the layers in order inside the chassis with
 * even gaps, so any ordering stays inside the 2U envelope without overlaps.
 */
const STACK_MARGIN = 6;
const COMPACT_Z = (() => {
  const total = layers.reduce((sum, l) => sum + l.height, 0);
  const gap = (HEIGHT_2U - 2 * STACK_MARGIN - total) / (layers.length - 1);
  let z = STACK_MARGIN;
  return layers.map((l) => {
    const at = z;
    z += l.height + gap;
    return at;
  });
})();

/** Exploded (open) heights: evenly spaced so each leader label gets its own row. */
const EXPLODED_Z = layers.map((_, slot) => -30 + slot * 90);

const PANEL_OUT = 50; // mm the side panels slide outward when opened
const leftOut = { x: -PANEL_OUT * COS * S, y: PANEL_OUT * SIN * S };
const rightOut = { x: PANEL_OUT * COS * S, y: PANEL_OUT * SIN * S };

function Rail({ x, y }: { x: number; y: number }) {
  return <IsoBox x={x} y={y} z={0} w={8} d={8} h={HEIGHT_2U} color="#94a3b8" />;
}

function SolarCells({ face }: { face: "left" | "right" }) {
  // Left face is y = U, right face is x = U. 2 × 4 cells per face.
  const cells: ReactNode[] = [];
  const at = (a: number, z: number): P3 => (face === "left" ? [a, U, z] : [U, a, z]);
  const cols = [
    [10, 48],
    [52, 90],
  ];
  const rows = [
    [12, 60],
    [64, 112],
    [118, 166],
    [170, 218],
  ];
  for (const [a0, a1] of cols) {
    for (const [z0, z1] of rows) {
      cells.push(
        <polygon
          key={`${a0}-${z0}`}
          points={pts([at(a0, z0), at(a1, z0), at(a1, z1), at(a0, z1)])}
          style={{ fill: face === "left" ? "#1d4ed8" : "#1e3a8a", stroke: "#93c5fd" }}
          strokeOpacity={0.35}
          strokeWidth={0.6}
        />
      );
    }
  }
  return (
    <>
      <polygon points={pts([at(4, 6), at(96, 6), at(96, 222), at(4, 222)])} style={{ fill: face === "left" ? "#d97706" : "#b45309" }} />
      {cells}
    </>
  );
}

function LeaderLabel({ from, to, title, owner, color, anchor = "start" }: { from: { x: number; y: number }; to: { x: number; y: number }; title: string; owner: string; color: string; anchor?: "start" | "end" }) {
  const tx = anchor === "start" ? to.x + 8 : to.x - 8;
  return (
    <g className="c-label">
      <polyline points={`${from.x},${from.y} ${to.x},${to.y}`} fill="none" style={{ stroke: "var(--home-muted)" }} strokeWidth={1} strokeDasharray="3 3" />
      <circle cx={from.x} cy={from.y} r={2.5} style={{ fill: color }} />
      <text className="c-label-title" x={tx} y={to.y - 2} textAnchor={anchor} fontSize={15} fontWeight={600} style={{ fill: "var(--home-text)" }}>
        {title}
      </text>
      <text
        className="c-label-owner"
        x={tx}
        y={to.y + 15}
        textAnchor={anchor}
        fontSize={11}
        fontWeight={600}
        letterSpacing={1.2}
        // Pull pale subteam colors toward the text color so they stay legible in light mode.
        style={{ fill: `color-mix(in srgb, ${color} 72%, var(--home-text))` }}
      >
        {owner.toUpperCase()}
      </text>
    </g>
  );
}

export function ExplodedCubeSat() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(root.current);
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: q(".cubesat-pin")[0],
          pin: true,
          start: `top top+=${HEADER_OFFSET}`,
          end: "+=160%",
          scrub: 0.6,
        },
      });

      tl.to(q(".c-hint"), { autoAlpha: 0, duration: 0.15 }, 0.05)
        .from(q(".c-panel-left, .c-panel-right"), { x: 0, y: 0, opacity: 1, duration: 0.35 }, 0)
        .from(q(".c-front"), { opacity: 1, duration: 0.3 }, 0.05);

      q(".c-layer").forEach((layer, i) => {
        tl.from(layer, { y: Number(layer.getAttribute("data-dy")), duration: 0.8 }, 0.2 + i * 0.03);
      });

      tl.from(q(".c-label"), { autoAlpha: 0, x: -12, stagger: 0.05, duration: 0.25 }, 0.75);
    });
  });

  const rightCorner = (z: number) => iso([U, 0, z]);
  const labelX = 600;
  const chassisAnchor = iso([0, 0, HEIGHT_2U]);
  const panelAnchor = iso([50, U, 150]);

  return (
    <section ref={root} className="relative border-t border-[var(--home-border)]" aria-labelledby="cubesat-heading">
      <div className="cubesat-pin relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 px-6 py-12 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] md:px-10 lg:px-14">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--home-signal)]">Inside SPACE RACCOON</p>
          <h2 id="cubesat-heading" className="mb-4 font-[family-name:var(--font-home-display)] text-3xl font-semibold tracking-tight text-[var(--home-text)] md:text-4xl">
            Every layer, built by students.
          </h2>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-[var(--home-muted)] md:text-base">
            A 2U CubeSat is just 10 × 10 × 22.7 cm. Inside that volume each subteam owns a slice of the stack: the chassis
            and orbit analysis, power, flight software and vision, and the radio link home.
          </p>
          <ul className="grid max-w-sm grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {subteams
              .filter((s) => s.id !== "weather-balloon")
              .map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-[var(--home-text)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
                  {s.name}
                </li>
              ))}
          </ul>
          <p className="c-hint mt-8 hidden text-xs uppercase tracking-[0.2em] text-[var(--home-muted)] motion-safe:block">
            Scroll to open the spacecraft ↓
          </p>
        </div>

        <svg
          viewBox="0 0 900 800"
          className="mx-auto h-auto max-h-[calc(100vh-8rem)] w-full overflow-visible"
          role="img"
          aria-label="Exploded view of the SPACE RACCOON 2U CubeSat, bottom to top: antenna deck, transceiver, power system, ADCS reaction wheels, flight computer, and GoPro payload, inside an aluminum chassis with solar panels"
        >
          <g className="c-rail-back">
            <Rail x={0} y={0} />
          </g>

          {layers.map((layer, slot) => {
            const explodedZ = EXPLODED_Z[slot];
            const dy = (explodedZ - COMPACT_Z[slot]) * S;
            const corner = rightCorner(explodedZ + 3);
            return (
              <g key={layer.name} className="c-layer" data-dy={dy}>
                {layer.render(explodedZ)}
                <LeaderLabel
                  from={{ x: corner.x + 4, y: corner.y }}
                  to={{ x: labelX, y: corner.y }}
                  title={layer.name}
                  owner={layer.owner}
                  color={layer.color}
                />
              </g>
            );
          })}

          <g className="c-front" style={{ opacity: 0.3 }}>
            <Rail x={0} y={U - 8} />
            <Rail x={U - 8} y={0} />
            <Rail x={U - 8} y={U - 8} />
          </g>

          <g className="c-panel-left" style={{ opacity: 0.35 }} transform={`translate(${leftOut.x} ${leftOut.y})`}>
            <SolarCells face="left" />
          </g>
          <g className="c-panel-right" style={{ opacity: 0.35 }} transform={`translate(${rightOut.x} ${rightOut.y})`}>
            <SolarCells face="right" />
          </g>

          <LeaderLabel
            from={chassisAnchor}
            to={{ x: 190, y: chassisAnchor.y - 60 }}
            title="2U aluminum chassis"
            owner="Structures"
            color={STRUCTURES}
            anchor="end"
          />
          <LeaderLabel
            from={{ x: panelAnchor.x + leftOut.x, y: panelAnchor.y + leftOut.y }}
            to={{ x: 150, y: panelAnchor.y + leftOut.y + 90 }}
            title="Solar panels"
            owner="Power"
            color={POWER}
            anchor="end"
          />
        </svg>
      </div>
    </section>
  );
}
