import { defineConfig, loadEnv } from "vite";
import { normalizeSiteUrl, siteMetadataPlugin } from "./tooling/metadata.mjs";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "SITE_");
  const siteUrl = process.env.SITE_URL || env.SITE_URL;
  const publicUrl = normalizeSiteUrl(siteUrl);
  return {
    base: publicUrl ? new URL(publicUrl).pathname : "/",
    plugins: [siteMetadataPlugin({ root: process.cwd(), siteUrl })],
    build: {
      rollupOptions: {
        input: {
          main: "index.html",
          scale: "scale.html",
          credits: "credits.html",
        },
        output: { manualChunks: { three: ["three"] } },
      },
    },
  };
});
