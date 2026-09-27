"use client";

import { useRef } from "react";
import { gsap, HEADER_OFFSET, useGsap } from "./use-gsap";

/**
 * Pinned, scroll-scrubbed walkthrough of the SPACE RACCOON mission.
 * Without motion (reduced-motion or before hydration) the panels render as a
 * plain list next to a static composite of the scene.
 */

const stages = [
  {
    title: "Launch",
    kicker: "Target 2029",
    body: "After two to three years of design and testing on campus, SPACE RACCOON rides to orbit as a compact 2U CubeSat: the first satellite ever built at Tufts.",
    tech: ["2U CubeSat", "COTS components", "Systems engineering"],
  },
  {
    title: "Reach orbit",
    kicker: "Low Earth Orbit · 14 months",
    body: "Deployed into Low Earth Orbit for a 14-month mission, the satellite runs on body-mounted solar cells and holds its attitude with in-house reaction wheels.",
    tech: ["Electrical power system", "ADCS", "Reaction wheels"],
  },
  {
    title: "Detect",
    kicker: "Vision payload",
    body: "During scheduled imaging windows a modified GoPro captures a frame every 30 seconds, searching for debris against the star field.",
    tech: ["GoPro payload", "Imaging windows", "Onshape CAD"],
  },
  {
    title: "Classify",
    kicker: "Onboard computer vision",
    body: "Image processing isolates each object and a neural network classifies it (fragment, rocket body, defunct satellite) right on the spacecraft.",
    tech: ["Python → C image processing", "Neural network", "FPGA", "Flight software"],
  },
  {
    title: "Assess the risk",
    kicker: "Collision screening",
    body: "Tracks across frames feed a collision-risk assessment that flags the objects that matter most to anything else flying in LEO.",
    tech: ["Orbital mechanics", "Linear algebra", "Risk scoring"],
  },
  {
    title: "Downlink",
    kicker: "VHF / UHF",
    body: "Only frames that contain debris are compressed, packetized, and sent over our radio link to a student-built ground station.",
    tech: ["Transceiver & antenna", "Link budget", "Ground station", "Packetization"],
  },
  {
    title: "Open to everyone",
    kicker: "Open source",
    body: "Flight software and debris data are released openly to support safer orbital operations and the student teams that come after us.",
    tech: ["Open-source software", "Open data", "GitHub"],
  },
];

// Scene geometry (viewBox 0 0 800 560)
const EARTH = { cx: 400, cy: 1300, r: 820 };
const ORBIT_R = 960;
const SAT_ANGLES = { deploy: -100, detect: -90, downlink: -76, open: -68 };

function orbitPoint(angleDeg: number, r = ORBIT_R) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: EARTH.cx + r * Math.cos(a), y: EARTH.cy + r * Math.sin(a) };
}

function satTransform(angleDeg: number) {
  const { x, y } = orbitPoint(angleDeg);
  return `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angleDeg + 90})`;
}

const orbitStart = orbitPoint(-118);
const orbitEnd = orbitPoint(-62);
const detectAt = orbitPoint(SAT_ANGLES.detect);
const downlinkAt = orbitPoint(SAT_ANGLES.downlink);
const station = orbitPoint(-70, EARTH.r);

const ambientDebris = [
  [70, 170], [170, 250], [240, 150], [330, 210], [460, 150], [560, 170], [770, 400], [130, 320], [300, 280], [690, 150],
];

const targets = [
  // Label placement is per-target so the tags never collide.
  { x: 510, y: 305, r: 4, label: "FRAGMENT 0.94", risk: "low", place: "below" },
  { x: 590, y: 245, r: 6, label: "DEFUNCT SAT 0.88", risk: "high", place: "above" },
  { x: 705, y: 190, r: 5, label: "ROCKET BODY 0.81", risk: "med", place: "above-end" },
  { x: 735, y: 300, r: 3.5, label: "FRAGMENT 0.76", risk: "low", place: "below-end" },
] as const;

const riskColor = { low: "var(--home-risk-low)", med: "var(--home-risk-med)", high: "var(--home-risk-high)" };

const networkNodes = [orbitPoint(-80, EARTH.r), orbitPoint(-88, EARTH.r), orbitPoint(-97, EARTH.r), orbitPoint(-106, EARTH.r)];

