import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CollisionGrid,
  insideVehicle,
  safeExit,
  nearestVehicle,
} from "../src/collision.ts";
test("grid blocks building interiors, corners and adjacent cell edges", () => {
  const grid = new CollisionGrid([{ x: 48, z: 48, w: 12, d: 12 }]);
  assert(grid.blocked({ x: 48, z: 48 }, 0.35));
  assert(grid.blocked({ x: 41.9, z: 48 }, 0.35));
  assert(!grid.blocked({ x: 40, z: 40 }, 0.35));
  assert(grid.blocked({ x: 42, z: 42 }, 0.4));
});
test("vehicle collision follows heading", () => {
  assert(
    insideVehicle({ x: 1.7, z: 0 }, { x: 0, z: 0 }, Math.PI / 2, 1.8, 4, 0.2),
  );
  assert(
    !insideVehicle({ x: 0, z: 1.7 }, { x: 0, z: 0 }, Math.PI / 2, 1.8, 4, 0.2),
  );
});
test("exit chooses a clear side and refuses when all candidates are blocked", () => {
  const exit = safeExit({ x: 0, z: 0 }, 0, (p) => p.x > 0);
  assert(exit && exit.x < 0);
  assert.equal(
    safeExit({ x: 0, z: 0 }, 0, () => true),
    null,
  );
});
test("boarding resolves the closest parked vehicle and rejects remote vehicles", () => {
  const moto = { position: { x: 3, z: 35 } },
    taxi = { position: { x: -3, z: 35 } };
  assert.equal(nearestVehicle({ x: -1, z: 35 }, [moto, taxi]), taxi);
  assert.equal(nearestVehicle({ x: 30, z: 35 }, [moto, taxi]), undefined);
});
