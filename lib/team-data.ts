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
  /** Optional intro paragraph, shown above the goals on /subteams */
  about?: string;
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
    tagline: "Chassis design, thermal and vibration analysis, and orbital mechanics.",
    color: "#f59e0b",
    semesterGoals: ["CAD the payload and boards", "Iterate on the chassis", "Thermal & vibration analysis", "Build a physical model"],
    futureGoals: [],
    learn: ["Onshape", "ANSYS", "Machine shop tools", "FreeFlyer"],
    meeting: { day: "Fridays", time: "6:00pm – 7:30pm", location: "Nolop" },
  },
  {
    id: "software",
    name: "Software",
    tagline: "Image processing, flight software, and onboard debris detection.",
    color: "#38bdf8",
    semesterGoals: ["Image processing pipeline (Python → C)", "Flight software & FPGA", "Generalized ADCS contributions", "This website"],
    futureGoals: ["Onboard ML pipeline", "Data transfer over RF", "Mission simulation"],
    learn: ["Git & GitHub", "Python, C/C++", "Linear algebra"],
    meeting: { day: "Saturdays", time: "12:00pm – 1:00pm", location: "Halligan 145" },
  },
  {
    id: "power",
    name: "Power",
    tagline: "Collecting sunlight and keeping every subsystem alive through eclipse.",
    color: "#a3e635",
    semesterGoals: ["Design the electrical power system", "Solar collection & regulation PCBs"],
    futureGoals: ["System-level efficiency analysis", "Better power collection"],
    learn: ["Altium / KiCad", "PCB design", "LTspice"],
    meeting: { day: "Sundays", time: "3:00pm – 4:00pm", location: "Halligan 145" },
  },
  {
    id: "comms",
    name: "Comms",
    tagline: "The radio link between SPACE RACCOON and the ground.",
    color: "#c084fc",
    semesterGoals: ["Choose a frequency band", "Select a transceiver & antenna", "Prototype ground station"],
    futureGoals: ["Image downlink", "RF environmental testing", "Automated ground operations"],
    learn: ["RF & link budgets", "Spectrum regulations", "Packet handling"],
    meeting: { day: "Sundays", time: "3:30pm – 4:30pm", location: "Halligan 145" },
  },
  {
    // TODO(weather-balloon): add a meeting time and members once they're set.
    id: "weather-balloon",
    name: "Weather Balloon",
    tagline: "Sending electronics to near space, about 100,000 ft up.",
    color: "#fb7185",
    about:
      "A helium balloon carries a payload box to near space, films the curvature of the Earth, and falls back a few hours later. It's a fast, beginner-friendly way to test electronics and comms before the CubeSat flies.",
    semesterGoals: ["Research high-altitude balloons", "Design the payload box", "Plan launch day"],
    futureGoals: [],
    learn: ["Flight simulation", "Launch operations", "Flight tracking", "HAM radio"],
    isNew: true,
  },
];

