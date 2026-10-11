import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Materials } from "./materials";

/**
 * Procedural 2U CubeSat. Modelled in millimetres (scaled to 1 unit = 100 mm),
 * with the long axis along +Y and the stack centred on the origin.
 */

const MM = 0.01;
export const HEIGHT_2U = 227;
const HALF = HEIGHT_2U / 2;
const BOARD = 92;
const BOARD_T = 1.6;
const NOTCH = 8;
const ROD = 35;

export interface LayerSpec {
  name: string;
  owner: string;
  color: string;
  /** Board plus tallest component, in mm; drives the packing of the compact stack. */
  height: number;
}

export interface ModelLayer {
  spec: LayerSpec;
  group: THREE.Group;
  /** Board bottom heights in mm from the chassis base. */
  compactZ: number;
  explodedZ: number;
  /** Label anchor in the layer's local space. */
  anchor: THREE.Vector3;
  /** Parts that deploy (0 stowed → 1 deployed) as the layer moves out. */
  deploy?: (amount: number) => void;
}

export interface CubeSatModel {
  root: THREE.Group;
  layers: ModelLayer[];
  panels: { group: THREE.Group; normal: THREE.Vector3; front: boolean; materials: THREE.Material[] }[];
  /** Rails and frames that sit between the camera and the stack. */
  frontStructure: THREE.Material[];
  wheels: THREE.Object3D[];
  /** Label anchors on the structure, in root space. */
  chassisAnchor: THREE.Vector3;
  panelAnchor: THREE.Vector3;
  setExplode: (layerAmounts: number[]) => void;
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x * MM, y * MM, z * MM);

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x * MM, y * MM, z * MM);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

const box = (w: number, h: number, d: number, material: THREE.Material | THREE.Material[], x: number, y: number, z: number, radius = 0) =>
  mesh(
    radius > 0 ? new RoundedBoxGeometry(w * MM, h * MM, d * MM, 3, radius * MM) : new THREE.BoxGeometry(w * MM, h * MM, d * MM),
    material,
    x,
    y + h / 2,
    z
  );

const cylinder = (r: number, h: number, material: THREE.Material | THREE.Material[], x: number, y: number, z: number, segments = 40) =>
  mesh(new THREE.CylinderGeometry(r * MM, r * MM, h * MM, segments), material, x, y + h / 2, z);

function boardGeometry() {
  const h = (BOARD / 2) * MM;
  const n = NOTCH * MM;
  const shape = new THREE.Shape();
  shape.moveTo(-h + n, -h);
  shape.lineTo(h - n, -h);
  shape.lineTo(h - n, -h + n);
  shape.lineTo(h, -h + n);
  shape.lineTo(h, h - n);
  shape.lineTo(h - n, h - n);
  shape.lineTo(h - n, h);
  shape.lineTo(-h + n, h);
  shape.lineTo(-h + n, h - n);
  shape.lineTo(-h, h - n);
  shape.lineTo(-h, -h + n);
  shape.lineTo(-h + n, -h + n);
  shape.closePath();
  for (const [x, z] of [
    [ROD, ROD],
    [-ROD, ROD],
    [ROD, -ROD],
    [-ROD, -ROD],
  ]) {
    const hole = new THREE.Path();
    hole.absarc(x * MM, z * MM, 1.8 * MM, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: BOARD_T * MM, bevelEnabled: false, curveSegments: 12 });
  geometry.rotateX(-Math.PI / 2);
  // Planar UVs from above so the silkscreen reads correctly.
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + h) / (2 * h), (h - pos.getZ(i)) / (2 * h));
  }
  return geometry;
}

function squareRing(outer: number, inner: number, thickness: number) {
  const o = (outer / 2) * MM;
  const i = (inner / 2) * MM;
  const shape = new THREE.Shape();
  shape.moveTo(-o, -o);
  shape.lineTo(o, -o);
  shape.lineTo(o, o);
  shape.lineTo(-o, o);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-i, -i);
  hole.lineTo(-i, i);
  hole.lineTo(i, i);
  hole.lineTo(i, -i);
  hole.closePath();
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness * MM, bevelEnabled: true, bevelSize: 0.4 * MM, bevelThickness: 0.4 * MM, bevelSegments: 2 });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** PC/104 stack-through header with gold pins along the front edge. */
function header(m: Materials) {
  const group = new THREE.Group();
  group.add(box(52, 8.5, 5.5, m.blackPlastic, -6, BOARD_T, 36));
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7 * MM, 0.6 * MM, 0.7 * MM), m.gold, 52);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 26; i++) {
    for (let row = 0; row < 2; row++) {
      matrix.makeTranslation((-31 + i * 2 + 0.5) * MM, (BOARD_T + 8.5 + 0.3) * MM, (35 + row * 2) * MM);
      pins.setMatrixAt(i * 2 + row, matrix);
    }
  }
  pins.castShadow = true;
  group.add(pins);
  return group;
}

