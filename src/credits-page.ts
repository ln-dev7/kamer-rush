import "@fontsource-variable/geist";
import "./credits.css";
import { creditsMarkup } from "./credits";
import type { AudioCatalog } from "./voice-director";
const base = import.meta.env.BASE_URL;
document.body.innerHTML = `<header class="credits-header"><a href="${base}" class="credits-brand"><img src="${base}branding/kamer-rush-logo-128.png" width="44" height="44" alt="">Kamer Rush</a><a class="return-link" href="${base}">Retour à la ville</a></header><main class="credits-document" aria-live="polite"><p>Chargement des crédits…</p></main>`;
fetch(
  base +
    (import.meta.env.VITE_LOCAL_AUDIO === "1"
      ? "audio/catalog.local.json"
      : "audio/catalog.json"),
)
  .then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  })
  .then(
    (c: AudioCatalog) =>
      (document.querySelector("main")!.innerHTML = creditsMarkup(c, base)),
  )
  .catch(
    () =>
      (document.querySelector("main")!.textContent =
        "Le catalogue de crédits est indisponible. Les notices restent présentes dans les sources du projet."),
  );