export const members: Member[] = [
  { name: "William Goldman", slug: "william-goldman", roles: ["Project Lead", "Software Lead"], subteams: ["software"], lead: "project", linkedin: "https://www.linkedin.com/in/william-goldman-79125a283/", website: "https://goldmanwilliam.com", },
  { name: "Natalie Germanov", slug: "natalie-germanov", roles: ["Project Lead", "Structures Lead"], subteams: ["structures"], lead: "project" },
  { name: "Jacky Zhao", slug: "jacky-zhao", roles: ["Power Lead"], subteams: ["power"], lead: "subteam" },
  { name: "Ryan Cooley", slug: "ryan-cooley", roles: ["Comms Lead"], subteams: ["comms"], lead: "subteam" },
  { name: "Adonis Deking", slug: "adonis-deking", roles: ["Structures Member"], subteams: ["structures"], website: "https://adonisdeking.com" },
  { name: "Allie Staiger", slug: "allie-staiger", roles: ["Structures Member"], subteams: ["structures"] },
  { name: "Isaac Meredith", slug: "isaac-meredith", roles: ["Structures Member"], subteams: ["structures"] },
  { name: "Molly Kreitman", slug: "molly-kreitman", roles: ["Structures Member"], subteams: ["structures"] },
  { name: "Timothy Ngo", slug: "timothy-ngo", roles: ["Structures Member"], subteams: ["structures"] },
  { name: "Steven Bagade", slug: "steven-bagade", roles: ["Power Member"], subteams: ["power"] },
  { name: "Daniel Carreno", slug: "daniel-carreno", roles: ["Power Member"], subteams: ["power"] },
  { name: "Jules Crowson", slug: "jules-crowson", roles: ["Power Member"], subteams: ["power"] },
  { name: "Evey Slavik", slug: "evey-slavik", roles: ["Power Member"], subteams: ["power"] },
  { name: "Max Chen", slug: "max-chen", roles: ["Power Member"], subteams: ["power"] },
  { name: "Sean Ozalpasan", slug: "sean-ozalpasan", roles: ["Power Member"], subteams: ["power"] },
  { name: "Navya Agrawal", slug: "navya-agrawal", roles: ["Comms & Power Member"], subteams: ["comms", "power"] },
  { name: "Maksim Mandel", slug: "maksim-mandel", roles: ["Comms Member"], subteams: ["comms"] },
  { name: "Gabriel Krauze", slug: "gabriel-krauze", roles: ["Comms Member"], subteams: ["comms"] },
  { name: "Brandon Douglas", slug: "brandon-douglas", roles: ["Comms Member"], subteams: ["comms"] },
  { name: "Sam Linnington", slug: "sam-linnington", roles: ["Comms Member"], subteams: ["comms"] },
  { name: "Owen Lawler", slug: "owen-lawler", roles: ["Comms Member"], subteams: ["comms"] },
  { name: "Shepard Rogers", slug: "shepard-rogers", roles: ["Software Member"], subteams: ["software"] },
  { name: "Ethan Li", slug: "ethan-li", roles: ["Software Member"], subteams: ["software"] },
  { name: "Brendan Desrosiers", slug: "brendan-desrosiers", roles: ["Software & Structures Member"], subteams: ["software", "structures"] },
  { name: "Kai Kaplinsky", slug: "kai-kaplinsky", roles: ["Software Member"], subteams: ["software"] },
  { name: "Jiajun Li", slug: "jiajun-li", roles: ["Weather Balloon Member"], subteams: ["weather-balloon"] },
];

/** Tufts email addresses that don't follow first.last@tufts.edu */
export const emailOverrides: Record<string, string> = {
  "william-goldman": "william.goldman@tufts.edu",
  "natalie-germanov": "natalie.germanov@tufts.edu",
  "adonis-deking": "adonis.deking@tufts.edu",
  "ethan-li": "ethan.li@tufts.edu",
  "sam-linnington": "samuel.linnington@tufts.edu",
  "owen-lawler": "owen.lawler@tufts.edu",
  "brandon-douglas": "brandon.douglas@tufts.edu",
  "jacky-zhao": "jacky.zhao@tufts.edu",
  "molly-kreitman": "molly.kreitman@tufts.edu",
  "allie-staiger": "allison.staiger@tufts.edu",
  "steven-bagade": "steven.bagade@tufts.edu",
  "evey-slavik": "evey.slavik@tufts.edu",
  "gabriel-krauze": "gabriel.krauze@tufts.edu",
  "jules-crowson": "jules.crowson@tufts.edu",
  "brendan-desrosiers": "brendan.desrosiers@tufts.edu",
  "maksim-mandel": "maksim.mandel@tufts.edu",
  "sean-ozalpasan": "sean.ozalpasan@tufts.edu",
  "max-chen": "maximilian.chen@tufts.edu",
  "jiajun-li": "Jiajun.Li689154@tufts.edu",
  "timothy-ngo": "timothy.ngo@tufts.edu",
  "navya-agrawal": "navya.agrawal@tufts.edu",
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
