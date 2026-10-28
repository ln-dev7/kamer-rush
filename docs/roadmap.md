# Current limits and possible next work

This separates working behavior from future ideas. None of the items below is promised or implemented merely because it appears here.

## Known prototype limits

- The city is a bounded procedural grid with regional palettes, parks and waterfront details. Buildings remain stylistically repeated; this is not a scanned or geographically accurate Douala.
- All six passenger mission definitions exist. Complete end-to-end play was concentrated on the introduction in both vehicle types; the five longer routes still need full balance/playtesting.
- Vehicle dynamics and collisions are arcade approximations. Static collision uses mode-specific circles, moving/parked vehicles use expanded oriented rectangles. There is no rigid-body damage, suspension, exact continuous collision or pedestrian ragdoll.
- Boarding, exit and passengers use locked procedural position/pose transitions and animated taxi doors. Contact-perfect climbing and obstacle-aware passenger pathfinding remain incomplete; local approaches are not a navmesh.
- Pedestrians follow constrained sidewalk segments; traffic follows predetermined rectangular loops and simple proximity stopping. There is no navmesh, pedestrian crossing policy, lane-changing or comprehensive junction priority. Local traffic deadlocks may occur.
- Camera easing and a simple obstacle shortening query improve occlusion but cannot guarantee a clear cinematic view at every facade/prop.
- The minimap is real local cartography; the full-map dotted line is a direct bearing, not turn-by-turn routing. No user waypoint placement is available.
- Only totals are saved. Vehicle parking and mission state persist during the running session, not after reload. Sound and quality are not saved.
- Walking and cycling support exploration and switching; there are no separate walking/cycling objectives, interiors, trucks to drive, garage upgrades, multiplayer, accounts or purchases.
- Real phone performance, multitouch, Safari/Firefox, accessibility assistive technology and long-duration play have not been certified.

## Candidate next work, requiring prioritization

1. Playtest and tune all long missions and collision envelopes on actual phones and desktop browsers.
2. Improve animation transitions and character silhouettes, without weakening safe vehicle placement.
3. Author a few more distinctive landmarks and non-grid connectors within the existing area before increasing world size again.
4. Refine traffic junction behavior and resolve deadlocks; add route guidance if users need it.
5. Profile initialization, dynamic mesh count and shadows, then consider spatial scene chunks/LOD.
6. Decide the project license, review provenance and complete the publication checklist before calling the repository open source.

Cameroonian music is pending compatible rights. Generated voices have separate ElevenLabs conditions; native accent/pronunciation validation remains outstanding.
