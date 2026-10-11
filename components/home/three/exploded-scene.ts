import * as THREE from "three";
import { buildCubeSat, type LayerSpec } from "./cubesat-model";
import { createMaterials } from "./materials";
import { createStage } from "./stage";

/** Scroll-driven values, tweened by GSAP and read every frame. */
export interface ExplodedState {
  /** 0 → 1: solar panels slide off the chassis. */
  panels: number;
  /** 0 → 1: rails and panels facing the camera fade out of the way. */
  front: number;
  /** Per-layer 0 → 1 travel from the packed stack to the exploded view. */
  layers: { t: number }[];
  /** 0 → 1: slow camera orbit over the whole sequence. */
  turn: number;
}

export interface LabelElement {
  root: HTMLElement;
  line: SVGLineElement;
  dot: SVGCircleElement;
  text: HTMLElement;
}

export interface ExplodedLabels {
  layers: LabelElement[];
  chassis: LabelElement;
  panel: LabelElement;
}

export function createExplodedScene(canvas: HTMLCanvasElement, specs: LayerSpec[], state: ExplodedState, labels: ExplodedLabels) {
  const materials = createMaterials();
  const model = buildCubeSat(materials, specs, { interior: true });
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const lookAt = new THREE.Vector3();
  const anchor = new THREE.Vector3();
  const screen = { x: 0, y: 0 };

  const stage = createStage(canvas, {
    fov: 30,
    environment: 0.85,
    shadows: true,
    onFrame: (time, delta) => {
      const amounts = state.layers.map((layer) => layer.t);
      const explode = amounts.reduce((sum, t) => sum + t, 0) / Math.max(amounts.length, 1);
      model.setExplode(amounts);

      // Panels slide out along their face normals; the two facing the camera
      // travel further and fade so the stack stays readable.
      for (const panel of model.panels) {
        const distance = (panel.front ? 0.62 : 0.22) * state.panels;
        panel.group.position.copy(panel.normal).multiplyScalar(distance);
        const opacity = 1 - 0.74 * state.front;
        for (const material of panel.materials) {
          material.opacity = opacity;
          material.depthWrite = opacity > 0.98;
        }
      }
      for (const material of model.frontStructure) {
        material.opacity = 1 - 0.8 * state.front;
        material.depthWrite = material.opacity > 0.98;
      }
      for (const wheel of model.wheels) wheel.rotation.y += delta * (1.5 + explode * 9);

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      model.root.rotation.y = THREE.MathUtils.lerp(-0.32, 0.22, state.turn) + pointer.x * 0.18 + Math.sin(time * 0.25) * 0.02;
      model.root.rotation.x = pointer.y * 0.06;

      // Frame the packed stack tightly, then pull back as it opens.
      const narrow = Math.min(stage.camera.aspect, 1);
      const distance = THREE.MathUtils.lerp(5.7, 7.7, explode) / Math.max(narrow, 0.62);
      const elevation = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(20, 24, explode));
      const azimuth = Math.PI / 4;
      lookAt.set(0, THREE.MathUtils.lerp(0, 0.46, explode), 0);
      stage.camera.position.set(
        lookAt.x + distance * Math.cos(elevation) * Math.sin(azimuth),
        lookAt.y + distance * Math.sin(elevation),
        lookAt.z + distance * Math.cos(elevation) * Math.cos(azimuth)
      );
      stage.camera.lookAt(lookAt);
      // Shift the model left of centre to leave room for the label column.
      const shift = stage.size.width < 560 ? 0.2 : 0.12;
      stage.camera.setViewOffset(stage.size.width, stage.size.height, stage.size.width * shift, 0, stage.size.width, stage.size.height);

      model.root.updateMatrixWorld();
      placeLabels();
    },
  });

  const { scene } = stage;
  scene.add(model.root);

  const key = new THREE.DirectionalLight("#fff3e2", 2.7);
  key.position.set(-4, 6.5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -3.5;
  key.shadow.camera.right = 3.5;
  key.shadow.camera.top = 3.5;
  key.shadow.camera.bottom = -3.5;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.015;
  key.shadow.radius = 3;
  const rim = new THREE.DirectionalLight("#9cc6ff", 2.2);
  rim.position.set(3, 2.5, -6);
  const fill = new THREE.DirectionalLight("#ffffff", 0.55);
  fill.position.set(6, 0.5, 3);
  scene.add(key, rim, fill, new THREE.HemisphereLight("#c4d8ff", "#191410", 0.35));

  function place(label: LabelElement, world: THREE.Vector3, side: "right" | "left") {
    const { width } = stage.size;
    stage.project(world, screen);
    const narrow = width < 560;
    const textX = side === "right" ? width * (narrow ? 0.6 : 0.74) : width * 0.17;
    label.dot.setAttribute("cx", screen.x.toFixed(1));
    label.dot.setAttribute("cy", screen.y.toFixed(1));
    label.line.setAttribute("x1", screen.x.toFixed(1));
    label.line.setAttribute("y1", screen.y.toFixed(1));
    label.line.setAttribute("x2", (side === "right" ? textX - 8 : textX + 8).toFixed(1));
    label.line.setAttribute("y2", screen.y.toFixed(1));
    label.text.style.transform = `translate(${textX.toFixed(1)}px, ${screen.y.toFixed(1)}px) translate(${side === "right" ? "0" : "-100%"}, -50%)`;
  }

  function placeLabels() {
    model.layers.forEach((layer, i) => {
      const label = labels.layers[i];
      if (!label) return;
      anchor.copy(layer.anchor);
      layer.group.localToWorld(anchor);
      place(label, anchor, "right");
    });
    place(labels.chassis, model.root.localToWorld(anchor.copy(model.chassisAnchor)), "left");
    const front = model.panels.find((p) => p.front && p.normal.z > 0);
    anchor.copy(model.panelAnchor);
    if (front) anchor.addScaledVector(front.normal, front.group.position.length());
    place(labels.panel, model.root.localToWorld(anchor), "left");
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