function smallParts(m: Materials, seed: number, count: number, avoid: (x: number, z: number) => boolean) {
  const group = new THREE.Group();
  let s = seed;
  const random = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const caps = new THREE.InstancedMesh(new THREE.BoxGeometry(2 * MM, 1.2 * MM, 1.2 * MM), m.ceramic, count);
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3(1, 1, 1);
  let placed = 0;
  for (let tries = 0; placed < count && tries < count * 10; tries++) {
    const x = -38 + random() * 76;
    const z = -38 + random() * 70;
    if (avoid(x, z)) continue;
    rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), random() < 0.5 ? 0 : Math.PI / 2);
    matrix.compose(new THREE.Vector3(x * MM, (BOARD_T + 0.6) * MM, z * MM), rotation, scale);
    caps.setMatrixAt(placed++, matrix);
  }
  caps.count = placed;
  caps.castShadow = true;
  group.add(caps);
  return group;
}

const inRect = (x: number, z: number, cx: number, cz: number, w: number, d: number, pad = 3) =>
  Math.abs(x - cx) < w / 2 + pad && Math.abs(z - cz) < d / 2 + pad;
const nearHeader = (x: number, z: number) => inRect(x, z, -6, 36, 52, 6) || Math.abs(Math.abs(x) - ROD) < 4 && Math.abs(Math.abs(z) - ROD) < 4;

/** A QFP/BGA chip with its marking texture on the top face only. */
function chip(m: Materials, texture: THREE.Texture, w: number, h: number, d: number, x: number, z: number, lid?: THREE.Material) {
  const top = m.chip(texture);
  const sides = m.blackPlastic;
  const group = new THREE.Group();
  group.add(box(w, h, d, [sides, sides, lid ?? top, sides, sides, sides], x, BOARD_T, z));
  if (!lid && w > 10) {
    // Gull-wing leads on all four sides.
    group.add(box(w + 2.4, 0.4, d - 3, m.nickel, x, BOARD_T, z));
    group.add(box(w - 3, 0.4, d + 2.4, m.nickel, x, BOARD_T, z));
  }
  return group;
}

