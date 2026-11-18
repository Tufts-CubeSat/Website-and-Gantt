import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * Collapses the static meshes under `container` into one mesh per material,
 * so a part built from dozens of boxes and cylinders costs a handful of draw
 * calls (in both the colour and the shadow pass) instead of one per piece.
 *
 * Children flagged `userData.dynamic` keep their own transform and are merged
 * separately, relative to themselves. InstancedMeshes are left as they are.
 */
export function mergeStatic(container: THREE.Object3D) {
  const buckets = new Map<THREE.Material, { geometries: THREE.BufferGeometry[]; castShadow: boolean; receiveShadow: boolean }>();
  const merged: THREE.Mesh[] = [];

  const collect = (object: THREE.Object3D, parentMatrix: THREE.Matrix4) => {
    for (const child of [...object.children]) {
      if (child.userData.dynamic) {
        mergeStatic(child);
        continue;
      }
      child.updateMatrix();
      const matrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, child.matrix);
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && !(child as THREE.InstancedMesh).isInstancedMesh) {
        for (const [material, geometry] of splitByMaterial(mesh)) {
          geometry.applyMatrix4(matrix);
          const bucket = buckets.get(material) ?? { geometries: [], castShadow: false, receiveShadow: false };
          bucket.geometries.push(geometry);
          bucket.castShadow ||= mesh.castShadow;
          bucket.receiveShadow ||= mesh.receiveShadow;
          buckets.set(material, bucket);
        }
        merged.push(mesh);
      }
      collect(child, matrix);
    }
  };
  collect(container, new THREE.Matrix4());

  for (const mesh of merged) mesh.removeFromParent();
  for (const [material, bucket] of buckets) {
    const geometry = mergeGeometries(bucket.geometries);
    bucket.geometries.forEach((g) => g.dispose());
    if (!geometry) throw new Error("mergeStatic: incompatible geometries");
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = bucket.castShadow;
    mesh.receiveShadow = bucket.receiveShadow;
    container.add(mesh);
  }
}

/** Non-indexed copies of the mesh's geometry, one per material it uses, with a uniform attribute set. */
function splitByMaterial(mesh: THREE.Mesh): [THREE.Material, THREE.BufferGeometry][] {
  const source = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", source.getAttribute("position"));
  geometry.setAttribute("normal", source.getAttribute("normal"));
  const count = source.getAttribute("position").count;
  geometry.setAttribute("uv", source.getAttribute("uv") ?? new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2));

  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  if (!Array.isArray(mesh.material) || source.groups.length === 0) return [[materials[0], geometry]];

  // After toNonIndexed, group ranges index vertices directly.
  const parts: [THREE.Material, THREE.BufferGeometry][] = [];
  for (const group of source.groups) {
    const material = materials[group.materialIndex ?? 0];
    if (!material) continue;
    const end = Math.min(group.start + group.count, count);
    const part = new THREE.BufferGeometry();
    for (const name of ["position", "normal", "uv"] as const) {
      const attribute = geometry.getAttribute(name) as THREE.BufferAttribute;
      const size = attribute.itemSize;
      part.setAttribute(name, new THREE.BufferAttribute((attribute.array as Float32Array).slice(group.start * size, end * size), size));
    }
    parts.push([material, part]);
  }
  return parts;
}
