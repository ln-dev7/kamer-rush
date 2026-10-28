import { test } from "node:test";
import assert from "node:assert/strict";
import { metadataPlan, normalizeSiteUrl } from "../tooling/metadata.mjs";
const brand = {
  name: "Kamer Rush",
  title: "Kamer Rush",
  description: "Explore the city.",
  locale: "fr_CM",
  imageAlt: "Original game banner",
  assets: {
    og: "branding/kamer-rush-og.png",
    favicon32: "branding/favicon-32.png",
  },
};
test("no production domain means no canonical, public image URL or sitemap", () => {
  const p = metadataPlan({ brand, available: new Set([brand.assets.og]) });
  assert.equal(p.canonical, null);
  assert.equal(p.sitemap, null);
  assert.equal(p.robots, null);
  assert(
    !p.tags.some(
      (t) => t.attrs?.property === "og:image" || t.attrs?.rel === "canonical",
    ),
  );
});
test("local and unsafe URLs cannot become production canonicals", () => {
  for (const value of [
    "http://localhost:5174",
    "https://127.0.0.1/",
    "https://192.168.1.1/",
    "https://user:password@example.test/",
    "https://example.test/?secret=x",
  ])
    assert.throws(() => normalizeSiteUrl(value));
  assert.equal(normalizeSiteUrl("  "), null);
});
test("confirmed base URLs produce absolute social image URLs and a page sitemap", () => {
  const p = metadataPlan({
    siteUrl: "https://example.test/game",
    brand,
    available: new Set([brand.assets.og, brand.assets.favicon32]),
  });
  assert.equal(p.canonical, "https://example.test/game/");
  assert(
    p.tags.some(
      (t) =>
        t.attrs?.property === "og:image" &&
        t.attrs.content ===
          "https://example.test/game/branding/kamer-rush-og.png",
    ),
  );
  assert(p.tags.some((t) => t.attrs?.href === "/game/branding/favicon-32.png"));
  assert(p.sitemap.includes("<loc>https://example.test/game/</loc>"));
  assert(!p.sitemap.includes("branding"));
  assert(p.robots.includes("https://example.test/game/sitemap.xml"));
});
test("missing image files never create broken icon or banner tags", () => {
  const p = metadataPlan({ siteUrl: "https://example.test/", brand });
  assert(
    !p.tags.some(
      (t) => t.attrs?.property === "og:image" || t.attrs?.rel === "icon",
    ),
  );
});
