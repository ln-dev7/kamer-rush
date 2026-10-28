import { clamp, type Point } from "./logic";
export const SHORE = {
  x: 324,
  minZ: 90,
  maxZ: 150,
  swimMaxX: 392,
  swimMinZ: 76,
  swimMaxZ: 164,
};
export const shoreAccess = (p: Point) => p.z >= SHORE.minZ && p.z <= SHORE.maxZ;
export const inWater = (p: Point) => p.x > SHORE.x;
export const nextWaterState = (p: Point, swimming: boolean) =>
  p.x > (swimming ? 323 : 324);
export function coastalBlocked(p: Point, r: number, onFoot: boolean) {
  if (onFoot) {
    if (
      p.x > SHORE.swimMaxX - r ||
      p.z > 318 - r ||
      p.z < -318 + r ||
      p.x < -318 + r
    )
      return true;
    if (p.x > SHORE.x)
      return p.z < SHORE.swimMinZ + r || p.z > SHORE.swimMaxZ - r;
    if (p.x > 318 - r && !shoreAccess(p)) return true;
    return false;
  }
  return Math.abs(p.x) > 318 - r || Math.abs(p.z) > 318 - r;
}
export function groundHeight(p: Point) {
  if (shoreAccess(p) && p.x > 314)
    return 0.09 - 0.44 * clamp((p.x - 314) / 12, 0, 1);
  if (p.x >= 298) return 0.09;
  if (Math.abs(p.x) > 295 || Math.abs(p.z) > 295) return 0.12;
  const axes = Array.from({ length: 13 }, (_, i) => (i - 6) * 48);
  return axes.some(
    (a) =>
      Math.abs(p.x - a) < (a === 0 ? 9 : 6) ||
      Math.abs(p.z - a) < (a === 0 ? 9 : 6),
  )
    ? 0.12
    : 0.22;
}
export function moveSwept(
  p: Point,
  delta: Point,
  blocked: (p: Point) => boolean,
  slide = false,
) {
  const steps = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.z) / 0.24));
  const current = { ...p };
  let hit = false;
  for (let i = 0; i < steps; i++) {
    const dx = delta.x / steps,
      dz = delta.z / steps,
      candidate = { x: current.x + dx, z: current.z + dz };
    if (!blocked(candidate)) {
      Object.assign(current, candidate);
      continue;
    }
    hit = true;
    if (!slide) break;
    const x = { x: current.x + dx, z: current.z },
      z = { x: current.x, z: current.z + dz };
    if (!blocked(x)) Object.assign(current, x);
    else if (!blocked(z)) Object.assign(current, z);
  }
  return { position: current, hit };
}
export function footTargetSpeed(
  throttle: number,
  boost: boolean,
  swimming: boolean,
) {
  return throttle * (swimming ? (boost ? 2.5 : 1.8) : boost ? 4.7 : 1.8);
}
export const smoothTransition = (t: number) => {
  const v = clamp(t, 0, 1);
  return v * v * (3 - 2 * v);
};
