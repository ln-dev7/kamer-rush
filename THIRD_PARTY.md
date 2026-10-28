# Third-party notices and asset provenance

## Original project content

World geometry, vehicle and character models, canvas storefront signs, map drawing, interface styling and synthesized Web Audio sounds were created in this source. The header loads the project’s own AI-generated logo described below. No third-party stock model, texture, commercial music or city map is loaded. Geist Variable font files are bundled under SIL OFL 1.1. Forty optional local ElevenLabs-generated dialogue files have separate output terms and are excluded from the public Git tree. Names and locations are fictional.

Private user-supplied screenshots were examined as design references. Their bytes are not game assets, public documentation illustrations or part of the distributed build. They belong in ignored `reference/`, never in `public/`, `src/` or a public repository. No reference game's code, HUD, branding, music, character or map is copied.

The original project license remains [undecided](LICENSING.md). That status does not alter the licenses below.

## Browser runtime dependencies

| Package  | Locked version | Use                                          | License and notice                                                                                                                       |
| -------- | -------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Three.js | 0.186.1        | WebGL rendering, geometry and math           | MIT, [full text](licenses/three-LICENSE.txt), [source](https://github.com/mrdoob/three.js)                                               |
| Lucide   | 1.63.0         | Official SVG icons for controls, maps and UI | ISC and retained upstream icon attribution, [full notice](licenses/lucide-LICENSE.txt), [source](https://github.com/lucide-icons/lucide) |

The build bundles selected named Lucide exports; it does not download icons at runtime. The library notice includes the applicable inherited Feather/icon attribution; retain the entire file when redistributing the bundled code. `/scale.html` reuses the same project model constructors and Three.js.

## Development dependencies

Vite (MIT), TypeScript (Apache-2.0), tsx (MIT), Prettier (MIT), @types/three (MIT) and their transitive dependencies are installed from the official npm registry. Exact package versions, license metadata and paths from the installed tree are recorded in [THIRD_PARTY_DEPENDENCIES.json](THIRD_PARTY_DEPENDENCIES.json). The lockfile is the installation source of truth.

`licenses/` preserves license/notice files found in the installed packages. They remain authoritative when package metadata is abbreviated. npm packages installed only for development are not automatically part of the browser bundle, but their licenses still apply to their own distribution. Rebuild the inventory and review notices after dependency changes; do not assume a clean vulnerability audit is a license audit.

## Design references, not bundled dependencies

The [reference review](docs/references.md) separates API/technique inspiration from actual reuse and records unavailable pages and unverified assets. No model, code or texture was imported from those demo repositories. The new bicycle, bevelled car body, articulated character groups, water/sky shaders and palm breeze are original source, built using the already listed Three.js API.

## AI-generated Kamer Rush branding

The logo and promotional banner were generated with an AI image-generation tool in the parent task at the owner's request on 2026-10-28, then supplied through Library and inspected locally. They are not downloaded stock images or imported game assets. Unmodified PNG masters are preserved in `assets/branding/originals/`; hashes, dimensions, export paths and transformations are recorded in `assets/branding/provenance.json`.

Exports use ImageMagick only for non-distorting crop/contain/resampling and format packaging. The logo and transparent icon variants retain alpha; the Apple icon has a cream background. The OG art is explicitly **a promotional illustration, not a gameplay screenshot or a promise of the rendered game's visual fidelity**. No automatic vector tracing was performed. The project's license decision remains pending and no implicit MIT license is granted to these new images.

## Typography and generated dialogue

`@fontsource-variable/geist` 5.3.0: Geist Project Authors, SIL Open Font License 1.1. [Full license](licenses/geist-OFL.txt), also in public/legal/geist.txt. No CDN request.

40 original texts were synthesized through ElevenLabs Eleven v3 under the owner’s Creator subscription. Casting: Ali Alioum, Alimata, Jérôme and Tony, 10 files each. Descriptions identify French/African accents; no native Cameroonian accent certification or endorsement is claimed. [Audio notice](public/audio/AUDIO-NOTICE.md) preserves terms and sources. [Sanitized casting manifest](docs/audio-manifest.json) records IDs, texts, voices, model, bytes, durations and hashes without personal download paths. These recordings are not automatically MIT or freely sublicensable; review applicable terms before public distribution, standalone reuse or relicensing. Music remains absent pending suitable rights.
