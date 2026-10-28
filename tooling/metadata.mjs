import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** A confirmed public HTTPS base URL is optional; local URLs are never canonical. */
export function normalizeSiteUrl(value) {
  if (!value?.trim()) return null;
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("SITE_URL must be an absolute public HTTPS URL.");
  }
  const host = url.hostname.toLowerCase();
  const privateHost =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "[::1]" ||
    host === "0.0.0.0" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (
    url.protocol !== "https:" ||
    privateHost ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error(
      "SITE_URL must be a public HTTPS base URL without credentials, query or fragment; localhost/private hosts are not production canonicals.",
    );
  url.pathname = url.pathname.replace(/\/+$/, "") + "/";
  return url.href;
}
const xml = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Pure plan, testable without a domain, filesystem writes, or network requests. */
export function metadataPlan({ siteUrl, brand, available = new Set() }) {
  const canonical = normalizeSiteUrl(siteUrl);
  const base = canonical ? new URL(canonical).pathname : "/";
  const tag = (property, content) => ({
    tag: "meta",
    attrs: { property, content },
    injectTo: "head",
  });
  const named = (name, content) => ({
    tag: "meta",
    attrs: { name, content },
    injectTo: "head",
  });
  const banner = available.has(brand.assets.og);
  const tags = [
    tag("og:type", "website"),
    tag("og:site_name", brand.name),
    tag("og:title", brand.title),
    tag("og:description", brand.description),
    tag("og:locale", brand.locale),
    named("twitter:title", brand.title),
    named("twitter:description", brand.description),
    named(
      "twitter:card",
      canonical && banner ? "summary_large_image" : "summary",
    ),
  ];
  for (const [key, size, rel] of [
    ["favicon32", "32x32", "icon"],
    ["icon192", "192x192", "icon"],
    ["icon512", "512x512", "icon"],
    ["apple180", "180x180", "apple-touch-icon"],
  ]) {
    const file = brand.assets[key];
    if (available.has(file))
      tags.push({
        tag: "link",
        attrs: { rel, type: "image/png", sizes: size, href: base + file },
        injectTo: "head",
      });
  }
  if (brand.assets.faviconIco && available.has(brand.assets.faviconIco))
    tags.push({
      tag: "link",
      attrs: {
        rel: "icon",
        type: "image/x-icon",
        href: base + brand.assets.faviconIco,
      },
      injectTo: "head",
    });
  if (canonical) {
    tags.push(
      {
        tag: "link",
        attrs: { rel: "canonical", href: canonical },
        injectTo: "head",
      },
      tag("og:url", canonical),
    );
    if (banner) {
      const url = new URL(brand.assets.og, canonical).href;
      tags.push(
        tag("og:image", url),
        tag("og:image:width", "1200"),
        tag("og:image:height", "630"),
        tag("og:image:type", "image/png"),
        tag("og:image:alt", brand.imageAlt),
        named("twitter:image", url),
        named("twitter:image:alt", brand.imageAlt),
      );
    }
  }
  return {
    canonical,
    base,
    tags,
    sitemap: canonical
      ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${xml(canonical)}</loc></url></urlset>\n`
      : null,
    robots: canonical
      ? `User-agent: *\nAllow: ${base}\nDisallow: ${base}scale.html\nSitemap: ${new URL("sitemap.xml", canonical).href}\n`
      : null,
  };
}

export function siteMetadataPlugin({ root, siteUrl }) {
  const brand = JSON.parse(
    readFileSync(join(root, "branding.config.json"), "utf8"),
  );
  function plan() {
    const available = new Set(
      Object.values(brand.assets).filter((file) =>
        existsSync(join(root, "public", file)),
      ),
    );
    if (available.has(brand.assets.og)) {
      const png = readFileSync(join(root, "public", brand.assets.og));
      if (
        png.length < 24 ||
        png.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
        png.readUInt32BE(16) !== 1200 ||
        png.readUInt32BE(20) !== 630
      )
        throw new Error("The OG banner must be a valid 1200 × 630 PNG.");
    }
    return metadataPlan({ siteUrl, brand, available });
  }
  return {
    name: "kamer-rush-site-metadata",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        if (ctx.filename?.endsWith("scale.html")) return [];
        const p = plan();
        if (!ctx.filename?.endsWith("credits.html")) return p.tags;
        return p.tags.map((t) => {
          if (t.attrs?.rel === "canonical")
            return {
              ...t,
              attrs: {
                ...t.attrs,
                href: new URL("credits.html", p.canonical).href,
              },
            };
          if (t.attrs?.property === "og:url")
            return {
              ...t,
              attrs: {
                ...t.attrs,
                content: new URL("credits.html", p.canonical).href,
              },
            };
          if (
            t.attrs?.property === "og:title" ||
            t.attrs?.name === "twitter:title"
          )
            return {
              ...t,
              attrs: { ...t.attrs, content: "Kamer Rush · Crédits" },
            };
          return t;
        });
      },
    },
    generateBundle() {
      const p = plan();
      if (p.sitemap) {
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: p.sitemap.replace(
            "</urlset>",
            `<url><loc>${xml(new URL("credits.html", p.canonical).href)}</loc></url></urlset>`,
          ),
        });
        this.emitFile({
          type: "asset",
          fileName: "robots.txt",
          source: p.robots,
        });
      }
    },
  };
}
