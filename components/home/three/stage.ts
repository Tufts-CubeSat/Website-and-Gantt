import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export interface StageSize {
  width: number;
  height: number;
}

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  size: StageSize;
  /** Projects a world point to CSS pixels inside the canvas. */
  project: (point: THREE.Vector3, out?: { x: number; y: number }) => { x: number; y: number };
  dispose: () => void;
}

interface StageOptions {
  fov: number;
  /** Strength of the studio reflection environment for PBR materials (0 disables it). */
  environment?: number;
  shadows?: boolean;
  onResize?: (size: StageSize) => void;
  /** Called every frame before rendering; `time` is in seconds. */
  onFrame: (time: number, delta: number) => void;
}

/**
 * Shared renderer setup for the homepage scenes: transparent canvas over the
 * page background, filmic tone mapping, resize tracking, and a render loop
 * that only runs while the canvas is on screen.
 */
export function createStage(canvas: HTMLCanvasElement, options: StageOptions): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  if (options.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(options.fov, 1, 0.05, 200);

  let envTarget: THREE.WebGLRenderTarget | null = null;
  if (options.environment) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    envTarget = pmrem.fromScene(room, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = options.environment;
    room.dispose();
    pmrem.dispose();
  }

  const size: StageSize = { width: 1, height: 1 };
  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    size.width = width;
    size.height = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    options.onResize?.(size);
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  let frame = 0;
  let last = performance.now();
  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);
    const delta = Math.min((now - last) / 1000, 0.1);
    last = now;
    options.onFrame(now / 1000, delta);
    renderer.render(scene, camera);
  };

  const visibility = new IntersectionObserver(
    ([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    },
    { rootMargin: "120px" }
  );
  visibility.observe(canvas);

  const ndc = new THREE.Vector3();
  const project: Stage["project"] = (point, out = { x: 0, y: 0 }) => {
    ndc.copy(point).project(camera);
    out.x = ((ndc.x + 1) / 2) * size.width;
    out.y = ((1 - ndc.y) / 2) * size.height;
    return out;
  };

  return {
    renderer,
    scene,
    camera,
    size,
    project,
    dispose() {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      resizeObserver.disconnect();
      disposeTree(scene);
      envTarget?.dispose();
      renderer.dispose();
    },
  };
}

function disposeTree(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
      const uniforms = (material as THREE.ShaderMaterial).uniforms;
      if (uniforms) {
        for (const uniform of Object.values(uniforms)) {
          if (uniform.value instanceof THREE.Texture) textures.add(uniform.value);
        }
      }
      material.dispose();
    }
  });
  textures.forEach((texture) => texture.dispose());
}
