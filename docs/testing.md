# Testing and verification

This records actual local verification, not a claim of device certification. The baseline environment was macOS, Node 20.15.0, npm 10.7.0 and the integrated WebGL browser. No phone hardware, Safari, Firefox or gamepad testing is claimed.

## Automated checks

| Command                | What it does                                               | Result                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`               | Install locked npm dependencies                            | Clean install passed using `npm ci --offline --no-audit` with official packages already cached                                                        |
| `npm run typecheck`    | Strict TypeScript checking                                 | Passed                                                                                                                                                |
| `npm test`             | Node test runner with tsx loader                           | 27 tests passed                                                                                                                                       |
| `npm run build`        | Typecheck + Vite build for game, credits and scale fixture | Passed; Three.js chunk-size advisory remains                                                                                                          |
| `npm run preview`      | Serve production build on loopback                         | Production served from the delivered folder on loopback port 5174; first mission completed again by motorcycle and taxi, zero console errors observed |
| `npm run format:check` | Check project formatting                                   | Run after final formatting                                                                                                                            |

The tests cover stopped/near interaction, acceleration/braking bounds, progress recovery, rating thresholds, six mission-coordinate bounds, static grid edges/corners, oriented vehicle queries, safe exit refusal/fallback, nearest eligible boarding target, world model proportions, collider/model envelopes and boulevard width.

Four additional metadata tests cover absent production domains, rejected local/unsafe canonical URLs, confirmed-base URL planning, and missing-image behavior. These are unit/invariant tests. They do not replace driving a full route or testing WebGL rendering. The mission-coordinate test checks bounds, not a full route planner or absence of every possible obstacle.

## Browser checks performed during implementation

| Flow                                               | Observed result                                                                                       | Coverage limit                                                           |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| First mission by motorcycle                        | Pickup, drive, stop, dropoff and success/reward played repeatedly, including after city expansion     | Later five missions not all played to completion                         |
| First mission by taxi                              | Walk from motorcycle, board taxi, take client, drive, dropoff and real result                         | Full six-mission taxi tour not completed                                 |
| Motorcycle → walking → taxi → walking → motorcycle | Played; parked vehicles retained their positions; walking around taxi was necessary                   | Not every possible parking orientation/space exhausted                   |
| Exit safety                                        | Moving exit refused; held F produced a single transition; clear side/offset queried                   | Fully blocked exit fallback covered by unit test, not every world corner |
| Walking collision                                  | Walking into parked taxi stopped the avatar; it could be bypassed on foot                             | All props/individual NPC encounters not manually exhausted               |
| Failure and retry                                  | Deliberate repeated impacts triggered comfort failure, zero payout and working retry                  | Timeout failure implemented but not waited through a complete deadline   |
| Pause/resume                                       | Timer stayed at 75 s across separate observations, then resumed and mission completed                 | Mobile OS suspension not tested                                          |
| Large map exploration                              | More than 200 m driven into Plateau Mboa; label, camera and local objective updated                   | Entire perimeter and every street not manually traversed                 |
| Save                                               | Earned totals survived a reload                                                                       | Private-mode / quota behavior not induced                                |
| Touch UI event path                                | Held on-screen accelerate and brake with pointer input; stopped at client                             | Physical multitouch not tested                                           |
| Responsive layout                                  | Desktop, 390×844 portrait and 844×390 landscape inspected during development                          | Not a claim of phone performance                                         |
| Scale                                              | Shared constructors measured in tests; orthographic side-by-side fixture inspected at identical depth | Stylized model dimensions, not photographic realism                      |
| Console                                            | No JavaScript error observed in completed game/scale sessions                                         | Not a long-duration stress test                                          |

Final screenshots in `evidence/` show only this project. Private third-party reference screenshots are not included there.

## Reproduce the key manual regression

1. Start a clean localhost session and enter the city. Compare the parked motorcycle, taxi and delivery truck at the arrival area; inspect `/scale.html` for precise proportions.
2. Open and close the whole-city map; confirm north-up sector placement and the nearby vehicle positions.
3. At rest, press F to leave the motorcycle. Try walking into a parked vehicle: collision should prevent crossing it. Walk around it and board the taxi.
4. Accelerate, then try F before stopping: exit must be refused. Brake, exit, return and board. Hold F: it must not oscillate repeatedly between states.
5. Stop at the yellow pickup, take the client and attempt F: the passenger restriction must keep the selected vehicle active.
6. Pause for a few seconds; the mission clock and traffic must remain frozen. Resume, drive to the destination, stop and drop off. Confirm a single reward is added.
7. Retry and repeat using the motorcycle. Then take another mission and deliberately collide enough times to fail. Retry must restore pickup phase and comfort.
8. Explore before taking a client. Cross sectors, turn left/right and check minimap rotation, player heading, north, objective edge clamping and parked vehicle location.
9. Inspect narrow portrait and landscape layouts. Pedals, steering, context actions and map must remain usable without covering one another.
10. Reload. Totals should persist; session positions/time should reset. Inspect the console for errors.

When a change affects scale, first run the dimension tests, then compare the models in the same camera and depth. Do not infer physical dimensions from unrelated perspective screenshots.

## Additional polish regression

Nine additional invariant tests cover sampled movement at boosted speed, wall sliding, cove bounds/hysteresis, sprint/boost speeds, fixed-length IK, mounted human scale, select navigation, 40 voice hashes and single-voice arbitration. All 40 local MP3 URLs returned HTTP 200 audio and decoded with ffprobe (63.06 s). A real browser greeting showed readyState=4, paused=false and advancing media time. This is playback verification, not accent certification or complete listening/transcription review.

The first mission reached a real motorcycle result at 96% comfort. Moto/taxi/bicycle transitions, cycling and braking were exercised. A parked taxi blocked walking and required contournement. A running traversal reached the shore; entry, swim, reverse exit, re-entry and repeated recovery commands worked. Settings arrows/Enter and portrait 390×844 welcome/HUD were inspected; subtitle positioning was corrected to avoid the minimap.

Shore reproduction: choose “Un jardin pour souffler”, explore without a client, follow the eastern shore south to Z≈120, park and walk through the signed opening toward +X. Vehicles must stay out. Swim beyond X=324, return below X=323, then try R. Physical phones and real multitouch remain untested.

Final delivery checks ran again in the delivered checkout: locked clean install, production build, 27 tests and formatting passed. The rebuilt 5174 production origin served all 40 clips with matching hashes; real greeting playback was confirmed. Welcome, settings, credits, portrait 390×844 and landscape 844×390 were inspected, and pointer-held accelerator/brake worked. A final landscape spacing correction was rebuilt and visually verified. No browser error/warning logs were observed in that production session. No physical-phone or accent certification is inferred.

All 28 tests now run in a clean public clone, including metadata and hashes for the 40 included owner-authorized recordings. No private audio fixture or environment flag is required.
