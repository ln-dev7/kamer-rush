import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const original = join(root, "assets/branding/originals");
const output = join(root, "public/branding");
mkdirSync(output, { recursive: true });
const logo = join(original, "kamer-rush-logo.png"),
  art = join(original, "kamer-rush-og-art.png");
function magick(args) {
  const p = spawnSync("magick", args, { encoding: "utf8" });
  if (p.error)
    throw new Error(
      "Branding export requires ImageMagick (magick) on PATH. It is optional for running the game.",
    );
  if (p.status !== 0) throw new Error(p.stderr);
  return p.stdout.trim();
}
const bbox = magick([
  logo,
  "-alpha",
  "extract",
  "-threshold",
  "10%",
  "-format",
  "%@",
  "info:",
]);
const variants = [
  ["kamer-rush-logo.png", 1024, 896],
  ["kamer-rush-logo-128.png", 128, 112],
  ["favicon-16.png", 16, 14],
  ["favicon-32.png", 32, 28],
  ["icon-192.png", 192, 168],
  ["icon-512.png", 512, 448],
];
for (const [name, size, inside] of variants)
  magick([
    logo,
    "-crop",
    bbox,
    "+repage",
    "-filter",
    "Lanczos",
    "-resize",
    `${inside}x${inside}`,
    "-background",
    "none",
    "-gravity",
    "center",
    "-extent",
    `${size}x${size}`,
    "-strip",
    "-define",
    "png:color-type=6",
    join(output, name),
  ]);
magick([
  logo,
  "-crop",
  bbox,
  "+repage",
  "-filter",
  "Lanczos",
  "-resize",
  "152x152",
  "-background",
  "#fff3d2",
  "-alpha",
  "remove",
  "-gravity",
  "center",
  "-extent",
  "180x180",
  "-strip",
  join(output, "apple-touch-icon.png"),
]);
magick([
  art,
  "-filter",
  "Lanczos",
  "-resize",
  "1200x630",
  "-background",
  "#063d31",
  "-gravity",
  "center",
  "-extent",
  "1200x630",
  "-alpha",
  "off",
  "-strip",
  join(output, "kamer-rush-og.png"),
]);
magick([
  join(output, "kamer-rush-logo.png"),
  "-define",
  "icon:auto-resize=64,48,32,16",
  join(output, "favicon.ico"),
]);
const sources = ["kamer-rush-logo.png", "kamer-rush-og-art.png"].map(
  (file) => ({
    file: `assets/branding/originals/${file}`,
    sha256: createHash("sha256")
      .update(readFileSync(join(original, file)))
      .digest("hex"),
    properties: magick([
      "identify",
      "-format",
      "%wx%h; %[channels]; opaque=%[opaque]",
      join(original, file),
    ]),
  }),
);
const files = [
  ...variants.map((v) => v[0]),
  "apple-touch-icon.png",
  "kamer-rush-og.png",
  "favicon.ico",
].map((file) => ({
  file: `public/branding/${file}`,
  properties: magick([
    "identify",
    "-format",
    "%wx%h; %[channels]; opaque=%[opaque]",
    join(output, file),
  ]),
}));
writeFileSync(
  join(root, "assets/branding/provenance.json"),
  JSON.stringify(
    {
      generation:
        "AI-generated artwork supplied by the owner through the parent task on 2026-10-28",
      purpose:
        "Original Kamer Rush branding. OG art is a promotional illustration, not a gameplay screenshot.",
      licenseStatus:
        "Original project/branding license not yet selected; no implicit MIT grant.",
      transforms:
        "Source files unchanged. Logo alpha-bounds crop with transparent padding and Lanczos resampling. Apple icon uses cream background. OG uses contain resize plus at most a narrow background pad, never stretching or text cropping. No vector tracing.",
      sources,
      exports: files,
    },
    null,
    2,
  ) + "\n",
);
console.log(`Exported ${files.length} branding files; originals unchanged.`);