export function buildCubeSat(m: Materials, specs: LayerSpec[], options: { interior: boolean; explodedSpacing?: number }): CubeSatModel {
  const root = new THREE.Group();
  const geometryBoard = boardGeometry();
  const wheels: THREE.Object3D[] = [];

  const board = (spec: LayerSpec, seed: number, label: string) => {
    const b = new THREE.Mesh(geometryBoard, [m.pcb(spec.color, seed, label), m.pcbEdge]);
    b.castShadow = true;
    b.receiveShadow = true;
    return b;
  };

  const builders: ((spec: LayerSpec, group: THREE.Group) => ModelLayer["deploy"] | void)[] = [
    // Antenna deck: burn-wire release module and four tape-spring monopoles.
    (spec, g) => {
      g.add(board(spec, 11, "ANT DECK  rev C"));
      g.add(box(26, 5, 26, m.whitePlastic, 0, BOARD_T, 0, 1));
      g.add(cylinder(3, 1.2, m.gold, 0, BOARD_T + 5, 0));
      const tapes: THREE.Mesh[] = [];
      for (let i = 0; i < 4; i++) {
        const pivot = new THREE.Group();
        pivot.rotation.y = (i * Math.PI) / 2;
        const tape = mesh(new THREE.BoxGeometry(1, 0.25 * MM, 3.2 * MM), m.tapeSpring, 0, BOARD_T + 3, 0);
        tape.geometry.translate(0.5, 0, 0);
        tape.position.x = 13 * MM;
        pivot.add(tape);
        g.add(pivot);
        tapes.push(tape);
      }
      g.add(header(m));
      g.add(smallParts(m, 3, 26, (x, z) => nearHeader(x, z) || inRect(x, z, 0, 0, 26, 26)));
      return (amount) => {
        const length = (8 + amount * 62) * MM;
        for (const tape of tapes) tape.scale.x = length;
      };
    },
    // VHF/UHF transceiver: RF shield can, SMA connector, TCXO.
    (spec, g) => {
      g.add(board(spec, 23, "TRX VHF/UHF"));
      g.add(box(56, 7.5, 36, m.nickel, -4, BOARD_T, -14, 0.6));
      g.add(chip(m, m.chips.rf, 7, 1, 7, 18, 14));
      const sma = new THREE.Group();
      sma.add(box(6.4, 6.4, 6.4, m.gold, 0, 0, 0));
      const barrel = cylinder(3.1, 9, m.gold, 0, 0, 0, 6);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 3.2 * MM, 6 * MM);
      sma.add(barrel);
      sma.position.set(32 * MM, BOARD_T * MM, 22 * MM);
      g.add(sma);
      g.add(box(5, 1.8, 3.2, m.steel, -26, BOARD_T, 18, 0.5));
      g.add(header(m));
      g.add(smallParts(m, 5, 34, (x, z) => nearHeader(x, z) || inRect(x, z, -4, -14, 56, 36) || inRect(x, z, 32, 24, 8, 10)));
    },
    // EPS: two 18650 cells in a bracket, inductors and the charger IC.
    (spec, g) => {
      g.add(board(spec, 37, "EPS  2S1P"));
      for (const z of [-22, 0]) {
        const cell = cylinder(9, 65, [m.batteryWrap, m.nickel, m.nickel], 0, 0, 0, 48);
        cell.rotation.z = Math.PI / 2;
        cell.position.set(-4 * MM, (BOARD_T + 10) * MM, z * MM);
        g.add(cell);
        g.add(box(1, 14, 16, m.aluminum, -38, BOARD_T, z));
        g.add(box(1, 14, 16, m.aluminum, 30, BOARD_T, z));
      }
      g.add(box(70, 0.6, 3, m.nickel, -4, BOARD_T + 18.6, -11));
      for (const [x, z] of [
        [-28, 22],
        [-16, 22],
      ]) {
        g.add(box(8, 4.5, 8, m.blackPlastic, x, BOARD_T, z, 1));
      }
      g.add(chip(m, m.chips.power, 7, 1, 7, 6, 22));
      g.add(box(6, 6, 9, m.batteryWrap, 26, BOARD_T, 22, 0.8));
      g.add(header(m));
      g.add(smallParts(m, 7, 24, (x, z) => nearHeader(x, z) || inRect(x, z, -4, -11, 76, 40)));
    },
    // ADCS: three reaction wheels and a magnetorquer rod.
    (spec, g) => {
      g.add(board(spec, 41, "ADCS  RW x3"));
      for (const [x, z] of [
        [-20, -18],
        [20, -18],
        [0, 14],
      ]) {
        g.add(cylinder(14, 6, m.blackAnodized, x, BOARD_T, z, 48));
        const wheel = new THREE.Group();
        wheel.position.set(x * MM, (BOARD_T + 6) * MM, z * MM);
        const rim = mesh(new THREE.TorusGeometry(11 * MM, 1.6 * MM, 16, 64), m.aluminum);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 2 * MM;
        wheel.add(rim);
        wheel.add(cylinder(10, 1.2, m.aluminum, 0, 1.4, 0, 48));
        wheel.add(cylinder(3, 4, m.steel, 0, 0, 0, 24));
        for (let i = 0; i < 3; i++) {
          // Balance holes make the spin readable.
          const hole = cylinder(1.6, 1.3, m.blackAnodized, Math.cos((i * 2 * Math.PI) / 3) * 6.5, 1.4, Math.sin((i * 2 * Math.PI) / 3) * 6.5, 16);
          wheel.add(hole);
        }
        g.add(wheel);
        wheels.push(wheel);
      }
      const rod = cylinder(3.5, 62, m.copper, 0, 0, 0, 32);
      rod.rotation.z = Math.PI / 2;
      rod.position.set(-2 * MM, (BOARD_T + 3.5) * MM, 30 * MM);
      g.add(rod);
      g.add(header(m));
    },
    // Flight computer: FPGA under a lid, MCU, flash, crystal, microSD.
    (spec, g) => {
      g.add(board(spec, 53, "OBC  FPGA+MCU"));
      g.add(box(23, 1.2, 23, m.pcbEdge, -18, BOARD_T, -16));
      g.add(chip(m, m.chips.fpga, 19, 1.4, 19, -18, -16));
      g.add(chip(m, m.chips.mcu, 16, 1.4, 16, 18, -16));
      g.add(chip(m, m.chips.flash, 8, 1, 6, 18, 6));
      g.add(chip(m, m.chips.flash, 8, 1, 6, 6, 6));
      g.add(box(5, 1.2, 3.2, m.steel, -6, BOARD_T, 8, 0.4));
      g.add(box(14, 1.6, 15, m.steel, -26, BOARD_T, 10, 0.3));
      g.add(header(m));
      g.add(smallParts(m, 9, 40, (x, z) => nearHeader(x, z) || inRect(x, z, -18, -16, 23, 23) || inRect(x, z, 18, -16, 18, 18) || inRect(x, z, -26, 10, 14, 15)));
    },
    // Vision payload: GoPro body looking out of the top of the spacecraft.
    (spec, g) => {
      g.add(board(spec, 67, "PAYLOAD  CAM"));
      const body = box(52, 30, 40, m.goproBody, 0, BOARD_T, -4, 3);
      g.add(body);
      const lensY = BOARD_T + 30;
      g.add(cylinder(15, 4, m.blackAnodized, 6, lensY, -6, 56));
      g.add(cylinder(12, 2, m.goproBody, 6, lensY + 4, -6, 56));
      g.add(cylinder(9.5, 1, m.lensGlass, 6, lensY + 5.6, -6, 56));
      g.add(box(10, 1, 7, m.blackPlastic, -16, lensY, 8));
      g.add(cylinder(1.2, 0.6, m.copper, -16, lensY + 1, 8, 12));
      g.add(header(m));
    },
  ];

  const compactZ = (() => {
    const margin = 8;
    const total = specs.reduce((sum, s) => sum + s.height, 0);
    const gap = (HEIGHT_2U - 2 * margin - total) / (specs.length - 1);
    let z = margin;
    return specs.map((s) => {
      const at = z;
      z += s.height + gap;
      return at;
    });
  })();
  const spacing = options.explodedSpacing ?? 70;
  const explodedZ = specs.map((_, i) => -48 + i * spacing);

  const layers: ModelLayer[] = [];
  if (options.interior) {
    specs.forEach((spec, i) => {
      const group = new THREE.Group();
      const deploy = builders[i]?.(spec, group) ?? undefined;
      group.position.y = (compactZ[i] - HALF) * MM;
      root.add(group);
      layers.push({ spec, group, compactZ: compactZ[i], explodedZ: explodedZ[i], anchor: v(BOARD / 2, BOARD_T, -BOARD / 2), deploy });
      deploy?.(0);
    });
  } else {
    // Exterior-only build: the deployed antennas and the payload lens are all
    // that show past the panels.
    for (const i of [0, specs.length - 1]) {
      const group = new THREE.Group();
      builders[i](specs[i], group)?.(1);
      group.position.y = (compactZ[i] - HALF) * MM;
      root.add(group);
    }
  }

  // Structure: rails, end and mid frames, stack rods.
  const frontStructure: THREE.Material[] = [];
  const structure = (front: boolean) => {
    if (!front) return m.aluminum;
    const material = m.aluminum.clone();
    material.transparent = true;
    frontStructure.push(material);
    return material;
  };
  const railOffset = 50 - 4.25;
  for (const [x, z] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const front = x + z > -2;
    const rail = box(8.5, HEIGHT_2U, 8.5, structure(front), x * railOffset, -HALF, z * railOffset, 1.2);
    root.add(rail);
  }
  for (const [y, front] of [
    [0, false],
    [HEIGHT_2U - 3, false],
    [HALF - 1.5, true],
  ] as const) {
    const ring = mesh(squareRing(100, 93.5, 3), structure(front));
    ring.position.y = (y - HALF) * MM;
    root.add(ring);
  }
  if (options.interior) {
    for (const [x, z] of [
      [ROD, ROD],
      [-ROD, ROD],
      [ROD, -ROD],
      [-ROD, -ROD],
    ]) {
      root.add(cylinder(1.4, HEIGHT_2U - 6, m.steel, x, 3 - HALF, z, 12));
    }
  }

  // Body-mounted solar panels on the four long faces.
  const panels: CubeSatModel["panels"] = [];
  const faces: [THREE.Vector3, number, boolean][] = [
    [new THREE.Vector3(0, 0, 1), 0, true],
    [new THREE.Vector3(1, 0, 0), Math.PI / 2, true],
    [new THREE.Vector3(0, 0, -1), Math.PI, false],
    [new THREE.Vector3(-1, 0, 0), -Math.PI / 2, false],
  ];
  for (const [normal, rotation, front] of faces) {
    const cells = front ? m.solarCells.clone() : m.solarCells;
    const back = front ? m.panelBack.clone() : m.panelBack;
    const materials = front ? [cells, back] : [];
    for (const material of materials) material.transparent = true;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(96 * MM, 220 * MM, 1.6 * MM), [back, back, back, back, cells, back]);
    panel.castShadow = true;
    panel.receiveShadow = true;
    panel.position.z = 51.4 * MM;
    const group = new THREE.Group();
    group.rotation.y = rotation;
    group.add(panel);
    root.add(group);
    panels.push({ group, normal, front, materials });
  }

  const setExplode = (amounts: number[]) => {
    layers.forEach((layer, i) => {
      const t = amounts[i] ?? 0;
      layer.group.position.y = (THREE.MathUtils.lerp(layer.compactZ, layer.explodedZ, t) - HALF) * MM;
      layer.deploy?.(t);
    });
  };

  return {
    root,
    layers,
    panels,
    frontStructure,
    wheels,
    chassisAnchor: v(-50, HALF, 50),
    panelAnchor: v(0, 40, 52),
    setExplode,
  };
}
