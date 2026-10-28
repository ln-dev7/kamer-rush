# Extending the prototype

Read [architecture](architecture.md) first. All examples use the existing modules and units; no external service is required. Keep a small playable test case while extending content.

## Add a passenger mission

Add an object to `missions` in `src/logic.ts`. Existing missions are the best complete examples. For example:

```ts
{
  name: 'Across Bonamé',
  person: 'Nora',
  role: 'Ceramic artist',
  line: 'Please take me to the terrace.',
  pickup: { x: 48, z: 72 },
  drop: { x: 144, z: 128 },
  destination: 'Terrasse Bonamé',
  limit: 150,
  focus: 'COMFORT',
  tip: 'Keep a steady pace. Minimum comfort: 60%.',
  reward: 900,
  minComfort: 60,
}
```

The example pickup is on the vertical road X=48. The runtime currently spawns all three vehicles on the nearest vertical road, 10 m south of pickup; use a vertical-road pickup unless you also update `resetMission`. Check the parked vehicle footprints, client position and safe exits in the actual world. Do not place targets inside buildings, on medians or beyond `EXTENT`. A drop can be anywhere with enough drivable stopping space.

Add a corresponding landmark in `src/map.ts` only if it should appear as a persistent place. Test both passenger-capable vehicle types, the deadline, comfort failure and retry. Tune time using an actual drive, not just straight-line distance. After changing the array length, update any count in welcome copy and [player documentation](../README.md); tests currently assert six missions intentionally.

## Add or change a sector

Sector metadata and lookup are in `src/map.ts`: `districts`, `landmarks`, `districtAt`. Building palettes, height choices, gardens and market details are selected in `buildWorld` in `src/world.ts`. Update both metadata and geometry when adding a sector; a label alone is not a playable district.

For a sector inside the current bounds:

1. Define its location, name and descriptive intent in `districts`.
2. Add its region condition in `districtAt` in the desired priority order. Existing east/west conditions take priority over north/south in the corners.
3. Give it a coherent palette, frontage or park/landmark treatment in `buildWorld`. Keep streets connected.
4. Add static solids for solid props. Confirm pedestrian spawn segments and waiting clients remain clear.
5. Update mission destinations, map labels and player guidance as needed.
6. Drive there in both motor vehicles and on the bicycle, walk around props, open the full map and verify minimap footprints at turns.

Expanding beyond the current 644 m square is a larger change. Review `ROADS`, `EXTENT`, block generation, NPC spawn indexing, minimap block loops, full-map framing/scale, traffic-loop centres, world boundary barriers, camera fog/far plane and performance budgets. Some layout assumptions are still tied to 48 m blocks and 12 inter-road rows. Changing `ROAD_STEP` alone is not a supported arbitrary world-resizing API.

## Add or rescale a vehicle

`motorcycle`, `bicycle`, `car` and `truck` in `src/world.ts` return original Three.js objects. Car, motorcycle and bicycle are player vehicles; truck is traffic/scenery only.

For a visual variant, reuse the constructor's shared primitives/materials and change its appearance without changing collision dimensions. For a new footprint:

1. Build it in canonical metre units, heading +Z, with a stable root and ground contact.
2. Measure its real bounds with `new THREE.Box3().setFromObject(root)` before gameplay rotation/position. Add it to `/scale.html` and the dimension tests.
3. Put matching width, length and circle envelope in `src/dimensions.ts`.
4. Update runtime collision queries, traffic stop distance and driver/passenger positions. A model scale change must not leave old colliders behind.
5. Test parked collisions from all sides, reversing, tight turns, safe exit candidates, boarding and mission pickup/dropoff.

An additional **controllable** transport requires an explicit state addition: update `Transport`, `body()`, `bodyRadius()`, driver visibility, speed/steering, `toggleVehicle`, eligible boarding roots, mission interaction, transport HUD, minimap icons, reset behavior and tests. Merely drawing another model does not make it playable.

## Add world assets or sound

Prefer procedural geometry and reuse shared unit shapes so static meshes can be instanced. `buildWorld` batches geometry/material pairs into InstancedMesh objects after recording world transforms. Do not put animated characters into that static batch. Add an appropriate collider for a solid prop; include it in minimap shape rules when meaningful.

Before using any third-party asset, record its exact source, author, version, license, attribution requirements and local path in [THIRD_PARTY.md](../THIRD_PARTY.md). Keep the license text in `licenses/`. Do not assume a freely downloadable model is redistributable. Private reference screenshots are never game assets or public documentation images by default.

The current sound is generated through Web Audio. Keep new audio opt-in and beneath the useful cues. Do not auto-play downloaded music or introduce external tracking/streaming.
