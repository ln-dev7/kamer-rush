import { test } from "node:test";
import assert from "node:assert/strict";
import {
  drive,
  canInteract,
  grade,
  readProgress,
  missions,
} from "../src/logic.ts";
test("pickup requires a stopped vehicle within six metres", () => {
  assert.equal(canInteract({ x: 0, z: 0 }, { x: 0, z: 5 }, 1), true);
  assert.equal(canInteract({ x: 0, z: 0 }, { x: 0, z: 5 }, 4), false);
  assert.equal(canInteract({ x: 0, z: 0 }, { x: 0, z: 7 }, 0), false);
});
test("acceleration is bounded and braking stops the bike", () => {
  let s = 0;
  for (let i = 0; i < 600; i++) s = drive(s, 1, false, 1 / 60);
  assert(s > 15 && s <= 22);
  for (let i = 0; i < 120; i++) s = drive(s, 0, true, 1 / 60);
  assert(s < 0.1);
});
test("saved progress survives valid JSON and recovers corrupt data", () => {
  assert.equal(readProgress("{bad").completed, 0);
  assert.equal(readProgress('{"completed":-1}').completed, 0);
  assert.equal(
    readProgress('{"reputation":3,"earnings":650,"completed":1,"best":3}')
      .earnings,
    650,
  );
});
test("ratings reward comfort and margin", () => {
  assert.equal(grade(90, 30), 3);
  assert.equal(grade(50, 10), 2);
  assert.equal(grade(10, 5), 1);
});
test("every mission has reachable road points and a distinct requirement", () => {
  assert.equal(missions.length, 6);
  for (const m of missions) {
    assert(m.limit > 0);
    for (const p of [m.pickup, m.drop])
      assert(Math.abs(p.x) < 322 && Math.abs(p.z) < 322);
  }
});

test("bicycle has a bounded pedal speed and brakes to rest", async () => {
  const { cycleDrive } = await import("../src/logic.ts");
  let speed = 0;
  for (let i = 0; i < 1200; i++) speed = cycleDrive(speed, 1, false, 1 / 60);
  assert(speed > 6 && speed <= 9);
  for (let i = 0; i < 120; i++) speed = cycleDrive(speed, 0, true, 1 / 60);
  assert(speed < 0.01);
});
