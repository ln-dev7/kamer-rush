import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { motorcycle, car, truck, person } from "../src/world.ts";
import { dimensions, roadWidth } from "../src/dimensions.ts";
const size = (g: T.Object3D) =>
  new T.Box3().setFromObject(g).getSize(new T.Vector3());
test("metre-scale models retain human/motorcycle/car/truck proportions", () => {
  const bike = size(motorcycle().group),
    taxi = size(car()),
    lorry = size(truck()),
    human = size(person());
  assert(bike.z > 1.9 && bike.z < 2.3);
  assert(bike.x > 0.7 && bike.x < 1);
  assert(taxi.z > 4.3 && taxi.z < 4.6);
  assert(taxi.x > 1.8 && taxi.x < 2);
  assert(lorry.z > 6.7 && lorry.z < 7.4);
  assert(lorry.x > 2.3 && lorry.x < 2.6);
  assert(human.y > 1.7 && human.y < 1.9);
  assert(taxi.z > bike.z * 2);
  assert(lorry.z > taxi.z * 1.5);
});
test("collider dimensions match the visible model envelopes", () => {
  for (const [model, d] of [
    [motorcycle().group, dimensions.moto],
    [car(), dimensions.taxi],
    [truck(), dimensions.truck],
  ] as const) {
    const s = size(model);
    assert(Math.abs(s.x - d.width) < 0.16);
    assert(Math.abs(s.z - d.length) < 0.3);
  }
});
test("boulevard and local streets remain wider than traffic", () => {
  assert.equal(roadWidth(0), 18);
  assert.equal(roadWidth(48), 12);
  assert(roadWidth(48) > dimensions.truck.width * 4);
});

test("bicycle model uses a smaller envelope than a car", async () => {
  const { bicycle } = await import("../src/world.ts");
  const b = size(bicycle().group);
  assert(b.z > 1.9 && b.z < 2.2);
  assert(b.x < 0.9);
  assert(Math.abs(b.z - dimensions.bicycle.length) < 0.15);
});
