import * as THREE from "three";

/**
 * Procedural PBR materials and canvas textures for the CubeSat model, so the
 * scenes need no model or texture downloads beyond the Earth maps.
 */

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(width: number, height: number) {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  return { el, ctx: el.getContext("2d")! };
}

function colorTexture(el: HTMLCanvasElement, anisotropy = 8) {
  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
}

function dataTexture(el: HTMLCanvasElement, anisotropy = 8) {
  const texture = new THREE.CanvasTexture(el);
  texture.anisotropy = anisotropy;
  return texture;
}

/** Packs roughness (G) and metalness (B) the way three.js samples them. */
const metalRough = (roughness: number, metalness: number) =>
  `rgb(0, ${Math.round(roughness * 255)}, ${Math.round(metalness * 255)})`;

function mix(a: string, b: string, t: number) {
  return `#${new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString()}`;
}

/** Body-mounted solar panel: 2 × 4 triple-junction cells on a black substrate. */
function solarPanelTextures() {
  const W = 512;
  const H = 1150;
  const mm = W / 98;
  const color = canvas(W, H);
  const surface = canvas(W, H);
  const c = color.ctx;
  const s = surface.ctx;
  const random = rng(7);

  c.fillStyle = "#16181d";
  c.fillRect(0, 0, W, H);
  s.fillStyle = metalRough(0.75, 0);
  s.fillRect(0, 0, W, H);

  // Gold edge traces on the substrate.
  c.strokeStyle = "#b8873b";
  c.lineWidth = 2;
  c.strokeRect(2.5 * mm, 2.5 * mm, W - 5 * mm, H - 5 * mm);
  s.strokeStyle = metalRough(0.3, 1);
  s.lineWidth = 2;
  s.strokeRect(2.5 * mm, 2.5 * mm, W - 5 * mm, H - 5 * mm);

  const cellW = 42 * mm;
  const cellH = 50 * mm;
  const gapX = (W - 2 * cellW) / 3;
  const gapY = (H - 4 * cellH) / 5;
  const cut = 5 * mm;

  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 4; row++) {
      const x = gapX + col * (cellW + gapX);
      const y = gapY + row * (cellH + gapY);
      const outline = (ctx: CanvasRenderingContext2D) => {
        // Triple-junction cells have two cropped corners.
        ctx.beginPath();
        ctx.moveTo(x + cut, y);
        ctx.lineTo(x + cellW, y);
        ctx.lineTo(x + cellW, y + cellH - cut);
        ctx.lineTo(x + cellW - cut, y + cellH);
        ctx.lineTo(x, y + cellH);
        ctx.lineTo(x, y + cut);
        ctx.closePath();
      };

      const gradient = c.createLinearGradient(x, y, x + cellW, y + cellH);
      const tint = random() * 0.12;
      gradient.addColorStop(0, mix("#1a2a6e", "#3a2a7a", tint));
      gradient.addColorStop(0.55, mix("#13205a", "#24195a", tint));
      gradient.addColorStop(1, mix("#1d1c5c", "#2e1f63", tint));
      c.fillStyle = gradient;
      outline(c);
      c.fill();
      s.fillStyle = metalRough(0.16, 0.25);
      outline(s);
      s.fill();

      // Grid fingers and the busbar along the top of each cell.
      c.save();
      outline(c);
      c.clip();
      c.strokeStyle = "rgba(205, 212, 226, 0.32)";
      c.lineWidth = 1;
      for (let gy = y + 4 * mm; gy < y + cellH; gy += 1.6 * mm) {
        c.beginPath();
        c.moveTo(x, gy);
        c.lineTo(x + cellW, gy);
        c.stroke();
      }
      c.restore();
      c.fillStyle = "#c9ced8";
      c.fillRect(x + cut, y, cellW - cut, 2.2 * mm);
      s.fillStyle = metalRough(0.28, 1);
      s.fillRect(x + cut, y, cellW - cut, 2.2 * mm);
    }
  }

  return { map: colorTexture(color.el, 12), metalRough: dataTexture(surface.el, 12) };
}