export function MissionStory() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const section = root.current;
    if (!section) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      section.dataset.animated = "true";
      const q = gsap.utils.selector(section);
      const panels = q(".story-panel");
      const dots = q(".story-dot");
      const sat = section.querySelector<SVGGElement>(".s-sat");
      const satState = { a: SAT_ANGLES.deploy };
      const placeSat = () => sat?.setAttribute("transform", satTransform(satState.a));
      placeSat();

      gsap.set(panels, { autoAlpha: 0, y: 32 });
      gsap.set(panels[0], { autoAlpha: 1, y: 0 });
      gsap.set(dots, { opacity: 0.3, scale: 1 });
      gsap.set(dots[0], { opacity: 1, scale: 1.35 });
      gsap.set(q(".s-draw"), { strokeDashoffset: 1 });
      gsap.set(q(".s-sat-body"), { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(
        q(".s-ambient, .s-cone, .s-flash, .s-target, .s-box, .s-label, .s-ring, .s-readout, .s-station, .s-packet, .s-node, .s-open"),
        { autoAlpha: 0 }
      );
      gsap.set(q(".s-target, .s-ring"), { scale: 0, transformOrigin: "50% 50%" });
      // Apex of the cone is its left edge, so scale out from there.
      gsap.set(q(".s-cone"), { scaleX: 0, transformOrigin: "0% 50%" });

      // 1 · Launch: draws while the section scrolls up to its pinned position.
      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "top 80%", end: `top top+=${HEADER_OFFSET}`, scrub: 0.6 },
        })
        .to(q(".s-ascent"), { strokeDashoffset: 0, duration: 0.75, ease: "power1.in" })
        .to(q(".s-sat-body"), { scale: 1.5, duration: 0.25, ease: "back.out(2)" });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut", duration: 1 },
        scrollTrigger: {
          trigger: q(".story-pin")[0],
          pin: true,
          start: `top top+=${HEADER_OFFSET}`,
          end: () => `+=${window.innerHeight * (stages.length - 1)}`,
          scrub: 0.6,
          snap: { snapTo: "labels", duration: { min: 0.2, max: 0.6 }, delay: 0.08, ease: "power1.inOut" },
          invalidateOnRefresh: true,
        },
      });

      const showStage = (i: number, at: number) => {
        tl.to(panels[i - 1], { autoAlpha: 0, y: -32, duration: 0.3 }, at)
          .to(panels[i], { autoAlpha: 1, y: 0, duration: 0.35 }, at + 0.15)
          .to(dots[i - 1], { opacity: 0.55, scale: 1, duration: 0.3 }, at)
          .to(dots[i], { opacity: 1, scale: 1.35, duration: 0.3 }, at);
      };

      tl.to(q(".s-progress"), { scaleY: 1, ease: "none", duration: stages.length - 1 }, 0).addLabel("s0", 0);

      // 2 · Orbit
      showStage(1, 0);
      tl.to(q(".s-ascent"), { opacity: 0, duration: 0.3 }, 0)
        .to(q(".s-orbit"), { strokeDashoffset: 0 }, 0)
        .to(satState, { a: SAT_ANGLES.detect, onUpdate: placeSat }, 0)
        .to(q(".s-ambient"), { autoAlpha: 0.7, stagger: 0.05, duration: 0.4 }, 0.3)
        .addLabel("s1", 1);

      // 3 · Detect
      showStage(2, 1);
      tl.to(q(".s-cone"), { autoAlpha: 1, scaleX: 1, duration: 0.5 }, 1.1)
        .to(q(".s-ambient"), { autoAlpha: 0.3, duration: 0.4 }, 1.2)
        .to(q(".s-flash"), { autoAlpha: 0.5, duration: 0.12, yoyo: true, repeat: 1 }, 1.55)
        .to(q(".s-target"), { autoAlpha: 1, scale: 1, stagger: 0.08, duration: 0.3, ease: "back.out(3)" }, 1.6)
        .addLabel("s2", 2);

      // 4 · Classify
      showStage(3, 2);
      tl.to(q(".s-box"), { autoAlpha: 1, stagger: 0.1, duration: 0.3 }, 2.1)
        .to(q(".s-box rect"), { strokeDashoffset: 0, stagger: 0.1, duration: 0.4 }, 2.1)
        .to(q(".s-label"), { autoAlpha: 1, stagger: 0.1, duration: 0.3 }, 2.35)
        .addLabel("s3", 3);

      // 5 · Assess risk
      showStage(4, 3);
      tl.to(q(".s-box, .s-label"), { autoAlpha: 0.35, duration: 0.3 }, 3.1)
        .to(q(".s-ring"), { autoAlpha: 1, scale: 1, stagger: 0.08, duration: 0.4, ease: "back.out(2)" }, 3.15)
        .to(q(".s-trajectory"), { strokeDashoffset: 0, duration: 0.5 }, 3.3)
        .to(q(".s-readout"), { autoAlpha: 1, duration: 0.3 }, 3.5)
        .addLabel("s4", 4);

      // 6 · Downlink
      showStage(5, 4);
      tl.to(q(".s-cone, .s-box, .s-label, .s-readout, .s-trajectory"), { autoAlpha: 0, duration: 0.3 }, 4)
        .to(q(".s-ring, .s-target, .s-ambient"), { autoAlpha: 0.25, duration: 0.3 }, 4)
        .to(satState, { a: SAT_ANGLES.downlink, onUpdate: placeSat, duration: 0.5 }, 4.05)
        .to(q(".s-station"), { autoAlpha: 1, duration: 0.3 }, 4.3)
        .to(q(".s-beam"), { strokeDashoffset: 0, duration: 0.3 }, 4.45)
        .to(q(".s-packet"), { autoAlpha: 1, duration: 0.05, stagger: 0.12 }, 4.55)
        .fromTo(
          q(".s-packet"),
          { x: 0, y: 0 },
          { x: station.x - downlinkAt.x, y: station.y - 10 - downlinkAt.y, duration: 0.35, stagger: 0.12, ease: "none" },
          4.55
        )
        .addLabel("s5", 5);

      // 7 · Open data
      showStage(6, 5);
      tl.to(q(".s-packet"), { autoAlpha: 0, duration: 0.2 }, 5)
        .to(satState, { a: SAT_ANGLES.open, onUpdate: placeSat, duration: 0.6 }, 5)
        .to(q(".s-network"), { strokeDashoffset: 0, stagger: 0.08, duration: 0.4 }, 5.15)
        .to(q(".s-node"), { autoAlpha: 1, stagger: 0.08, duration: 0.25 }, 5.3)
        .to(q(".s-open"), { autoAlpha: 1, duration: 0.3 }, 5.5)
        .addLabel("s6", stages.length - 1);

      return () => {
        delete section.dataset.animated;
      };
    });
  });

  return (
    <section ref={root} className="story relative border-t border-[var(--home-border)]" aria-labelledby="story-heading">
      <div className="story-pin relative mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-[2.5rem_minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center md:gap-10 md:px-10 lg:px-14">
        {/* Progress rail (desktop, animated only) */}
        <div className="story-rail relative hidden h-[22rem] md:block" aria-hidden>
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--home-border)]" />
          <div className="s-progress absolute left-1/2 top-0 h-full w-px origin-top -translate-x-1/2 scale-y-0 bg-[var(--home-signal)]" />
          <ol className="relative flex h-full flex-col justify-between">
            {stages.map((stage, i) => (
              <li key={stage.title} className="story-dot flex justify-center">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--home-signal)] bg-[var(--home-bg)] text-[10px] font-semibold text-[var(--home-signal)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Text panels */}
        <div className="order-2 md:order-none">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--home-signal)]">The mission</p>
          <h2
            id="story-heading"
            className="mb-6 font-[family-name:var(--font-home-display)] text-2xl font-semibold tracking-tight text-[var(--home-text)] md:text-3xl"
          >
            From launch pad to open data.
          </h2>
          <div className="story-panels relative flex flex-col gap-8">
            {stages.map((stage, i) => (
              <article key={stage.title} className="story-panel">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-muted)]">
                  {String(i + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")} · {stage.kicker}
                </p>
                <h3 className="mb-3 font-[family-name:var(--font-home-display)] text-3xl font-bold tracking-tight text-[var(--home-text)] md:text-4xl">
                  {stage.title}
                </h3>
                <p className="mb-5 max-w-md text-sm leading-relaxed text-[var(--home-muted)] md:text-base">{stage.body}</p>
                <ul className="flex flex-wrap gap-2">
                  {stage.tech.map((tech) => (
                    <li key={tech} className="story-chip px-2.5 py-1 text-xs font-medium text-[var(--home-text)]">
                      {tech}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        {/* Scene */}
        <div className="story-scene order-1 md:order-none">
          <MissionScene />
        </div>
      </div>
    </section>
  );
}

function MissionScene() {
  const high = targets.find((t) => t.risk === "high")!;

  return (
    <svg
      viewBox="20 130 780 430"
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label="Diagram of SPACE RACCOON in orbit detecting, classifying, and downlinking space debris data"
    >
      <defs>
        <radialGradient id="earth-fill" cx="50%" cy="0%" r="75%">
          <stop offset="0%" style={{ stopColor: "var(--home-earth-edge)" }} stopOpacity={0.55} />
          <stop offset="35%" style={{ stopColor: "var(--home-earth)" }} />
          <stop offset="100%" style={{ stopColor: "var(--home-bg)" }} />
        </radialGradient>
        <linearGradient id="cone-fill" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--home-signal)" }} stopOpacity={0.35} />
          <stop offset="100%" style={{ stopColor: "var(--home-signal)" }} stopOpacity={0} />
        </linearGradient>
        <filter id="atmo-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Earth + atmosphere */}
      <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r + 8} fill="none" style={{ stroke: "var(--home-earth-edge)" }} strokeWidth={10} opacity={0.35} filter="url(#atmo-blur)" />
      <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r} fill="url(#earth-fill)" style={{ stroke: "var(--home-earth-edge)" }} strokeWidth={1.5} />
      {[40, 90, 150].map((d) => (
        <circle key={d} cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r - d} fill="none" style={{ stroke: "var(--home-earth-edge)" }} strokeOpacity={0.15} strokeDasharray="2 8" />
      ))}

      {/* Orbit */}
      <path
        className="s-orbit s-draw"
        d={`M ${orbitStart.x} ${orbitStart.y} A ${ORBIT_R} ${ORBIT_R} 0 0 1 ${orbitEnd.x} ${orbitEnd.y}`}
        pathLength={1}
        strokeDasharray="1 1"
        fill="none"
        style={{ stroke: "var(--home-signal)" }}
        strokeOpacity={0.55}
        strokeWidth={1.5}
      />

      {/* Launch ascent */}
      <path
        className="s-ascent s-draw"
        d={`M 110 532 C 115 440, 150 372, ${orbitPoint(SAT_ANGLES.deploy).x} ${orbitPoint(SAT_ANGLES.deploy).y}`}
        pathLength={1}
        strokeDasharray="1 1"
        fill="none"
        style={{ stroke: "var(--home-risk-med)" }}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Ambient debris */}
      {ambientDebris.map(([x, y]) => (
        <circle key={`${x}-${y}`} className="s-ambient" cx={x} cy={y} r={1.8} style={{ fill: "var(--home-debris)" }} opacity={0.5} />
      ))}

      {/* Camera field of view */}
      <polygon
        className="s-cone"
        points={`${detectAt.x},${detectAt.y} 790,130 790,330`}
        fill="url(#cone-fill)"
        style={{ stroke: "var(--home-signal)" }}
        strokeOpacity={0.4}
        strokeDasharray="4 6"
      />
      <rect className="s-flash" x={detectAt.x} y={130} width={400} height={210} style={{ fill: "var(--home-text)" }} opacity={0} />

      {/* Trajectory of the high-risk object toward our orbit */}
      <path
        className="s-trajectory s-draw"
        d={`M ${high.x + 60} ${high.y - 70} L ${high.x} ${high.y} L ${high.x - 150} ${high.y + 160}`}
        pathLength={1}
        strokeDasharray="1 1"
        fill="none"
        style={{ stroke: "var(--home-risk-high)" }}
        strokeWidth={1.5}
      />

      {/* Detected targets */}
      {targets.map((t) => (
        <g key={t.label}>
          <circle className="s-ring" cx={t.x} cy={t.y} r={t.r + 16} fill="none" style={{ stroke: riskColor[t.risk] }} strokeWidth={2} />
          <circle className="s-target" cx={t.x} cy={t.y} r={t.r} style={{ fill: "var(--home-debris)" }} />
          <g className="s-box">
            <rect
              className="s-draw"
              x={t.x - 13}
              y={t.y - 13}
              width={26}
              height={26}
              pathLength={1}
              strokeDasharray="1 1"
              fill="none"
              style={{ stroke: "var(--home-signal)" }}
              strokeWidth={1.5}
            />
          </g>
          <text
            className="s-label"
            x={t.place.endsWith("end") ? t.x + 13 : t.x - 13}
            y={t.place.startsWith("above") ? t.y - 19 : t.y + 30}
            textAnchor={t.place.endsWith("end") ? "end" : "start"}
            fontSize={13}
            fontWeight={600}
            letterSpacing={0.5}
            style={{ fill: "var(--home-text)", fontFamily: "var(--font-geist-mono), monospace" }}
          >
            {t.label}
          </text>
        </g>
      ))}

      {/* Risk readout */}
      <g className="s-readout" transform="translate(50 150)">
        <rect width={240} height={64} rx={6} style={{ fill: "var(--home-panel)", stroke: "var(--home-border)" }} opacity={0.92} />
        <text x={14} y={24} fontSize={12} letterSpacing={1} style={{ fill: "var(--home-muted)", fontFamily: "var(--font-geist-mono), monospace" }}>
          COLLISION RISK
        </text>
        <text x={14} y={48} fontSize={17} fontWeight={700} style={{ fill: "var(--home-risk-high)", fontFamily: "var(--font-geist-mono), monospace" }}>
          HIGH · DEFUNCT SAT
        </text>
      </g>

      {/* Ground station */}
      <g className="s-station" transform={`translate(${station.x} ${station.y}) rotate(20)`}>
        <path d="M -12 -2 Q 0 -22 12 -2 Z" style={{ fill: "var(--home-text)" }} />
        <line x1={0} y1={-2} x2={0} y2={8} style={{ stroke: "var(--home-text)" }} strokeWidth={2} />
        <line x1={0} y1={-10} x2={-6} y2={-22} style={{ stroke: "var(--home-text)" }} strokeWidth={1.5} />
      </g>
      <path
        className="s-beam s-draw"
        d={`M ${downlinkAt.x} ${downlinkAt.y} L ${station.x} ${station.y - 12}`}
        pathLength={1}
        strokeDasharray="1 1"
        fill="none"
        style={{ stroke: "var(--home-signal)" }}
        strokeWidth={1.5}
      />
      {[0, 1, 2].map((i) => (
        <rect key={i} className="s-packet" x={downlinkAt.x - 4} y={downlinkAt.y - 4} width={8} height={8} rx={1.5} style={{ fill: "var(--home-signal)" }} />
      ))}

      {/* Open data network */}
      {networkNodes.map((n, i) => (
        <g key={i}>
          <path
            className="s-network s-draw"
            d={`M ${station.x} ${station.y} Q ${(station.x + n.x) / 2} ${Math.min(station.y, n.y) - 50} ${n.x} ${n.y}`}
            pathLength={1}
            strokeDasharray="1 1"
            fill="none"
            style={{ stroke: "var(--home-risk-low)" }}
            strokeOpacity={0.8}
            strokeWidth={1.2}
          />
          <circle className="s-node" cx={n.x} cy={n.y} r={4} style={{ fill: "var(--home-risk-low)" }} />
        </g>
      ))}
      <text
        className="s-open"
        x={station.x - 190}
        y={station.y - 90}
        fontSize={15}
        fontWeight={600}
        letterSpacing={1}
        style={{ fill: "var(--home-risk-low)", fontFamily: "var(--font-geist-mono), monospace" }}
      >
        {"</> OPEN DATA"}
      </text>

      {/* Satellite */}
      <g className="s-sat" transform={satTransform(SAT_ANGLES.detect)}>
        <g className="s-sat-body" transform="scale(1.5)">
          <rect x={-17} y={-9} width={34} height={18} rx={1.5} style={{ fill: "#1d4ed8", stroke: "var(--home-text)" }} strokeWidth={1.2} />
          <line x1={0} y1={-9} x2={0} y2={9} style={{ stroke: "var(--home-text)" }} strokeWidth={1} />
          <line x1={-17} y1={0} x2={17} y2={0} style={{ stroke: "#f59e0b" }} strokeWidth={1} opacity={0.8} />
          <circle cx={17} cy={0} r={3} style={{ fill: "var(--home-signal)" }} />
          <line x1={-17} y1={-6} x2={-30} y2={-14} style={{ stroke: "var(--home-text)" }} strokeWidth={1} />
        </g>
      </g>
    </svg>
  );
}
