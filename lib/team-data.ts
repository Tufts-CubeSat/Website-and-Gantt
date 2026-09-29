/**
 * Team Data
 *
 * Single source of truth for subteams, members, meetings, and milestones.
 * Used by the homepage, /team, and /subteams. Content mirrors the
 * Fall 2026 General Interest Meeting deck.
 *
 * Member photos: drop a portrait at public/team/<slug>.jpg and it will be
 * picked up automatically (see public/team/README.md).
 *
 * Member links: add `linkedin` and/or `website` (any personal site, GitHub,
 * portfolio, etc.) to a member below and the icons appear on /team.
 */

export type SubteamId = "structures" | "software" | "power" | "comms" | "weather-balloon";

export interface Meeting {
  day: string;
  time: string;
  location: string;
}

export interface Subteam {
  id: SubteamId;
  name: string;
  tagline: string;
  /** CSS color used for accents, avatar rings, and diagram labels */
  color: string;
  /** Optional intro paragraphs, shown above the goals on /subteams */
  about?: string[];
  whatWeDo: string[];
  /** Optional reasons to join, shown on /subteams */
  whyJoin?: string[];
  semesterGoals: string[];
  futureGoals: string[];
  learn: string[];
  meeting?: Meeting;
  isNew?: boolean;
}

export interface Member {
  name: string;
  slug: string;
  roles: string[];
  subteams: SubteamId[];
  /** Project leads and subteam leads */
  lead?: "project" | "subteam";
  /** Full LinkedIn profile URL */
  linkedin?: string;
  /** Website of choice: personal site, GitHub, portfolio, ... */
  website?: string;
}

export const allTeamMeeting: Meeting = {
  day: "Tuesdays",
  time: "6:30pm – 7:30pm",
  location: "Halligan 145",
};

export const channels = [
  { name: "Discord", detail: "CubeSat server" },
  { name: "Slack", detail: "Tufts SEDS workspace" },
];

export const subteams: Subteam[] = [
  {
    id: "structures",
    name: "Structures",
    tagline: "The chassis, the thermal and vibration analysis, and the orbit it all lives in.",
    color: "#f59e0b",
    whatWeDo: ["Machining", "Simulation & testing", "Systems engineering", "Orbital mechanics"],
    semesterGoals: [
      "CAD the GoPro payload parts and boards",
      "Iterate on the chassis CAD with updated specs",
      "Thermal and vibrational analysis of the chassis",
      "Orbital mechanics calculations",
      "Build a physical model",
    ],
    futureGoals: [],
    learn: ["CAD (Onshape)", "ANSYS", "Machine Lab & Makerspace equipment", "FreeFlyer"],
    meeting: { day: "Fridays", time: "6:00pm – 7:30pm", location: "Nolop" },
  },
  {
    id: "software",
    name: "Software",
    tagline: "Image processing, flight software, and the neural network that finds debris.",
    color: "#38bdf8",
    whatWeDo: ["Image processing", "Flight software", "FPGA development", "Web development"],
    semesterGoals: [
      "Python image processing pipeline, verified and tested",
      "Port image processing to C",
      "Contribute to the open-source Generalized ADCS project",
      "Flight software & FPGA on the new board",
      "Web development (sub-subteam)",
    ],
    futureGoals: [
      "Neural network design and development",
      "A complete, adaptive onboard machine learning pipeline",
      "Transfer programs of various sizes over RF",
      "Mission simulation",
    ],
    learn: [
      "Git & GitHub (issues, PRs, branches)",
      "Python",
      "C/C++",
      "Linear algebra",
      "Design & development best practices",
      "Optimization",
    ],
    meeting: { day: "Saturdays", time: "12:00pm – 1:00pm", location: "Halligan 145" },
  },
  {
    id: "power",
    name: "Power",
    tagline: "Collecting sunlight and keeping every subsystem alive through eclipse.",
    color: "#a3e635",
    whatWeDo: ["Electrical power system design", "PCB design", "Circuit simulation"],
    semesterGoals: [
      "Design an Electrical Power System (EPS) for the CubeSat",
      "Design PCBs for solar cell power collection and regulation",
      "Document trade-offs, benefits, and future design iterations",
    ],
    futureGoals: [
      "Evaluate the whole CubeSat system and EPS efficiency",
      "Research new methods to improve power collection efficiency",
      "Discuss industry standards with professionals in the field",
    ],
    learn: ["Altium / KiCad", "PCB design", "LTspice circuit simulation", "Electronic circuit design", "Systems engineering"],
    meeting: { day: "Sundays", time: "3:00pm – 4:00pm", location: "Halligan 145" },
  },
  {
    id: "comms",
    name: "Comms",
    tagline: "The radio link between SPACE RACCOON and the ground.",
    color: "#c084fc",
    whatWeDo: ["RF link design", "Ground station operations", "Spectrum licensing"],
    semesterGoals: [
      "Select an operational frequency band (VHF/UHF baseline) and document regulatory requirements",
      "Research and select a compatible transceiver and antenna",
      "Build a prototype ground station and demonstrate packet transmit/receive",
    ],
    futureGoals: [
      "End-to-end image downlink using payload data (compression + packetization)",
      "Environmental testing of RF equipment (thermal, vibration, vacuum)",
      "An automated operations pipeline to receive, decode, store telemetry, and send commands",
    ],
    learn: [
      "RF & satellite link fundamentals (antennas, link budgets, Doppler)",
      "Spectrum regulations & mission operations",
      "End-to-end data handling (packetizing, decoding, visualization)",
    ],
    meeting: { day: "Sundays", time: "3:30pm – 4:30pm", location: "Halligan 145" },
  },
  {
    // TODO(weather-balloon): add a meeting time and members once they're set.
    id: "weather-balloon",
    name: "Weather Balloon",
    tagline: "A giant helium balloon that carries our electronics to near space, about 100,000 ft up.",
    color: "#fb7185",
    about: [
      "A weather balloon is a giant helium balloon attached to a box of electronics. It climbs to near space (around 100,000 ft) and captures incredible footage of the curvature of the Earth, then falls back to the ground a few hours later for us to recover.",
      "It isn't a CubeSat subsystem, but it's an extremely useful way to test electronics and communications systems before we build and launch the CubeSat, which is why many CubeSat programs (including ours!) run ballooning projects.",
    ],
    whatWeDo: ["Balloon research", "Payload box design", "Launch-day logistics", "Flight tracking"],
    whyJoin: [
      "Very beginner friendly: no experience needed",
      "Build and launch in months, not years",
      "Bragging rights for sending hardware to near space, far higher than rocketry or commercial flights",
      "Go as technical as you want",
    ],
    semesterGoals: [
      "Research high-altitude balloons",
      "Design a simple payload box",
      "Plan the logistics for launch day",
    ],
    futureGoals: [],
    learn: [
      "Flight simulation",
      "Balloon filling & launch operations",
      "In-flight tracking",
      "Onboard electronics",
      "HAM radio (get licensed!)",
    ],
    isNew: true,
  },
];

