# Architecture and simulation

## Modules and assets

| Module               | Responsibility                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/main.ts`        | DOM interface, input, state changes, animation loop, camera, traffic/NPC motion, mission integration, map drawing, local save and synthesized sound |
| `src/world.ts`       | Original primitive-based models, shared materials/geometries, static world construction and instancing                                              |
| `src/environment.ts` | Original analytic water, procedural sky and shared cosmetic breeze time                                                                             |
| `src/map.ts`         | Road coordinates, world extent, fictional sector metadata, six landmarks and sector lookup                                                          |
| `src/dimensions.ts`  | Vehicle collider envelopes and road-width convention                                                                                                |
| `src/collision.ts`   | Static spatial grid, oriented parked/traffic rectangle queries, safe exit candidates and nearest boarding target                                    |
| `src/logic.ts`       | Pure distance/driving/grading functions, mission definitions and save validation                                                                    |
| `src/style.css`      | Responsive welcome, HUD, controls, maps and modal layouts                                                                                           |
| `src/scale-check.ts` | Isolated visual regression fixture using the actual game model constructors                                                                         |
| `tests/`             | Node test runner tests, executed through the tsx loader                                                                                             |

Three.js renders the world. Lucide supplies imported SVG icon definitions. Vite serves/builds the game, credits and scale HTML entry points. There is no application backend, React layer or external asset loading.

## Coordinates and scale

One unit is one metre. Y is up; the ground is near Y=0. Road surfaces are about Y=0.12. Motion uses X/Z, heading zero points toward +Z, and `Math.PI` points north toward −Z. Positive heading increases toward +X. Camera, minimap and collider calculations share this convention. All times use seconds, angles use radians and the HUD converts m/s to km/h with ×3.6.

The road grid uses 48 m spacing, 13 coordinates from −288 to +288, with a bounded extent of ±322 m. Most roads are 12 m wide; the two central axes are 18 m boulevards. Short medians are absent at intersections and in the central arrival area. Block geometry includes sidewalks, shifted frontage along the boulevards, vegetation, market details and gardens. The eastern shore barrier opens between Z=90 and Z=150. Only pedestrians may cross the sloped shore. Swimming is bounded by X=392 and Z=76..164, marked by buoys. Vehicle bounds stay at X=318 minus collider radius. `locomotion.ts` owns shared shore limits, terrain height, hysteresis and movement subdivision. Boats are absent.

Measured canonical model bounds (Three.js Box3, before position/rotation):

| Model                      | Width                 | Height      | Length |
| -------------------------- | --------------------- | ----------- | ------ |
| Standing character         | 0.75 m including arms | about 1.8 m | 0.47 m |
| Bicycle including rider    | 0.66 m                | 1.95 m      | 2.01 m |
| Motorcycle including rider | 0.85 m                | 1.96 m      | 2.10 m |
| Urban taxi                 | 1.91 m                | 1.76 m      | 4.51 m |
| Delivery truck             | 2.48 m                | 3.20 m      | 7.05 m |

Helmet height can be slightly above a car roof; vehicle footprint and length are the meaningful size comparison. `/scale.html` puts the shared models at identical Z depth with an orthographic camera and metre grid. Its measurements and the dimension tests prevent per-vehicle camera tricks from hiding scale errors.

## Runtime and pause

`requestAnimationFrame` supplies real elapsed time. Simulation dt is capped at 0.05 s to avoid large jumps after a stalled frame. Only `playing` advances driving, NPCs, traffic and mission time. Rendering, cosmetic marker movement and camera easing continue in overlays. A separate simulation clock prevents pedestrians from jumping to a new sinusoidal position after pause.

UI modes are `welcome`, `playing`, `paused`, `result`, `map`, `settings` and `credits`. The whole-city map freezes the simulation. Window blur or a hidden document pauses play and clears held inputs. Keys are stored in a Set; pointer capture gives hold/release behavior for on-screen pedals. A transition also clears the input set.

## Transport state machine

Transport is `moto`, `taxi`, `bicycle` or `walk`. `body()` resolves the current moving root, and camera/minimap/HUD derive their position from that root. The parked motorcycle, taxi and bicycle remain separate objects. The walking avatar is a separate articulated primitive character. Only the current vehicle displays its driver; the mission passenger appears on the selected vehicle.

Exit requires speed below 0.6 m/s and no passenger. `safeExit` checks both sides and a few longitudinal offsets. Static obstacles, parked vehicles, traffic and pedestrians must leave a clear point. If all candidates fail, the game refuses the action. Walking boarding uses the nearest eligible vehicle within 3.6 m; it restores that vehicle's stored heading. Keyboard repeats are ignored for transitions and an active transition lock plus a 350 ms completion guard prevent rapid toggling. The visible actor interpolates position, scale and limb pose over about one second; taxi doors rotate. Passenger approach walks upright before sitting. These are procedural transitions, not motion-captured climbs or a complete contact solver.

Retry/next mission deliberately resets all three vehicle positions near the pickup, preserving the last selected vehicle category. Those mission transitions are separate from normal parking persistence. Returning to the welcome screen ends the session and restores the arrival-area vehicles; the next entry starts on the motorcycle.

## Driving and collision model

The bicycle uses a distinct pedal/drag model capped at 9 m/s normally or 12 m/s with Shift, with a lower reverse limit and stronger braking. Its crank and hip/knee pose use the same pedal phase, and wheel rotation follows travelled distance. It cannot carry mission passengers. The motorcycle and taxi share a simple acceleration/drag/braking model, clamped between −5 and +22 m/s normally (Shift permits motorcycle 31 m/s, taxi 29 m/s). The taxi turns more slowly; the motorcycle leans visually. Off-road drag reduces driving speed. Walking eases toward ±1.8 m/s; running toward ±4.7 m/s. Swimming uses 1.8 m/s or 2.5 m/s with Shift. Turning is relative to facing direction.

Buildings, palms, benches, market tables, signposts, medians, barriers and the parked delivery truck enter a static `CollisionGrid` bucketed into 48 m cells. Circle-versus-AABB tests query nearby buckets. The current moving body uses a mode-specific circle for static collision; parked and traffic vehicles use oriented rectangles expanded by that circle. These are deliberately conservative arcade envelopes, not rigid-body physics. Translation is subdivided into steps no larger than 0.24 m, stopping at the last clear candidate; a vehicle impact reflects part of speed. Walking slides along a clear axis and receives no crash penalty.

Pedestrians block the player and avoid their candidate position when it would overlap obstacles, parked/traffic vehicles, the player or the waiting client. Traffic also stops before nearby bodies. This sampled sweep is not an exact rigid-body time-of-impact solver; see [limits](roadmap.md).

## NPCs and animation

52 pedestrians move back and forth incrementally on individual sidewalk segments. A blocked candidate reverses direction. The body uses capsule/sphere geometry, hands, collar and face details, with separate hip and knee hinges and grouped arm/leg limbs, with gait swings driven by actual movement. There are no arbitrary paths through buildings or crossings. This is not a navmesh or crowd simulation.

30 traffic vehicles use five rectangular road loops. Some are delivery trucks with larger collision dimensions. They stop for nearby vehicles/people but do not implement complete traffic rules. Visible NPC and vehicle groups are distance limited. One parked delivery truck and worker provide a scale reference near the arrival area.

## Missions and maps

Mission data lives in the `missions` array. The welcome mission selector starts any defined mission without adding fabricated progress. A mission has `pickup`/`drop` points, a deadline, minimum comfort, reward, character text and a focus label. Pickup requires vehicle mode, distance below 6 m and speed below 1.8 m/s. Deadline starts on pickup. Comfort resets for the passenger; crash and hard-brake cooldowns avoid penalties every frame. A result is emitted once through a mode change; successful totals are written once.

The minimap is a 320×200 canvas displayed as a compact horizontal rectangle. Roads use `ROADS` and `roadWidth`; building shapes use actual static collider footprints. Parks and water provide structure. The player stays below the vertical midpoint to expose more of the road ahead. Heading rotation is damped; player and north symbols are transformed using the same rotation. An off-map objective clamps to the edge. Parked vehicle positions come from their real roots. The full map stays north-up and uses the same sector/landmark data. The dotted line is a direct bearing, not a computed road route.

## Saving and resetting

`kamer-rush-v1` stores `{reputation, earnings, completed, best}`. `readProgress` rejects corrupt or invalid values and returns zero totals. Writes are caught so blocked localStorage does not break driving. Storage is browser/origin-specific; changing localhost ports creates a separate save.

The save does not include current mission time, position, settings or parked vehicle transforms. Reload starts a new session. To reset this project's totals, remove only `kamer-rush-v1` in the browser's storage inspector for the active localhost origin. There is no in-game reset button in this version. Do not clear unrelated browser data.

## Original water, sky and breeze

`environment.ts` adds one subdivided water plane with two analytic sine displacements, distance-based shallow/deep colour, a small shoreline foam term and a view-angle colour adjustment. A procedural gradient sky shares the scene's warm daylight direction. This is an original inexpensive visual shader, not a reflection/refraction render-target simulation or an ocean solver. No external normals, textures or weather data are loaded. Cosmetic environment time continues while overlays freeze the driving simulation.

Palm leaf materials use a small shared-time vertex deformation through `onBeforeCompile`, retaining the existing instanced geometry. The breeze is cosmetic and does not apply forces to vehicles or change collision geometry. The shoreline fence and world bounds remain static and safe regardless of wave phase.

## Articulated characters, UI and audio

`animation.ts` uses analytic two-bone inverse kinematics with fixed upper/lower lengths. Walk/run/swim cycles follow actual travelled speed; hand/foot targets derive from vehicle-local coordinates. Pedals, leg targets and crank share one phase; wheels follow actual travel and stop when blocked. Mounted actors retain world scale 1.

`ui.ts` implements vanilla combobox/listbox controls with active descendant, disabled options, type-ahead, Escape/outside closure and keyboard navigation. Sliders support pointer capture and keyboard increments. Settings/credits freeze simulation and audio, trap focus and restore it on close. Geist is bundled locally under OFL 1.1; Lucide provides icons.

Swim enters beyond X=324 and exits below X=323 (hysteresis). The actor tilts and uses an articulated stroke. R performs a deliberate faded recovery to a clear beach point. No oxygen, drowning, boats or underwater driving are implemented. See [audio contracts](audio.md) for the one-voice playback manager and catalog.
