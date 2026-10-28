import { distance, type Point } from "./logic";
export type Solid = { x: number; z: number; w: number; d: number };
export class CollisionGrid {
  private cells = new Map<string, Solid[]>();
  constructor(solids: Solid[]) {
    for (const s of solids) {
      for (
        let x = Math.floor((s.x - s.w / 2) / 48);
        x <= Math.floor((s.x + s.w / 2) / 48);
        x++
      )
        for (
          let z = Math.floor((s.z - s.d / 2) / 48);
          z <= Math.floor((s.z + s.d / 2) / 48);
          z++
        ) {
          const k = `${x},${z}`;
          this.cells.set(k, [...(this.cells.get(k) || []), s]);
        }
    }
  }
  blocked(p: Point, r: number) {
    for (
      let x = Math.floor((p.x - r) / 48);
      x <= Math.floor((p.x + r) / 48);
      x++
    )
      for (
        let z = Math.floor((p.z - r) / 48);
        z <= Math.floor((p.z + r) / 48);
        z++
      )
        for (const s of this.cells.get(`${x},${z}`) || []) {
          const nx = Math.max(s.x - s.w / 2, Math.min(p.x, s.x + s.w / 2));
          const nz = Math.max(s.z - s.d / 2, Math.min(p.z, s.z + s.d / 2));
          if (Math.hypot(p.x - nx, p.z - nz) < r) return true;
        }
    return false;
  }
}
export function insideVehicle(
  p: Point,
  vehicle: Point,
  angle: number,
  w: number,
  d: number,
  r: number,
) {
  const dx = p.x - vehicle.x,
    dz = p.z - vehicle.z,
    x = dx * Math.cos(angle) - dz * Math.sin(angle),
    z = dx * Math.sin(angle) + dz * Math.cos(angle);
  return Math.abs(x) < w / 2 + r && Math.abs(z) < d / 2 + r;
}
export function safeExit(
  vehicle: Point,
  angle: number,
  blocked: (p: Point) => boolean,
  preferredSide = 1,
) {
  for (const side of [preferredSide, -preferredSide])
    for (const forward of [0, -1.8, 1.8]) {
      const p = {
        x:
          vehicle.x + Math.cos(angle) * side * 2.35 + Math.sin(angle) * forward,
        z:
          vehicle.z - Math.sin(angle) * side * 2.35 + Math.cos(angle) * forward,
      };
      if (!blocked(p)) return p;
    }
  return null;
}
export function nearestVehicle<T extends { position: Point }>(
  p: Point,
  vehicles: T[],
) {
  return vehicles
    .filter((v) => distance(p, v.position) < 3.6)
    .sort((a, b) => distance(p, a.position) - distance(p, b.position))[0];
}
