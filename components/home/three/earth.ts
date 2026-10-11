import * as THREE from "three";

/**
 * Earth from NASA Blue Marble / Black Marble imagery: day surface with ocean
 * sun-glint, city lights on the night side, a drifting cloud layer that casts
 * shadows, and a ray-marched atmosphere shell for the limb glow.
 */

const surfaceVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosW = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const surfaceFragment = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D cloudMap;
  uniform vec3 sunDir;
  uniform float cloudOffset;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    vec3 L = normalize(sunDir);
    float ndl = dot(N, L);

    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 night = texture2D(nightMap, vUv).rgb;
    float cloud = texture2D(cloudMap, vUv + vec2(cloudOffset - 0.0015, 0.0008)).r;

    // Oceans read as blue-dominant pixels in Blue Marble.
    float water = smoothstep(0.3, 0.62, (day.b - max(day.r, day.g)) / (day.b + 0.002));

    float lit = smoothstep(-0.08, 0.35, ndl);
    float diffuse = max(ndl, 0.0);
    vec3 color = day * (diffuse * 1.65 + 0.015);
    color *= 1.0 - cloud * 0.55 * lit;

    vec3 H = normalize(L + V);
    float nh = max(dot(N, H), 0.0);
    float glint = (pow(nh, 90.0) * 1.6 + pow(nh, 12.0) * 0.12) * water * (1.0 - cloud);
    color += vec3(1.0, 0.92, 0.8) * glint * lit;

    float darkSide = 1.0 - smoothstep(-0.18, 0.08, ndl);
    color += night * vec3(1.0, 0.72, 0.42) * 1.6 * darkSide * (1.0 - cloud * 0.8);

    // Rayleigh haze thickening toward the limb.
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    vec3 haze = mix(vec3(0.95, 0.45, 0.2), vec3(0.32, 0.58, 1.0), smoothstep(-0.05, 0.4, ndl));
    color = mix(color, haze * (0.25 + diffuse), fresnel * smoothstep(-0.25, 0.3, ndl) * 0.75);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const cloudFragment = /* glsl */ `
  uniform sampler2D cloudMap;
  uniform vec3 sunDir;
  uniform float cloudOffset;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float ndl = dot(N, normalize(sunDir));
    float c = texture2D(cloudMap, vUv + vec2(cloudOffset, 0.0)).r;
    float alpha = smoothstep(0.12, 0.85, c);
    // Fade clouds at grazing angles so the limb stays crisp.
    alpha *= smoothstep(0.0, 0.18, dot(N, V));
    vec3 sunset = mix(vec3(1.0, 0.55, 0.32), vec3(1.0), smoothstep(0.0, 0.3, ndl));
    vec3 color = sunset * (max(ndl, 0.0) * 1.35 + 0.02);
    gl_FragColor = vec4(color, alpha * 0.96);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 center;
  uniform float radius;
  uniform float atmosphereRadius;
  uniform vec3 sunDir;
  varying vec3 vPosW;

  vec2 raySphere(vec3 ro, vec3 rd, float r) {
    vec3 oc = ro - center;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - r * r;
    float h = b * b - c;
    if (h < 0.0) return vec2(-1.0);
    h = sqrt(h);
    return vec2(-b - h, -b + h);
  }

  void main() {
    vec3 ro = cameraPosition;
    vec3 rd = normalize(vPosW - ro);
    vec2 ta = raySphere(ro, rd, atmosphereRadius);
    vec2 tp = raySphere(ro, rd, radius);
    float t0 = max(ta.x, 0.0);
    float t1 = tp.x > 0.0 ? tp.x : ta.y;
    float seg = max(t1 - t0, 0.0);

    vec3 L = normalize(sunDir);
    float depth = 0.0;
    vec3 light = vec3(0.0);
    float thickness = atmosphereRadius - radius;
    for (int i = 0; i < 10; i++) {
      vec3 p = ro + rd * (t0 + seg * (float(i) + 0.5) / 10.0);
      vec3 up = normalize(p - center);
      float h = clamp((length(p - center) - radius) / thickness, 0.0, 1.0);
      float d = exp(-h * 5.0) * seg / 10.0;
      float mu = dot(up, L);
      float sun = smoothstep(-0.28, 0.3, mu);
      vec3 tint = mix(vec3(1.0, 0.42, 0.16), vec3(0.3, 0.58, 1.0), smoothstep(-0.02, 0.32, mu));
      depth += d;
      light += d * tint * sun;
    }
    float alpha = 1.0 - exp(-depth * 16.0 / radius);
    vec3 color = depth > 0.0 ? light / depth : vec3(0.0);
    float glow = max(color.r, max(color.g, color.b));
    // Forward scattering brightens the limb toward the sun.
    float forward = pow(max(dot(rd, L), 0.0), 6.0);
    color *= 1.6 + forward * 2.0;
    gl_FragColor = vec4(color, clamp(alpha * clamp(glow * 1.3, 0.0, 1.0), 0.0, 1.0));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereVertex = /* glsl */ `
  varying vec3 vPosW;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosW = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/** Unit vector for a latitude/longitude on three.js's SphereGeometry UV layout. */
export function latLonToLocal(lat: number, lon: number) {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo));
}

export function createEarth(radius: number, sunDir: THREE.Vector3, onLoad?: () => void) {
  const loader = new THREE.TextureLoader();
  let pending = 3;
  const loaded = () => {
    pending -= 1;
    if (pending === 0) onLoad?.();
  };
  const texture = (url: string, srgb: boolean) => {
    const t = loader.load(url, loaded);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 16;
    t.wrapS = THREE.RepeatWrapping;
    return t;
  };
  const dayMap = texture("/textures/earth/day.jpg", true);
  const nightMap = texture("/textures/earth/night.jpg", true);
  const cloudMap = texture("/textures/earth/clouds.jpg", false);

  const shared = { sunDir: { value: sunDir }, cloudOffset: { value: 0 } };
  const group = new THREE.Group();

  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 192, 128),
    new THREE.ShaderMaterial({
      uniforms: { ...shared, dayMap: { value: dayMap }, nightMap: { value: nightMap }, cloudMap: { value: cloudMap } },
      vertexShader: surfaceVertex,
      fragmentShader: surfaceFragment,
    })
  );
  group.add(surface);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.006, 192, 128),
    new THREE.ShaderMaterial({
      uniforms: { ...shared, cloudMap: { value: cloudMap } },
      vertexShader: surfaceVertex,
      fragmentShader: cloudFragment,
      transparent: true,
      depthWrite: false,
    })
  );
  group.add(clouds);

  const atmosphereRadius = radius * 1.035;
  const center = new THREE.Vector3();
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(atmosphereRadius, 128, 96),
    new THREE.ShaderMaterial({
      uniforms: { sunDir: shared.sunDir, center: { value: center }, radius: { value: radius }, atmosphereRadius: { value: atmosphereRadius } },
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      transparent: true,
      depthWrite: false,
    })
  );
  atmosphere.renderOrder = 2;
  // The atmosphere shader works in world space, so it stays unrotated.
  const shell = new THREE.Group();
  shell.add(atmosphere);

  return {
    /** Rotating body: surface and clouds. */
    globe: group,
    /** Atmosphere shell; position it at the same centre as the globe. */
    shell,
    update(time: number) {
      shared.cloudOffset.value = (time * 0.0009) % 1;
      shell.getWorldPosition(center);
    },
  };
}
