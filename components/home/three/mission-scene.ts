import * as THREE from "three";
import { buildCubeSat, type LayerSpec } from "./cubesat-model";
import { createEarth, latLonToLocal } from "./earth";
import { createMaterials, glowTexture, rng } from "./materials";
import { createStage } from "./stage";

/** Scroll-driven values, tweened by GSAP and read every frame. */
export interface MissionState {
  ascent: number;
  ascentFade: number;
  sat: number;
  /** Orbit angle in degrees, counter-clockwise from +x around Earth's centre. */
  satAngle: number;
  orbit: number;
  ambient: number;
  targets: number;
  cone: number;
  trajectory: number;
  trajectoryFade: number;
  station: number;
  beam: number;
  beamFade: number;
  packets: { t: number; o: number }[];
  network: { p: number }[];
  nodes: number;
  /** 0 → 1: camera pushes in on the debris field. */
  zoom: number;
}

export const SAT_ANGLES = { deploy: 100, detect: 90, downlink: 76, open: 68 };

export function createMissionState(): MissionState {
  return {
    ascent: 0,
    ascentFade: 1,
    sat: 0,
    satAngle: SAT_ANGLES.deploy,
    orbit: 0,
    ambient: 0,
    targets: 0,
    cone: 0,
    trajectory: 0,
    trajectoryFade: 1,
    station: 0,
    beam: 0,
    beamFade: 1,
    packets: [0, 1, 2].map(() => ({ t: 0, o: 0 })),
    network: [0, 1, 2, 3].map(() => ({ p: 0 })),
    nodes: 0,
    zoom: 0,
  };
}

export interface MissionHud {
  /** One positioned container per debris target (ring, box, label inside). */
  targets: HTMLElement[];
  /** Container placed over the ground station. */
  station: HTMLElement;
}

const R = 9;
const ORBIT_R = 10.3;
const CENTER = new THREE.Vector3(0, -9.95, 0);
const SUN = new THREE.Vector3(0.78, 0.5, 0.38).normalize();
const TUFTS = { lat: 42.41, lon: -71.12 };

const orbitPoint = (deg: number, r = ORBIT_R) => {
  const a = THREE.MathUtils.degToRad(deg);
  return new THREE.Vector3(CENTER.x + r * Math.cos(a), CENTER.y + r * Math.sin(a), 0);
};
/** A point on the visible face of the globe, tilted toward the camera. */
const surfaceNormal = (deg: number, tilt = 0.16) => {
  const a = THREE.MathUtils.degToRad(deg);
  return new THREE.Vector3(Math.cos(a), Math.sin(a), tilt).normalize();
};
const surfacePoint = (deg: number, lift = 0, tilt?: number) => surfaceNormal(deg, tilt).multiplyScalar(R + lift).add(CENTER);

/** Debris targets, matching the HUD order: fragment, defunct sat, rocket body, fragment. */
const TARGETS = [new THREE.Vector3(1.15, 0.62, 0.7), new THREE.Vector3(2.15, 1.32, 0.15), new THREE.Vector3(3.35, 1.95, -0.7), new THREE.Vector3(3.7, 0.72, 0.35)];
export const HIGH_RISK = 1;

const trailVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosW = world.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const trailFragment = /* glsl */ `
  uniform vec3 color;
  uniform float progress;
  uniform float opacity;
  uniform float dash;
  uniform float time;
  uniform float head;
  uniform float halo;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vPosW;
  void main() {
    float s = vUv.x;
    if (s > progress) discard;
    if (dash > 0.0 && fract(s * dash - time) > 0.55) discard;
    float facing = abs(dot(normalize(vN), normalize(cameraPosition - vPosW)));
    float a = halo > 0.5 ? pow(facing, 3.0) * 0.32 : 0.45 + 0.55 * facing;
    float tail = head > 0.0 ? mix(0.15, 1.0, smoothstep(progress - head, progress, s)) : 1.0;
    gl_FragColor = vec4(color * (halo > 0.5 ? 1.0 : 1.35), a * opacity * tail);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function makeTrail(curve: THREE.Curve<THREE.Vector3>, color: string, radius: number, options: { dash?: number; head?: number } = {}) {
  const uniforms = {
    color: { value: new THREE.Color(color) },
    progress: { value: 0 },
    opacity: { value: 1 },
    dash: { value: options.dash ?? 0 },
    time: { value: 0 },
    head: { value: options.head ?? 0 },
    halo: { value: 0 },
  };
  const group = new THREE.Group();
  for (const [r, halo] of [
    [radius, 0],
    [radius * 4, 1],
  ]) {
    const material = new THREE.ShaderMaterial({
      uniforms: { ...uniforms, halo: { value: halo } },
      vertexShader: trailVertex,
      fragmentShader: trailFragment,
      transparent: true,
      depthWrite: false,
    });
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, r, 10, false), material));
  }
  group.renderOrder = 3;
  return { group, uniforms };
}

function glow(texture: THREE.Texture, color: string, size: number) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sprite.scale.setScalar(size);
  sprite.renderOrder = 4;
  return sprite;
}

function jagged(seed: number, detail: number, roughness: number) {
  const geometry = new THREE.IcosahedronGeometry(1, detail);
  const random = rng(seed);
  const pos = geometry.attributes.position;
  const offsets = new Map<string, number>();
  for (let i = 0; i < pos.count; i++) {
    // Displace shared vertices consistently so the shard stays closed.
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    if (!offsets.has(key)) offsets.set(key, 1 - roughness / 2 + random() * roughness);
    const k = offsets.get(key)!;
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * 0.55, pos.getZ(i) * k);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function createMissionScene(canvas: HTMLCanvasElement, specs: LayerSpec[], state: MissionState, hud: MissionHud, onReady: () => void) {
  const materials = createMaterials();
  const sprite = glowTexture();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const lookAt = new THREE.Vector3();
  const screen = { x: 0, y: 0 };
  const scratch = new THREE.Vector3();

  const stage = createStage(canvas, { fov: 32, environment: 0.35, onFrame });
  const { scene, camera } = stage;

  // Earth, turned so the ground station sits over Tufts in Medford, MA.
  const earth = createEarth(R, SUN, onReady);
  earth.globe.position.copy(CENTER);
  earth.shell.position.copy(CENTER);
  const stationDir = surfaceNormal(70);
  {
    const b = latLonToLocal(TUFTS.lat, TUFTS.lon);
    const northLocal = new THREE.Vector3(0, 1, 0).addScaledVector(b, -b.y).normalize();
    const want = new THREE.Vector3(-0.45, 0.15, -1);
    const northWorld = want.addScaledVector(stationDir, -want.dot(stationDir)).normalize();
    const from = new THREE.Matrix4().makeBasis(b, northLocal, new THREE.Vector3().crossVectors(b, northLocal));
    const to = new THREE.Matrix4().makeBasis(stationDir, northWorld, new THREE.Vector3().crossVectors(stationDir, northWorld));
    earth.globe.quaternion.setFromRotationMatrix(to.multiply(from.transpose()));
  }
  scene.add(earth.globe, earth.shell);

  const sunLight = new THREE.DirectionalLight("#fff5e8", 3.4);
  sunLight.position.copy(SUN).multiplyScalar(20);
  scene.add(sunLight, new THREE.HemisphereLight("#0a1020", "#3d74c4", 0.9));

  // Satellite (exterior build: panels, rails, antennas, lens).
  const model = buildCubeSat(materials, specs, { interior: false });
  const sat = new THREE.Group();
  const satScale = 0.3;
  model.root.rotation.y = 0.6;
  sat.add(model.root);
  scene.add(sat);

  // Launch ascent from the limb up to the deployment point.
  const ascentStart = surfacePoint(111, 0, 0.3);
  const deployAt = orbitPoint(SAT_ANGLES.deploy);
  const tangent = (deg: number) => {
    const a = THREE.MathUtils.degToRad(deg);
    return new THREE.Vector3(Math.sin(a), -Math.cos(a), 0);
  };
  const ascentCurve = new THREE.CubicBezierCurve3(
    ascentStart,
    ascentStart.clone().add(surfaceNormal(111, 0.3).multiplyScalar(1.4)),
    deployAt.clone().addScaledVector(tangent(SAT_ANGLES.deploy), -1.6),
    deployAt
  );
  const ascent = makeTrail(ascentCurve, "#ffb15c", 0.012, { head: 0.35 });
  const rocketGlow = glow(sprite, "#ffd29a", 0.5);
  scene.add(ascent.group, rocketGlow);

  // Orbit arc.
  const orbitPoints = Array.from({ length: 96 }, (_, i) => orbitPoint(120 - (i / 95) * 60));
  const orbit = makeTrail(new THREE.CatmullRomCurve3(orbitPoints), "#69b7ff", 0.007);
  scene.add(orbit.group);

  // Ambient debris field.
  const ambientCount = 70;
  const ambientMaterial = new THREE.MeshStandardMaterial({ color: "#9aa3ad", metalness: 0.7, roughness: 0.45, transparent: true, opacity: 0 });
  const ambient = new THREE.InstancedMesh(jagged(4, 0, 0.7), ambientMaterial, ambientCount);
  const ambientData: { p: THREE.Vector3; r: THREE.Euler; spin: THREE.Vector3; s: number }[] = [];
  {
    const random = rng(21);
    while (ambientData.length < ambientCount) {
      const p = new THREE.Vector3(-5 + random() * 10.5, -1 + random() * 4.4, -4 + random() * 5.5);
      if (p.distanceTo(CENTER) < R * 1.06) continue;
      ambientData.push({
        p,
        r: new THREE.Euler(random() * 6, random() * 6, random() * 6),
        spin: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.8),
        s: 0.012 + random() * 0.03,
      });
    }
  }
  scene.add(ambient);

  // Tracked targets.
  const mli = new THREE.MeshStandardMaterial({ color: "#d9a94e", metalness: 1, roughness: 0.32, flatShading: true });
  const shardMetal = new THREE.MeshStandardMaterial({ color: "#c3c9d1", metalness: 1, roughness: 0.3, flatShading: true });
  const paint = new THREE.MeshPhysicalMaterial({ color: "#e9e6df", roughness: 0.55, clearcoat: 0.2 });
  const targets: THREE.Group[] = TARGETS.map((p, i) => {
    const g = new THREE.Group();
    g.position.copy(p);
    if (i === 0 || i === 3) {
      const shard = new THREE.Mesh(jagged(10 + i, 1, 0.8), i === 0 ? mli : shardMetal);
      shard.scale.setScalar(i === 0 ? 0.075 : 0.055);
      g.add(shard);
    } else if (i === 1) {
      // Defunct satellite: MLI-wrapped bus, one intact wing, one snapped off.
      const bus = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.2), mli);
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.006, 0.13), [materials.panelBack, materials.panelBack, materials.solarCells, materials.panelBack, materials.panelBack, materials.panelBack]);
      wing.position.x = 0.26;
      const stub = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.006, 0.13), materials.solarCells);
      stub.position.x = -0.12;
      stub.rotation.z = 0.5;
      const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18), materials.steel);
      boom.position.set(0, 0.12, 0.05);
      boom.rotation.x = 0.4;
      g.add(bus, wing, stub, boom);
    } else {
      // Spent upper stage.
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 32), paint);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0605, 0.0605, 0.04, 32), materials.blackAnodized);
      band.position.y = 0.07;
      const nozzle = new THREE.Mesh(
        new THREE.LatheGeometry([new THREE.Vector2(0.018, 0), new THREE.Vector2(0.03, -0.03), new THREE.Vector2(0.05, -0.09)], 32),
        new THREE.MeshStandardMaterial({ color: "#3a3c40", metalness: 0.9, roughness: 0.4, side: THREE.DoubleSide })
      );
      nozzle.position.y = -0.15;
      g.add(body, band, nozzle);
    }
    g.rotation.set(i * 1.3, i * 0.7, i * 0.4);
    g.scale.setScalar(0);
    scene.add(g);
    return g;
  });

  // Camera field of view: a four-sided frustum from the payload toward the field.
  const coneGeometry = new THREE.ConeGeometry(1, 1, 4, 1, true);
  coneGeometry.rotateY(Math.PI / 4);
  coneGeometry.translate(0, -0.5, 0);
  coneGeometry.rotateX(-Math.PI / 2);
  const cone = new THREE.Mesh(
    coneGeometry,
    new THREE.ShaderMaterial({
      uniforms: { opacity: { value: 0 }, color: { value: new THREE.Color("#69b7ff") } },
      vertexShader: /* glsl */ `
        varying float vAlong;
        void main() {
          vAlong = position.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float opacity;
        uniform vec3 color;
        varying float vAlong;
        void main() {
          gl_FragColor = vec4(color, opacity * 0.22 * (1.0 - vAlong) * smoothstep(0.0, 0.08, vAlong));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  cone.renderOrder = 3;
  scene.add(cone);
  const coneAim = new THREE.Vector3(2.7, 1.25, 0);
  const coneLength = 4.3;

  // Trajectory of the high-risk object, heading for our orbit.
  const high = TARGETS[HIGH_RISK];
  const trajectory = makeTrail(
    new THREE.LineCurve3(high.clone().add(new THREE.Vector3(0.75, 0.8, -0.35)), high.clone().add(new THREE.Vector3(-1.5, -1.6, 0.4))),
    "#f87171",
    0.006,
    { dash: 18 }
  );
  scene.add(trajectory.group);

  // Ground station over Tufts.
  const stationPos = surfacePoint(70, 0.02);
  const station = new THREE.Group();
  station.position.copy(stationPos);
  station.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), stationDir);
  {
    const white = new THREE.MeshStandardMaterial({ color: "#f1f1ee", roughness: 0.45, metalness: 0.1, side: THREE.DoubleSide });
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.09, 12), materials.steel);
    mast.position.y = 0.045;
    const dish = new THREE.Mesh(new THREE.LatheGeometry(Array.from({ length: 10 }, (_, i) => new THREE.Vector2(i * 0.008, (i * 0.008) ** 2 * 6)), 40), white);
    dish.position.y = 0.09;
    dish.rotation.z = -0.7;
    station.add(mast, dish);
  }
  station.scale.setScalar(0);
  const beacon = glow(sprite, "#69b7ff", 0.35);
  beacon.position.copy(stationPos).addScaledVector(stationDir, 0.1);
  scene.add(station, beacon);

  // Downlink beam and packets.
  const downlinkAt = orbitPoint(SAT_ANGLES.downlink);
  const beamCurve = new THREE.LineCurve3(downlinkAt, stationPos.clone().addScaledVector(stationDir, 0.1));
  const beam = makeTrail(beamCurve, "#69b7ff", 0.01, { dash: 22 });
  scene.add(beam.group);
  const packets = state.packets.map(() => {
    const p = glow(sprite, "#9fd3ff", 0.18);
    scene.add(p);
    return p;
  });

  // Open-data network fanning out across the globe.
  const nodeAngles = [80, 88, 97, 106];
  const nodes = nodeAngles.map((deg) => {
    const n = glow(sprite, "#4ade80", 0.22);
    n.position.copy(surfacePoint(deg, 0.03));
    scene.add(n);
    return n;
  });
  const network = nodeAngles.map((deg) => {
    const end = surfacePoint(deg, 0.03);
    const mid = surfacePoint((70 + deg) / 2, 0.35 + (deg - 70) * 0.012);
    const trail = makeTrail(new THREE.QuadraticBezierCurve3(stationPos.clone(), mid, end), "#4ade80", 0.005);
    scene.add(trail.group);
    return trail;
  });

  const satPosition = new THREE.Vector3();
  const satBasis = new THREE.Matrix4();
  const toCamera = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  function onFrame(time: number, delta: number) {
    earth.update(time);

    // Camera: slow drift, push-in on the debris field, pointer parallax.
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    const z = state.zoom;
    const aspectPull = Math.max(0, 1.55 - camera.aspect) * 3.2;
    lookAt.set(1.45 + z * 0.6, 0.2 + z * 0.5, 0);
    camera.position.set(lookAt.x - 0.4 + pointer.x * 0.25, lookAt.y + 0.55 - pointer.y * 0.15, 10.2 - z * 2.4 + aspectPull);
    camera.lookAt(lookAt);

    // Launch.
    ascent.uniforms.progress.value = state.ascent;
    ascent.uniforms.opacity.value = state.ascentFade;
    ascentCurve.getPoint(Math.min(state.ascent, 1), rocketGlow.position);
    rocketGlow.material.opacity = state.ascent > 0.001 && state.ascent < 0.999 ? 1 : 0;

    // Satellite on its orbit, long axis along the velocity, panels toward camera.
    const a = state.satAngle;
    satPosition.copy(orbitPoint(a));
    sat.position.copy(satPosition);
    const forward = tangent(a);
    toCamera.subVectors(camera.position, satPosition).normalize();
    const side = new THREE.Vector3().crossVectors(forward, toCamera).normalize();
    const facing = new THREE.Vector3().crossVectors(side, forward).normalize();
    satBasis.makeBasis(side, forward, facing);
    sat.quaternion.setFromRotationMatrix(satBasis);
    model.root.rotation.y = 0.6 + Math.sin(time * 0.35) * 0.08;
    sat.scale.setScalar(satScale * state.sat);
    sat.visible = state.sat > 0.001;

    orbit.uniforms.progress.value = state.orbit;

    // Debris.
    ambientMaterial.opacity = state.ambient;
    ambient.visible = state.ambient > 0.01;
    ambientData.forEach((d, i) => {
      dummy.position.copy(d.p);
      dummy.rotation.set(d.r.x + time * d.spin.x, d.r.y + time * d.spin.y, d.r.z + time * d.spin.z);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      ambient.setMatrixAt(i, dummy.matrix);
    });
    ambient.instanceMatrix.needsUpdate = true;
    targets.forEach((t, i) => {
      t.scale.setScalar(Math.min(Math.max(state.targets * 1.6 - i * 0.2, 0), 1));
      t.rotation.x += delta * (0.08 + i * 0.03);
      t.rotation.y += delta * (0.12 - i * 0.02);
    });

    // Camera frustum follows the satellite.
    cone.position.copy(satPosition);
    cone.lookAt(coneAim);
    const coneLen = coneLength * Math.max(state.cone, 0.001);
    cone.scale.set(1.15 * state.cone, 0.6 * state.cone, coneLen);
    (cone.material as THREE.ShaderMaterial).uniforms.opacity.value = Math.min(state.cone * 1.4, 1);
    cone.visible = state.cone > 0.01;

    trajectory.uniforms.progress.value = state.trajectory;
    trajectory.uniforms.opacity.value = state.trajectoryFade;
    trajectory.uniforms.time.value = time * 0.6;

    // Downlink.
    station.scale.setScalar(state.station * 1.6);
    beacon.material.opacity = state.station * (0.65 + Math.sin(time * 3) * 0.25);
    beam.uniforms.progress.value = state.beam;
    beam.uniforms.opacity.value = state.beamFade;
    beam.uniforms.time.value = time * 1.4;
    state.packets.forEach((p, i) => {
      beamCurve.getPoint(Math.min(Math.max(p.t, 0), 1), packets[i].position);
      packets[i].material.opacity = p.o;
    });

    network.forEach((n, i) => {
      n.uniforms.progress.value = state.network[i].p;
    });
    nodes.forEach((n, i) => {
      n.material.opacity = Math.min(Math.max(state.nodes * 1.6 - i * 0.2, 0), 1) * (0.8 + Math.sin(time * 2 + i) * 0.2);
    });

    // HUD overlay follows the 3D positions.
    targets.forEach((t, i) => {
      const el = hud.targets[i];
      if (!el) return;
      stage.project(t.getWorldPosition(scratch), screen);
      el.style.transform = `translate(${screen.x.toFixed(1)}px, ${screen.y.toFixed(1)}px)`;
    });
    stage.project(stationPos, screen);
    hud.station.style.transform = `translate(${screen.x.toFixed(1)}px, ${screen.y.toFixed(1)}px)`;
  }

  const onPointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    pointer.ty = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  return {
    dispose() {
      window.removeEventListener("pointermove", onPointer);
      stage.dispose();
    },
  };
}