export const members: Member[] = [
  { name: "William Goldman", slug: "william-goldman", roles: ["Project Lead", "Software Lead"], subteams: ["software"], lead: "project", linkedin: "https://www.linkedin.com/in/william-goldman-79125a283/", website: "https://goldmanwilliam.com", },
  { name: "Natalie Germanov", slug: "natalie-germanov", roles: ["Project Lead", "Structures Lead"], subteams: ["structures"], lead: "project" },
  { name: "Jacky Zhao", slug: "jacky-zhao", roles: ["Power Lead"], subteams: ["power"], lead: "subteam" },
  { name: "Ryan Cooley", slug: "ryan-cooley", roles: ["Comms Lead"], subteams: ["comms"], lead: "subteam" },
  { name: "Allie Staiger", slug: "allie-staiger", roles: ["Structures Member"], subteams: ["structures"] },
  { name: "Isaac Meredith", slug: "isaac-meredith", roles: ["Structures Member"], subteams: ["structures"] },
  { name: "Steven Bagade", slug: "steven-bagade", roles: ["Power Member"], subteams: ["power"] },
  { name: "Daniel Carreno", slug: "daniel-carreno", roles: ["Power Member"], subteams: ["power"] },
  { name: "Jules Crowson", slug: "jules-crowson", roles: ["Power Member"], subteams: ["power"] },
  { name: "Brandon Douglas", slug: "brandon-douglas", roles: ["Comms Member"], subteams: ["comms"] },
  { name: "Shepard Rogers", slug: "shepard-rogers", roles: ["Software Member"], subteams: ["software"] },
  { name: "Kai Kaplinsky", slug: "kai-kaplinsky", roles: ["Software Member"], subteams: ["software"] },
];

/** Tufts email addresses that don't follow first.last@tufts.edu */
export const emailOverrides: Record<string, string> = {
  "william-goldman": "william.goldman@tufts.edu",
};

export const alumni = [
  "Andy Navarro",
  "Vanessa Bellotti",
  "Trevor Wallace",
  "Kyle Wigdor",
  "Alberto de la Villa Ramirez",
  "Jai Deshpande",
  "Maggie Olson",
];

export const specialThanks = ["Evana Gizzi", "Niclas Scheuer"];

export const collaborators = ["MIT", "UMass Lowell"];

export const employers = ["Medtronic", "Draper", "NVIDIA", "Blue Origin", "Takeda", "MITRE", "Amazon Robotics"];

export interface Milestone {
  month: string;
  items: string[];
}

export const milestones: Milestone[] = [
  { month: "September", items: ["Avionics board complete"] },
  { month: "October", items: ["Image processing software complete", "Avionics board tested"] },
  { month: "November", items: ["Structure design prototype manufactured"] },
  { month: "December", items: ["ADCS board design complete"] },
  { month: "February", items: ["Flight software complete", "Reaction wheel manufacturing complete"] },
  { month: "March", items: ["More to come…"] },
];

export function getSubteam(id: SubteamId): Subteam {
  const subteam = subteams.find((s) => s.id === id);
  if (!subteam) throw new Error(`Unknown subteam: ${id}`);
  return subteam;
}

export function getMemberEmail(member: Member): string {
  if (emailOverrides[member.slug]) return emailOverrides[member.slug];
  const [first, ...rest] = member.name.split(" ");
  return `${first.toLowerCase()}.${rest.join("").toLowerCase()}@tufts.edu`;
}