/** Solder mask with copper pours under it, gold pads, vias and silkscreen. */
function pcbTextures(mask: string, seed: number, label: string) {
  const N = 512;
  const color = canvas(N, N);
  const surface = canvas(N, N);
  const c = color.ctx;
  const s = surface.ctx;
  const random = rng(seed);

  c.fillStyle = mask;
  c.fillRect(0, 0, N, N);
  s.fillStyle = metalRough(0.42, 0);
  s.fillRect(0, 0, N, N);

  // Copper traces seen through the mask: slightly lighter, 45° routing.
  c.strokeStyle = mix(mask, "#d8c89a", 0.16);
  c.lineCap = "round";
  c.lineJoin = "round";
  for (let i = 0; i < 46; i++) {
    c.lineWidth = random() < 0.2 ? 5 : 2;
    let x = 30 + random() * (N - 60);
    let y = 30 + random() * (N - 60);
    c.beginPath();
    c.moveTo(x, y);
    for (let seg = 0; seg < 3; seg++) {
      const len = 30 + random() * 120;
      const dir = Math.floor(random() * 8) * (Math.PI / 4);
      x = Math.min(N - 20, Math.max(20, x + Math.cos(dir) * len));
      y = Math.min(N - 20, Math.max(20, y + Math.sin(dir) * len));
      c.lineTo(x, y);
    }
    c.stroke();
  }

  // Vias.
  for (let i = 0; i < 90; i++) {
    const x = 20 + random() * (N - 40);
    const y = 20 + random() * (N - 40);
    c.fillStyle = mix(mask, "#e2c47a", 0.55);
    c.beginPath();
    c.arc(x, y, 3, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#0a0a0a";
    c.beginPath();
    c.arc(x, y, 1.2, 0, Math.PI * 2);
    c.fill();
  }

  // ENIG gold pads.
  for (let i = 0; i < 26; i++) {
    const w = 6 + random() * 10;
    const h = 4 + random() * 6;
    const x = 20 + random() * (N - 60);
    const y = 20 + random() * (N - 60);
    c.fillStyle = "#d9ad55";
    c.fillRect(x, y, w, h);
    s.fillStyle = metalRough(0.22, 1);
    s.fillRect(x, y, w, h);
  }

  // Silkscreen outlines and the board label.
  c.strokeStyle = "rgba(240, 240, 235, 0.75)";
  c.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const w = 24 + random() * 60;
    const h = 18 + random() * 40;
    c.strokeRect(20 + random() * (N - w - 40), 20 + random() * (N - h - 40), w, h);
  }
  c.fillStyle = "rgba(244, 244, 238, 0.85)";
  c.font = "600 17px ui-monospace, monospace";
  c.fillText("TUFTS CUBESAT", 26, N - 44);
  c.font = "500 13px ui-monospace, monospace";
  c.fillText(label, 26, N - 24);

  return { map: colorTexture(color.el), metalRough: dataTexture(surface.el) };
}

