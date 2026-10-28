# Rendering, performance and settings

The target is a coherent stylized browser prototype, not a measured mobile benchmark.

## Implemented choices

- Shared unit box, sphere, cylinder and plane geometries, cached materials and sign textures.
- Static world meshes regrouped into GPU instances by geometry/material, rather than one draw call for every frontage element.
- A spatial grid for static collision, so body queries inspect nearby cells.
- Fog and a finite camera far plane; the area itself is bounded and dense, not an endless empty terrain.
- Distance-limited NPC groups (100 m) and traffic groups (175 m).
- One original analytic water draw, a procedural sky and low-amplitude vertex leaf breeze; no water reflection render targets or weather-data simulation.
- One directional shadow light, hemisphere ambient lighting, capped device pixel ratio and modest primitive segment counts.
- Auto quality observes the first 180 playing frames and, when average frame duration exceeds 35 ms, switches to pixel ratio 1 and disables shadows. This is a simple fallback, not a performance guarantee or continuous adaptive system.

Quality settings at the welcome screen: Auto, Light (pixel ratio 1, no shadows), High (up to pixel ratio 2, shadows). Default Auto caps at 1.6. Sound is opt-in and generated locally; walking mutes the engine tone. Quality settings are session-only.

## Build advisory

The production bundle is a few hundred kilobytes before compression, with the Three.js vendor chunk slightly above Vite's 500 kB advisory threshold. Vite reports the exact current files and gzip sizes during `npm run build`. The advisory is not hidden or treated as a failing test. Dependencies are bundled locally; the game loads no CDN fonts, remote models or music.

## Limits and next measurements

No real phone FPS, battery, GPU memory or thermal measurements have been taken. Integrated-browser viewport resizing tests layout and event handling, not physical mobile performance. Static instances currently span the whole scene; they are not streamed world chunks. Dynamic traffic/characters still contain several small meshes. Full shadow rendering, scene initialization and older GPUs need profiling before larger expansion.

Use the Light setting for a slower device. Any performance claim should name the actual hardware/browser, resolution, quality, route, warmup and measurement interval. Add scene chunking or more aggressive dynamic instancing only after measuring the bottleneck; do not trade away collision correctness or clear objectives to inflate map size.
