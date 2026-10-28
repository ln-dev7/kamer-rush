# Branding and sharing metadata

## Existing design system

Deep green `#153E36` (header/background also `#132F2C`), warm yellow `#F5C64B`, cream `#FFF3D2` / `#FFF4D7`, and sage sky `#B9D8D3`. Current text uses system Arial/Helvetica, heavy tightly spaced headings. The brand is urban exploration and missions on foot, bicycle, motorcycle and taxi; it is not motorcycle-only.

The confirmed AI-generated masters have been received and visually inspected: a transparent 1254 × 1254 KR road monogram and an opaque 1730 × 909 promotional illustration. The UI uses a small transparent logo on a cream badge beside the accessible text wordmark. The OG export is 1200 × 630, without stretching or cropping the title. The illustration is promotional art, not a gameplay screenshot.

## Asset contract

Assets belong in `public/branding/`; paths are configured in `branding.config.json`.

| File                      | Format                                                                    | Purpose                           |
| ------------------------- | ------------------------------------------------------------------------- | --------------------------------- |
| `kamer-rush-logo.png`     | 1024 × 1024 transparent PNG export; 1254 px original preserved separately | Logo source and UI brand          |
| `kamer-rush-og.png`       | **1200 × 630 PNG**, opaque background                                     | Open Graph / large social preview |
| `kamer-rush-logo-128.png` | 128 × 128 transparent PNG                                                 | Header badge                      |
| `favicon-16.png`          | 16 × 16 transparent PNG                                                   | Small icon export                 |
| `favicon.ico`             | Multi-size ICO: 16, 32, 48, 64 px                                         | Browser fallback                  |
| `favicon-32.png`          | 32 × 32 PNG, simplified readable mark                                     | Browser favicon                   |
| `icon-192.png`            | 192 × 192 PNG                                                             | Larger browser/device icon        |
| `icon-512.png`            | 512 × 512 PNG                                                             | Large icon variant                |
| `apple-touch-icon.png`    | 180 × 180 PNG                                                             | Apple touch icon                  |

Keep the important symbol and title inside generous safe margins. A logo with small lettering is not automatically a good 32 px icon. Small variants must be inspected at actual size. Unmodified originals are in `assets/branding/originals/`; `assets/branding/provenance.json` records hashes and transformations. Do not change the project's undecided source license by adding branding assets.

## Local use versus confirmed production domain

Local play needs no configuration. `SITE_URL` is intentionally blank in `.env.example`. The Vite metadata plugin injects accurate OG/Twitter text immediately. Favicon tags appear only for files that actually exist. It validates the OG PNG's dimensions when the file is present.

Until a public domain is confirmed, the build emits **no canonical, og:url, absolute social-image URL, sitemap.xml or robots.txt**. It never uses localhost as a public canonical or guesses a production domain. The banner is served locally at `/branding/kamer-rush-og.png`; the public sharing URL is activated only by a configured domain.

After the owner confirms the exact public HTTPS base URL, copy `.env.example` to `.env` and set `SITE_URL` to that approved URL, including any deployment subpath. Then run `npm run build`. This config does not create hosting, register a domain or deploy anything. Do not commit `.env`.

`tooling/metadata.mjs` then adds absolute canonical and OG image URLs, Twitter metadata, a one-page `sitemap.xml` and `robots.txt`. The diagnostic `scale.html` is excluded from the sitemap and disallowed for indexing. A sitemap lists public pages; the OG banner is **not** a sitemap image or replacement.

For a local production preview, continue using the URL printed by `npm run preview`. The public URL in metadata describes the confirmed intended deployment, not the local preview server.

## Validation

Run `npm test` for metadata planning invariants and `npm run build` for real asset/dimension checks. Inspect `dist/index.html`, `dist/sitemap.xml` and `dist/robots.txt` when `SITE_URL` is configured. Without it, the last two files should not exist. The tests use the reserved `example.test` domain as fixtures only, never as a project production domain.

## Recreate the exports

The checked-in exports are ready for normal installation and need no image tools. To regenerate them from the preserved masters, install ImageMagick separately if needed, then run `npm run brand:export`. This optional command requires `magick` on PATH; ImageMagick is not bundled or required to play. It never modifies the original files. Logo variants use the alpha bounds plus safe transparent padding. The OG image uses contain scaling and a minimal matching background pad to reach exactly 1200 × 630. The export script does not make a vector logo or invent a new brand design.
