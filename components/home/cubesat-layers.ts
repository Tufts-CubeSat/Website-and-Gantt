/**
 * The CubeSat stack, bottom to top: antenna deck at the base, transceiver next
 * to it, GoPro looking out the top. The 3D model builds each board by its
 * position in this list, so keep the order in sync with cubesat-model.ts.
 */
export const CUBESAT_LAYERS = [
  { name: "Antenna deck", height: 10 },
  { name: "VHF/UHF transceiver", height: 12 },
  { name: "Power system & battery", height: 22 },
  { name: "ADCS · reaction wheels", height: 16 },
  { name: "Flight computer & FPGA", height: 10 },
  { name: "GoPro vision payload", height: 36 },
];
