import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  moveSwept,
  coastalBlocked,
  nextWaterState,
  footTargetSpeed,
  smoothTransition,
} from "../src/locomotion.ts";
import { solveLimb, poseVehicleRider } from "../src/animation.ts";
import { person, motorcycle, bicycle, animateBicycle } from "../src/world.ts";
import {
  VoiceDirector,
  approvedLocalAudio,
  type AudioCatalog,
} from "../src/voice-director.ts";
import { drive, cycleDrive } from "../src/logic.ts";
import { nextOptionIndex } from "../src/ui.ts";
test("swept movement cannot tunnel through a thin obstacle at maximum vehicle speed", () => {
  const r = moveSwept(
    { x: 0, z: 0 },
    { x: 1.55, z: 0 },
    (p) => p.x >= 0.7 && p.x <= 1,
  );
  assert(r.hit);
  assert(r.position.x < 0.7);
});
test("foot sliding preserves the unobstructed axis", () => {
  const r = moveSwept({ x: 0, z: 0 }, { x: 1, z: 1 }, (p) => p.x > 0.4, true);
  assert(r.hit);
  assert(r.position.x <= 0.4);
  assert(r.position.z > 0.9);
});
test("shore permits walkers in the bounded cove and blocks every vehicle", () => {
  assert(!coastalBlocked({ x: 330, z: 120 }, 0.34, true));
  assert(coastalBlocked({ x: 330, z: 120 }, 1, false));
  assert(coastalBlocked({ x: 330, z: 30 }, 0.34, true));
  assert(coastalBlocked({ x: 393, z: 120 }, 0.34, true));
  assert(nextWaterState({ x: 324.1, z: 120 }, false));
  assert(nextWaterState({ x: 323.5, z: 120 }, true));
  assert(!nextWaterState({ x: 322.9, z: 120 }, true));
});
test("sprint, swim and powered acceleration have distinct bounded speeds", () => {
  assert.equal(footTargetSpeed(1, true, false), 4.7);
  assert.equal(footTargetSpeed(1, false, false), 1.8);
  assert.equal(footTargetSpeed(1, true, true), 2.5);
  assert(drive(22, 1, false, 0.05, true) > 22);
  assert.equal(drive(31, 1, false, 0.05, true), 31);
  assert.equal(cycleDrive(12, 1, false, 0.05, true), 12);
  assert.equal(smoothTransition(-1), 0);
  assert.equal(smoothTransition(2), 1);
});
test("articulated limbs reach pedals without stretching bones", () => {
  const model = bicycle();
  model.rider.visible = true;
  for (const phase of [0, 0.5, 1.5, 3.2]) {
    animateBicycle(model, phase, 0.2, 0);
    for (const leg of model.rider.userData.legs) {
      const d = leg.userData;
      assert(Math.abs(d.joint.position.length() - d.upperLength) < 1e-5);
      assert(
        Math.abs(
          d.lastTarget.clone().sub(d.joint.position).length() - d.lowerLength,
        ) < 1e-5,
      );
    }
  }
});
test("mounted character retains the same scale as a pedestrian", () => {
  const moto = motorcycle();
  moto.group.updateWorldMatrix(true, true);
  assert(Math.abs(moto.rider.getWorldScale(new T.Vector3()).x - 1) < 1e-6);
  const c = bicycle();
  assert.equal(c.rider.scale.x, 1);
});
test("select navigation wraps and skips disabled options", () => {
  const o = [
    { value: "a", label: "A" },
    { value: "b", label: "B", disabled: true },
    { value: "c", label: "C" },
  ];
  assert.equal(nextOptionIndex(o, 0, 1), 2);
  assert.equal(nextOptionIndex(o, 2, 1), 0);
  assert.equal(nextOptionIndex(o, 0, -1), 2);
});
const catalog = JSON.parse(
  readFileSync("public/audio/catalog.json", "utf8"),
) as AudioCatalog;
test("public catalog includes all 40 authorized voices and no music", () => {
  assert.equal(catalog.lines.length, 40);
  assert.equal(catalog.tracks.length, 0);
  for (const line of catalog.lines)
    assert(approvedLocalAudio(line.file, line.license, "voices"));
});
test("distributed recordings match the original casting hashes", () => {
  const casting = JSON.parse(
    readFileSync("docs/audio-manifest.json", "utf8"),
  ) as { id: string; text: string; sha256: string }[];
  const hashes = new Set();
  for (const line of catalog.lines) {
    const row = casting.find((r) => r.id === line.id)!;
    assert(row);
    assert.equal(row.text, line.text);
    const hash = createHash("sha256")
      .update(readFileSync("public/" + line.file))
      .digest("hex");
    assert.equal(hash, row.sha256);
    assert.equal(hash, (line as any).sha256);
    hashes.add(hash);
  }
  assert.equal(hashes.size, 40);
});
test("voice director enforces one voice, cooldown and no fictional mechanics", () => {
  const lines = catalog.lines.map((l) => ({ ...l }));
  const d = new VoiceDirector(lines);
  const first = d.request("greeting", 0);
  assert(first);
  assert.equal(d.request("greeting", 1), null);
  assert.equal(d.request("negotiation", 40), null);
  assert.equal(d.request("greeting", 3), null);
  const next = d.request("greeting", 40);
  assert(next);
  assert.equal(d.active, next);
  assert(
    !approvedLocalAudio(
      "https://remote/audio.mp3",
      { status: "approved", type: null, source: null },
      "voices",
    ),
  );
});
