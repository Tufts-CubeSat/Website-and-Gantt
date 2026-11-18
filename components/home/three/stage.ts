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
  /**
   * Compiles shaders (in parallel where supported) and uploads geometry with
   * one offscreen render. Call once the scene is built so the first visible
   * frame, which lands mid-scroll, doesn't stall the scrubbed timelines.
   */
  warmUp: () => Promise<void>;
  /** Decodes off the main thread, then uploads to the GPU ahead of first use. */
  prepareTexture: (texture: THREE.Texture) => void;
  dispose: () => void;
}

/** Above this the scenes look the same but cost far more to fill, especially on 3x phones. */
const MAX_PIXEL_RATIO = 1.5;
/** After this long without scrolling or pointer movement, the loop drops to ~30 fps. */
const IDLE_AFTER_MS = 1200;
const IDLE_FRAME_MS = 1000 / 30;

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
  // Dense screens get no visible benefit from MSAA on top of 1.5x rendering,
  // and the fill cost on phones is large. No powerPreference: asking for the
  // discrete GPU makes dual-GPU laptops switch mid-page, which hitches.
  const deviceRatio = window.devicePixelRatio || 1;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: deviceRatio < 2, alpha: true });
  // The status checks block on compilation (undercutting compileAsync) and only
  // surface driver noise in production, e.g. ANGLE's X4122 precision warnings.
  renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
  renderer.setPixelRatio(Math.min(deviceRatio, MAX_PIXEL_RATIO));
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
  let envReady = Promise.resolve();
  if (options.environment) {
    const intensity = options.environment;
    const apply = (target: THREE.WebGLRenderTarget) => {
      envTarget = target;
      scene.environment = target.texture;
      scene.environmentIntensity = intensity;
    };
    envReady = loadBakedEnvironment(renderer)
      .catch(() => generateRoomEnvironment(renderer))
      .then((target) => {
        if (disposed) target.dispose();
        else apply(target);
      });
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
  let lastActive = last;
  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);
    // While the page sits still only ambient motion plays, which reads fine
    // at a lower rate and saves the GPU (and phone thermals) the full cost.
    if (now - lastActive > IDLE_AFTER_MS && now - last < IDLE_FRAME_MS) return;
    const delta = Math.min((now - last) / 1000, 0.1);
    last = now;
    options.onFrame(now / 1000, delta);
    renderer.render(scene, camera);
  };
  const markActive = () => {
    lastActive = performance.now();
  };
  window.addEventListener("scroll", markActive, { passive: true });
  window.addEventListener("pointermove", markActive, { passive: true });

  // The loop starts only once shaders are compiled (see warmUp); before that a
  // render would compile them synchronously and freeze the page mid-scroll.
  let compiled = false;
  let visible = false;
  const start = () => {
    cancelAnimationFrame(frame);
    if (!compiled || !visible) return;
    last = lastActive = performance.now();
    frame = requestAnimationFrame(loop);
  };

  const visibility = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      start();
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

  let disposed = false;

  return {
    renderer,
    scene,
    camera,
    size,
    project,
    warmUp() {
      // Objects hidden until a later scroll stage would otherwise compile and
      // upload on the frame they first appear, mid-scroll. Show everything for
      // the compile and one throwaway render, then restore.
      const hidden: THREE.Object3D[] = [];
      scene.traverse((object) => {
        if (!object.visible) {
          object.visible = true;
          hidden.push(object);
        }
      });
      const restore = () => hidden.forEach((object) => (object.visible = false));
      // The environment changes every PBR shader, so compile only once it's in.
      return envReady.then(() => renderer.compileAsync(scene, camera)).then(
        () => {
          if (disposed) return restore();
          renderer.render(scene, camera); // uploads geometry and textures
          restore();
          renderer.clear();
          compiled = true;
          start();
        },
        (error) => {
          restore();
          throw error;
        }
      );
    },
    prepareTexture(texture) {
      const image = texture.image as HTMLImageElement | undefined;
      const decoded = image?.decode ? image.decode() : Promise.resolve();
      decoded
        .catch(() => {})
        .then(() => {
          if (!disposed) renderer.initTexture(texture);
        });
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", markActive);
      window.removeEventListener("pointermove", markActive);
      visibility.disconnect();
      resizeObserver.disconnect();
      disposeTree(scene);
      envTarget?.dispose();
      renderer.dispose();
    },
  };
}

/**
 * Prefiltered (PMREM) reflection map of three's RoomEnvironment, baked once
 * and stored RGBE-encoded: exponent in alpha, rows in render-target order.
 * Generating it at runtime renders and blurs a room and compiles its shaders
 * synchronously, ~300 ms per scene on a phone; this is a download and one tiny
 * decode pass. Regenerate it if the environment ever changes (sigma 0.04, size 256).
 */
const BAKED_ENV_URL = "/textures/env-room.png";
let bakedEnv: Promise<ImageBitmap> | undefined;

function loadBakedEnvironment(renderer: THREE.WebGLRenderer): Promise<THREE.WebGLRenderTarget> {
  if (typeof createImageBitmap !== "function") return Promise.reject(new Error("createImageBitmap unavailable"));
  // Shared by both scenes. Raw bytes matter: no premultiplication or color management.
  bakedEnv ??= fetch(BAKED_ENV_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`env ${response.status}`);
      return response.blob();
    })
    .then((blob) => createImageBitmap(blob, { premultiplyAlpha: "none", colorSpaceConversion: "none" }));
  return bakedEnv.then((bitmap) => decodeEnvironment(renderer, bitmap));
}

function decodeEnvironment(renderer: THREE.WebGLRenderer, bitmap: ImageBitmap) {
  const { width, height } = bitmap;
  const source = new THREE.Texture(bitmap);
  source.minFilter = source.magFilter = THREE.NearestFilter;
  source.generateMipmaps = false;
  source.flipY = false;
  source.colorSpace = THREE.NoColorSpace;
  source.needsUpdate = true;

  // Same layout and format PMREMGenerator produces, so the shaders treat it identically.
  const target = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    colorSpace: THREE.LinearSRGBColorSpace,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
    depthBuffer: false,
  });
  target.texture.mapping = THREE.CubeUVReflectionMapping;
  target.texture.name = "PMREM.cubeUv";

  const material = new THREE.ShaderMaterial({
    uniforms: { rgbe: { value: source }, size: { value: new THREE.Vector2(width, height) } },
    vertexShader: /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D rgbe;
      uniform vec2 size;
      void main() {
        vec4 c = texture2D(rgbe, gl_FragCoord.xy / size);
        // Encoded as round(v * 256 / 2^e) with e + 128 in alpha.
        float scale = c.a > 0.0 ? exp2(c.a * 255.0 - 128.0) * (255.0 / 256.0) : 0.0;
        gl_FragColor = vec4(c.rgb * scale, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  const camera = new THREE.Camera();

  const previous = renderer.getRenderTarget();
  renderer.setRenderTarget(target);
  renderer.render(quad, camera);
  renderer.setRenderTarget(previous);

  material.dispose();
  quad.geometry.dispose();
  source.dispose();
  return target;
}

/** Fallback for browsers without createImageBitmap: build the same map at runtime. */
function generateRoomEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const target = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  return target;
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
