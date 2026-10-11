import { subteams } from "@/lib/team-data";

const colorOf = (id: string) => subteams.find((s) => s.id === id)?.color ?? "#94a3b8";

export const SUBTEAM_COLORS = {
  power: colorOf("power"),
  software: colorOf("software"),
  structures: colorOf("structures"),
  comms: colorOf("comms"),
  payload: "#fb923c",
};

/**
 * The CubeSat stack, bottom to top: antenna deck at the base, transceiver next
 * to it, GoPro looking out the top. The 3D model builds each board by its
 * position in this list, so keep the order in sync with cubesat-model.ts.
 */
export const CUBESAT_LAYERS = [
  { name: "Antenna deck", owner: "Comms", color: SUBTEAM_COLORS.comms, height: 10 },
  { name: "VHF/UHF transceiver", owner: "Comms", color: SUBTEAM_COLORS.comms, height: 12 },
  { name: "Power system & battery", owner: "Power", color: SUBTEAM_COLORS.power, height: 22 },
  { name: "ADCS · reaction wheels", owner: "Software · Structures", color: SUBTEAM_COLORS.structures, height: 16 },
  { name: "Flight computer & FPGA", owner: "Software", color: SUBTEAM_COLORS.software, height: 10 },
  { name: "GoPro vision payload", owner: "Payload · Software", color: SUBTEAM_COLORS.payload, height: 36 },
];