/** Laser-etched part marking on a black IC package. */
function chipTexture(lines: string[]) {
  const N = 256;
  const { el, ctx } = canvas(N, N);
  ctx.fillStyle = "#141518";
  ctx.fillRect(0, 0, N, N);
  ctx.fillStyle = "#73777f";
  ctx.font = "600 30px ui-monospace, monospace";
  lines.forEach((line, i) => ctx.fillText(line, 22, 70 + i * 40));
  ctx.beginPath();
  ctx.arc(28, N - 30, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#0c0d0f";
  ctx.fill();
  return colorTexture(el);
}

/** Subteam-tinted solder mask: deep, slightly desaturated, like real boards. */
export const maskColor = (accent: string) => mix("#07120c", accent, 0.36);

export function createMaterials() {
  const solar = solarPanelTextures();

  const aluminum = new THREE.MeshPhysicalMaterial({
    color: "#d5d9df",
    metalness: 1,
    roughness: 0.34,
    anisotropy: 0.7,
    clearcoat: 0.2,
    clearcoatRoughness: 0.4,
  });
  const blackAnodized = new THREE.MeshPhysicalMaterial({ color: "#26292f", metalness: 0.85, roughness: 0.42 });
  const steel = new THREE.MeshStandardMaterial({ color: "#b9bec6", metalness: 1, roughness: 0.22 });
  const gold = new THREE.MeshStandardMaterial({ color: "#e4b45c", metalness: 1, roughness: 0.24 });
  const copper = new THREE.MeshStandardMaterial({ color: "#c27a4c", metalness: 1, roughness: 0.32 });
  const nickel = new THREE.MeshStandardMaterial({ color: "#cfd2d6", metalness: 1, roughness: 0.3 });
  const blackPlastic = new THREE.MeshPhysicalMaterial({ color: "#16181c", metalness: 0, roughness: 0.55, clearcoat: 0.15 });
  const goproBody = new THREE.MeshPhysicalMaterial({ color: "#1a1c20", metalness: 0, roughness: 0.68, sheen: 0.3, sheenColor: "#3a3f48" });
  const whitePlastic = new THREE.MeshPhysicalMaterial({ color: "#e8e6e0", metalness: 0, roughness: 0.5 });
  const ceramic = new THREE.MeshStandardMaterial({ color: "#b89b6e", metalness: 0, roughness: 0.6 });
  const batteryWrap = new THREE.MeshPhysicalMaterial({ color: "#2453a6", metalness: 0, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  const tapeSpring = new THREE.MeshStandardMaterial({ color: "#d9cfa8", metalness: 0.75, roughness: 0.35 });
  const lensGlass = new THREE.MeshPhysicalMaterial({
    color: "#05070c",
    metalness: 0,
    roughness: 0.03,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: 1,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [250, 520],
  });
  const solarCells = new THREE.MeshPhysicalMaterial({
    map: solar.map,
    roughnessMap: solar.metalRough,
    metalnessMap: solar.metalRough,
    roughness: 1,
    metalness: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    iridescence: 0.55,
    iridescenceIOR: 1.55,
    iridescenceThicknessRange: [180, 480],
  });
  const panelBack = new THREE.MeshStandardMaterial({ color: "#1b1e24", metalness: 0.2, roughness: 0.7 });

  const chips = {
    fpga: chipTexture(["XC7A35T", "FTG256", "2C  TUFTS"]),
    mcu: chipTexture(["STM32H7", "LQFP100", "ARM"]),
    flash: chipTexture(["W25Q", "128JV"]),
    rf: chipTexture(["CC1125", "RHB"]),
    power: chipTexture(["BQ25", "703A"]),
  };
  const chip = (texture: THREE.Texture) => new THREE.MeshPhysicalMaterial({ map: texture, metalness: 0, roughness: 0.55, clearcoat: 0.1 });

  const pcbCache = new Map<string, THREE.MeshPhysicalMaterial>();
  const pcb = (accent: string, seed: number, label: string) => {
    const key = `${accent}-${seed}`;
    let material = pcbCache.get(key);
    if (!material) {
      const textures = pcbTextures(maskColor(accent), seed, label);
      material = new THREE.MeshPhysicalMaterial({
        map: textures.map,
        roughnessMap: textures.metalRough,
        metalnessMap: textures.metalRough,
        roughness: 1,
        metalness: 1,
        clearcoat: 0.45,
        clearcoatRoughness: 0.28,
      });
      pcbCache.set(key, material);
    }
    return material;
  };
  const pcbEdge = new THREE.MeshStandardMaterial({ color: "#c7b98a", metalness: 0, roughness: 0.7 });

  return {
    aluminum,
    blackAnodized,
    steel,
    gold,
    copper,
    nickel,
    blackPlastic,
    goproBody,
    whitePlastic,
    ceramic,
    batteryWrap,
    tapeSpring,
    lensGlass,
    solarCells,
    panelBack,
    pcbEdge,
    pcb,
    chip,
    chips,
  };
}

export type Materials = ReturnType<typeof createMaterials>;

/** Soft round sprite texture for glows and light points. */
export function glowTexture() {
  const N = 128;
  const { el, ctx } = canvas(N, N);
  const gradient = ctx.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,255,255,0.75)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.18)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, N, N);
  return colorTexture(el, 1);
}
