import * as T from "three";
import "@fontsource-variable/geist";
import "./style.css";
import { CustomSelect, CustomSlider, bindSwitch } from "./ui";
import { AudioManager } from "./audio";
import { creditsMarkup } from "./credits";
import {
  animateActor,
  animateSeating,
  poseVehicleRider,
  restPose,
} from "./animation";
import {
  SHORE,
  coastalBlocked,
  groundHeight,
  nextWaterState,
  moveSwept,
  footTargetSpeed,
  smoothTransition,
} from "./locomotion";
import {
  buildWorld,
  motorcycle,
  car,
  marker,
  person,
  animatePerson,
  truck,
  bicycle,
  animateBicycle,
  animateCar,
} from "./world";
import {
  missions,
  drive,
  clamp,
  distance,
  canInteract,
  grade,
  readProgress,
  cycleDrive,
} from "./logic";
import {
  createElement,
  Motorbike,
  Bike,
  CarTaxiFront,
  Footprints,
  Navigation2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  MapPin,
  Map as MapIcon,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  LogOut,
  LogIn,
  X,
  Star,
  Compass,
  OctagonPause,
  Settings2,
  Zap,
  Waves,
  Info,
} from "lucide";
import { ROADS, EXTENT, districtAt, landmarks, districts } from "./map";
import { createEnvironment, environmentTime } from "./environment";
import { dimensions, roadWidth } from "./dimensions";
import {
  CollisionGrid,
  insideVehicle,
  safeExit,
  nearestVehicle,
} from "./collision";
const iconNodes = {
  Motorbike,
  Bike,
  CarTaxiFront,
  Footprints,
  Navigation2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  MapPin,
  MapIcon,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  LogOut,
  LogIn,
  X,
  Star,
  Compass,
  OctagonPause,
  Settings2,
  Zap,
  Waves,
  Info,
};
const iconCache = new globalThis.Map<string, string>();
function icon(name: keyof typeof iconNodes) {
  if (iconCache.has(name)) return iconCache.get(name)!;
  const markup = createElement(iconNodes[name], {
    width: 20,
    height: 20,
    "aria-hidden": "true",
    focusable: "false",
  }).outerHTML;
  iconCache.set(name, markup);
  return markup;
}
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<canvas id="world" aria-label="Kamer Rush, jeu de conduite en 3D"></canvas>
<div class="vignette"></div>
<header><a class="wordmark" href="#" aria-label="Kamer Rush accueil"><img class="brand-mark" src="${import.meta.env.BASE_URL}branding/kamer-rush-logo-128.png" width="48" height="48" alt="" /><span class="wordmark-type">KAMER<span>RUSH</span></span></a><div class="district"><span class="live"></span><span id="district-name">BONAMÉ</span> <small>DOUALA IMAGINÉE</small></div><div class="top-actions"><button id="settings" aria-label="Ouvrir les réglages">${icon("Settings2")}</button><button id="sound" title="Activer le son" aria-label="Activer le son">${icon("VolumeX")}</button><button id="open-map" class="hidden" aria-label="Ouvrir la carte (M)">${icon("MapIcon")}</button><button id="pause" class="hidden" aria-label="Pause" title="Pause (P / Échap)">${icon("Pause")}</button></div></header>
<section id="hud" class="hidden"><div class="mission-card"><div class="eyebrow" id="phase-label">PRENDRE UN CLIENT</div><h2 id="objective"></h2><p id="mission-detail"></p><div class="mission-bottom"><span id="focus"></span><strong id="timer">—</strong></div><div class="comfort"><span>CONFORT</span><div><i id="comfort-bar"></i></div><b id="comfort-value">100%</b></div></div><div class="nav"><canvas id="map" width="320" height="200" aria-label="Minicarte locale, îlots, routes, véhicules et objectif"></canvas><div><span id="distance">0 m</span><small id="bearing">POINT DE RENDEZ-VOUS</small></div></div><div id="transport-status">${icon("Motorbike")}<span>BEN SKIN</span></div><button id="vehicle-action" class="hidden">${icon("LogOut")}<span>Garer et descendre</span><kbd>F</kbd></button><div class="speed"><strong id="speed">0</strong><span>KM/H</span><i id="speed-bar"></i></div><div class="bottom-caption"><b>KAMER RUSH</b><span>Les routes ont du cœur.</span></div><div class="control-hint">ZQSD / WASD <span>se déplacer</span> · ESPACE <span>freiner</span> · E <span>client</span> · F <span>véhicule</span> · M <span>carte</span></div></section>
<div id="prompt" class="hidden"><kbd>E</kbd><span>Prendre le passager</span><button id="interact">MONTER ${icon("LogIn")}</button></div><div id="toast" role="status"></div>
<section id="welcome" class="overlay welcome"><div class="welcome-content"><div class="edition"><span>01</span> LA VILLE S’ÉVEILLE</div><h1>La ville<br><em>t’appartient.</em></h1><p>Explore les rues, prends le guidon ou le volant<br>et construis ta réputation au fil des missions.</p><button id="start" class="primary">ENTRER DANS LA VILLE <span>${icon("ArrowUpRight")}</span></button><div class="mission-selector" id="mission-select"></div><div class="welcome-meta"><span>6 MISSIONS · 5 SECTEURS</span><span>SOLO · PROTOTYPE</span></div><p id="saved" class="saved"></p></div><div class="welcome-label"><span class="label-line"></span><b>DES ROUTES À EXPLORER</b><small>Rapide. Attentionné. Toujours là.</small></div><div class="welcome-footer"><span>UNE VILLE FICTIVE INSPIRÉE DE DOUALA, CAMEROUN</span><div class="footer-links"><button id="open-credits">${icon("Info")} CRÉDITS</button><button id="quality">${icon("Settings2")} RÉGLAGES</button></div></div></section>
<section id="pause-panel" class="overlay modal hidden"><div class="panel"><div class="eyebrow">ON SOUFFLE UN PEU</div><h2>Petite pause.</h2><p>La route sera toujours là.</p><button id="resume" class="primary">REPRENDRE ${icon("Play")}</button><button id="restart" class="secondary">Recommencer la course</button><button id="pause-settings" class="secondary">${icon("Settings2")} Réglages</button><button id="home" class="text-btn">Retour à l’accueil</button><div class="keys">Avancer : Z / W / flèche haut<br>Tourner : Q D / A D / flèches gauche droite<br>Reculer : S / flèche bas · Freiner : Espace<br>Maj : courir / accélérer · H : klaxon<br>Client : E · Véhicule : F · Carte : M<br>R : retour plage pendant la nage<br>Pause : P / Échap · Recentrer : C</div></div></section>
<section id="result" class="overlay modal hidden"><div class="panel"><div id="result-eyebrow" class="eyebrow"></div><h2 id="result-title"></h2><div id="stars"></div><p id="result-copy"></p><div id="receipt"></div><button id="next" class="primary">COURSE SUIVANTE ${icon("ArrowUpRight")}</button><button id="retry" class="secondary">Rejouer cette course</button><button id="result-home" class="text-btn">Retour à l’accueil</button></div></section>
<div id="touch" class="hidden"><div class="steering"><button data-key="left" aria-label="Tourner à gauche">${icon("ArrowLeft")}</button><button data-key="right" aria-label="Tourner à droite">${icon("ArrowRight")}</button></div><div class="pedals"><button data-key="boost" class="boost" aria-label="Courir ou accélérer">${icon("Zap")}</button><button data-key="reverse" aria-label="Reculer">${icon("ArrowDown")}</button><button data-key="brake" aria-label="Freiner">${icon("OctagonPause")}</button><button data-key="up" class="gas" aria-label="Accélérer">${icon("ArrowUp")}</button></div><button id="touch-horn" aria-label="Klaxon">${icon("Volume2")}</button></div>
<section id="map-panel" class="overlay modal hidden"><div class="map-sheet"><div class="map-heading"><div><div class="eyebrow">KAMER RUSH · TERRITOIRE FICTIF</div><h2>Chaque route, une rencontre.</h2></div><button id="close-map" aria-label="Fermer la carte">${icon("X")}</button></div><canvas id="full-map" width="1100" height="900" aria-label="Carte complète des cinq secteurs et des six repères"></canvas><div class="map-legend"><span>${icon("Navigation2")} Ta position</span><span>${icon("MapPin")} Objectif</span><span>${icon("Motorbike")} Moto garée</span><span>${icon("CarTaxiFront")} Taxi garé</span><span>${icon("Bike")} Vélo garé</span></div><p>Déplace-toi librement avant la prise d’un client. F pour quitter ou rejoindre un véhicule à l’arrêt. Les points colorés sont les repères du quartier.</p></div></section><section id="settings-panel" class="overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="settings-sheet"><div class="sheet-heading"><div><span class="ui-eyebrow">RÉGLAGES</span><h2 id="settings-title">À ta manière.</h2></div><button id="close-settings" class="icon-button" aria-label="Fermer les réglages">${icon("X")}</button></div><div class="settings-grid"><section class="settings-card"><div class="settings-section-title">${icon("Volume2")}<h3>Le son du quartier</h3></div><div class="ui-switch-row"><div><b>Activer le son</b><small>Moteur, effets et fichiers autorisés.</small></div><button id="audio-enabled" aria-label="Activer le son"></button></div><div id="master-slider"></div><div id="effects-slider"></div><div id="voice-slider"></div><div id="music-slider"></div><div class="ui-switch-row"><div><b>Sous-titres des répliques</b><small>Textes originaux, désactivables.</small></div><button id="subtitles-enabled" aria-label="Sous-titres des répliques"></button></div></section><section class="settings-card"><div class="settings-section-title">${icon("Settings2")}<h3>Confort de jeu</h3></div><div id="quality-select"></div><p class="ui-note">Auto peut alléger la résolution et les ombres pour préserver la conduite.</p><div id="track-select"></div><p id="music-status" class="ui-note"></p><p id="voice-status" class="ui-note"></p><button id="settings-credits" class="secondary">${icon("Info")} Voir les crédits et licences</button></section></div><p class="settings-footnote">Maj / bouton éclair : courir, pédaler fort ou accélérer. Les dialogues ne superposent jamais plusieurs voix.</p></div></section><section id="credits-panel" class="overlay modal hidden" role="dialog" aria-modal="true" aria-label="Crédits de Kamer Rush"><div class="credits-sheet"><div class="sheet-heading"><a href="${import.meta.env.BASE_URL}credits.html" target="_blank" rel="noopener noreferrer">Ouvrir la page complète</a><button id="close-credits" class="icon-button" aria-label="Fermer les crédits">${icon("X")}</button></div><div id="credits-content"></div></div></section><div id="transition-status" class="hidden" role="status"><span></span><div><i></i></div></div><button id="recover-swim" class="hidden">${icon("Waves")} Revenir à la plage <kbd>R</kbd></button><div id="dialogue-caption" class="hidden" role="status" aria-live="polite"><small></small><p></p></div><div id="recovery-fade"></div><div id="error" class="hidden" role="alert"></div>`;
const $ = (id: string) => document.getElementById(id)!;
function setHtml(id: string, value: string) {
  if ($(id).innerHTML !== value) $(id).innerHTML = value;
}
const show = (id: string, visible: boolean) =>
  $(id).classList.toggle("hidden", !visible);
let progress = readProgress(localStorageSafe());
function localStorageSafe() {
  try {
    return localStorage.getItem("kamer-rush-v1");
  } catch {
    return null;
  }
}
function save() {
  try {
    localStorage.setItem("kamer-rush-v1", JSON.stringify(progress));
  } catch {
    toast("Sauvegarde indisponible dans ce navigateur.");
  }
}
function savedLabel() {
  $("saved").textContent = progress.completed
    ? `${progress.completed} course${progress.completed > 1 ? "s" : ""} livrée${progress.completed > 1 ? "s" : ""} · ${progress.reputation} points de réputation · ${progress.earnings.toLocaleString("fr")} F gagnés`
    : "";
}
savedLabel();
const scene = new T.Scene();
scene.background = new T.Color("#b9d8d3");
scene.fog = new T.Fog("#bfd6cc", 160, 430);
let renderer: T.WebGLRenderer;
try {
  renderer = new T.WebGLRenderer({
    canvas: $("world") as HTMLCanvasElement,
    antialias: true,
    powerPreference: "high-performance",
  });
} catch {
  show("error", true);
  $("error").textContent =
    "Le rendu 3D nécessite WebGL. Essaie un navigateur récent avec l’accélération graphique activée.";
  throw new Error("WebGL unavailable");
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFShadowMap;
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
scene.add(new T.HemisphereLight("#dfefe3", "#a77a54", 2.3));
const sun = new T.DirectionalLight("#fff1ce", 3.5);
sun.position.set(-35, 65, 35);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
Object.assign(sun.shadow.camera, {
  left: -65,
  right: 65,
  top: 65,
  bottom: -65,
  near: 1,
  far: 150,
});
sun.shadow.normalBias = 0.04;
sun.shadow.bias = -0.00015;
scene.add(sun);
const solids = buildWorld(scene),
  collisionGrid = new CollisionGrid(solids);
const environment = createEnvironment(scene);
const bike = motorcycle();
scene.add(bike.group);
const cycle = bicycle();
cycle.group.position.set(-6.9, 0.12, 35);
cycle.group.rotation.y = Math.PI;
scene.add(cycle.group);
let pedalPhase = 0;
const taxi = car("#e8b63c");
taxi.position.set(-3, 0.04, 35);
scene.add(taxi);
const avatar = person("#df754c", false, "#75482f", true);
avatar.visible = false;
scene.add(avatar);
const taxiDriver = person("#df754c", true, "#75482f", true);
taxiDriver.scale.setScalar(1);
taxiDriver.position.set(-0.4, -0.12, 0.3);
taxi.add(taxiDriver);
taxiDriver.visible = false;
const taxiPassenger = person("#6a9c91", true);
taxiPassenger.scale.setScalar(1);
taxiPassenger.position.set(0.4, -0.12, 0.3);
taxi.add(taxiPassenger);
taxiPassenger.visible = false;
type Transport = "moto" | "taxi" | "bicycle" | "walk";
let transport: Transport = "moto",
  lastTransport: Exclude<Transport, "walk"> = "moto",
  transitionUntil = 0;
function body() {
  return transport === "moto"
    ? bike.group
    : transport === "taxi"
      ? taxi
      : transport === "bicycle"
        ? cycle.group
        : avatar;
}
function bodyRadius() {
  return transport === "walk"
    ? dimensions.person.radius
    : dimensions[transport].radius;
}
const targetMarker = marker();
scene.add(targetMarker);
const customer = person("#6a9c91");
scene.add(customer);
const traffic = Array.from({ length: 30 }, (_, i) => {
  const isTruck = i % 10 === 0,
    mesh = isTruck ? truck() : car(i % 4 === 0 ? "#b67f65" : "#e5b53d");
  scene.add(mesh);
  const center = [
    { x: 0, z: 0 },
    { x: -192, z: 0 },
    { x: 192, z: 0 },
    { x: 0, z: 192 },
    { x: 0, z: -192 },
  ][Math.floor(i / 6)];
  return {
    mesh,
    size: isTruck ? dimensions.truck : dimensions.taxi,
    isTruck,
    t: ((i % 6) / 6) * 384,
    speed: 4.2 + (i % 3) * 0.6,
    lane: i % 2 ? 2.8 : -2.8,
    reverse: i % 2 === 0,
    center,
  };
});
const npcs = Array.from({ length: 52 }, (_, i) => {
  const ix = i % 12,
    iz = Math.floor(i / 12) * 2 + 1;
  const x = ROADS[ix] + roadWidth(ROADS[ix]) / 2 + 2.4,
    z = ROADS[iz] + 24;
  const g = person(
    ["#cf8c46", "#4e8b88", "#ddcda1", "#b65e50"][i % 4],
    false,
    ["#73472f", "#5e3a2c", "#966443"][i % 3],
  );
  g.position.set(x, 0.16, z);
  scene.add(g);
  return { group: g, x, z, phase: i * 0.8, direction: i % 2 ? 1 : -1 };
});
const camera = new T.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 470);
const desired = new T.Vector3(),
  look = new T.Vector3();
camera.position.set(-3, 5.3, 45);
type Mode =
  "welcome" | "playing" | "paused" | "result" | "map" | "settings" | "credits";
let mode: Mode = "welcome",
  missionIndex = 0,
  phase: "pickup" | "drop" = "pickup",
  speed = 0,
  angle = Math.PI,
  comfort = 100,
  timeLeft = 75,
  elapsed = 0,
  collisionCooldown = 0,
  hardBrakeCooldown = 0,
  toastTime = 0,
  missionSuccess = false,
  engineEnabled = false;
let swimming = false,
  sprinting = false,
  overlayReturn: Mode = "welcome",
  creditsReturn: Mode = "welcome";
type VehicleMode = Exclude<Transport, "walk">;
type ActorTransition = {
  kind: "enter" | "exit" | "pickup" | "dropoff" | "recover";
  actor: T.Group;
  vehicle: VehicleMode;
  from: T.Vector3;
  to: T.Vector3;
  fromScale: T.Vector3;
  toScale: T.Vector3;
  elapsed: number;
  duration: number;
  via?: T.Vector3;
  walkFraction?: number;
  done: () => void;
};
let actorTransition: ActorTransition | null = null;
const keys = new Set<string>();
let quality: "auto" | "low" | "high" = "auto";
const audio = new AudioManager(import.meta.env.BASE_URL);
const missionSelect = new CustomSelect(
  $("mission-select"),
  "Choisir une mission",
  missions.map((m, i) => ({
    value: String(i),
    label: m.name,
    description: `${m.focus} · ${m.destination}`,
  })),
  "0",
);
const qualitySelect = new CustomSelect(
  $("quality-select"),
  "Qualité graphique",
  [
    {
      value: "auto",
      label: "Adaptative",
      description: "Le meilleur équilibre pour cet appareil.",
    },
    {
      value: "low",
      label: "Légère",
      description: "Résolution réduite, ombres désactivées.",
    },
    {
      value: "high",
      label: "Haute",
      description: "Ombres et résolution plus détaillées.",
    },
  ],
  "auto",
);
const trackSelect = new CustomSelect(
  $("track-select"),
  "Musique",
  [{ value: "none", label: "Aucune piste autorisée" }],
  "none",
);
trackSelect.setDisabled(true);
const soundSwitch = bindSwitch(
  $("audio-enabled") as HTMLButtonElement,
  false,
  (v) => void audio.setEnabled(v),
);
bindSwitch($("subtitles-enabled") as HTMLButtonElement, true, (v) => {
  audio.subtitles = v;
});
for (const [id, label, key] of [
  ["master-slider", "Volume général", "master"],
  ["effects-slider", "Moteur et effets", "effects"],
  ["voice-slider", "Voix", "voiceVolume"],
  ["music-slider", "Musique", "musicVolume"],
] as const) {
  const slider = new CustomSlider($(id), label, audio[key]);
  slider.onChange = (v) => (audio[key] = v);
}
audio.onStatus = () => {
  engineEnabled = audio.enabled;
  soundSwitch.set(audio.enabled);
  $("sound").innerHTML = icon(audio.enabled ? "Volume2" : "VolumeX");
  $("sound").setAttribute(
    "aria-label",
    audio.enabled ? "Couper le son" : "Activer le son",
  );
  $("music-status").textContent = audio.approvedTracks.length
    ? "Fichiers locaux autorisés, licences détaillées dans les crédits."
    : "Musiques camerounaises en attente de droits : aucune piste embarquée.";
  const delivered = audio.catalog.lines.filter(
    (l) => !!l.file && l.license.status === "approved",
  ).length;
  $("voice-status").textContent = delivered
    ? `${delivered} fichiers vocaux locaux autorisés.`
    : "Sous-titres disponibles ; enregistrements locaux facultatifs non installés.";
  if (audio.approvedTracks.length) {
    trackSelect.setOptions(
      audio.approvedTracks.map((t) => ({
        value: t.id,
        label: t.title,
        description: t.artist,
      })),
    );
    trackSelect.setDisabled(false);
  }
};
trackSelect.onChange = (id) => audio.chooseTrack(id);
audio.onSubtitle = (text, available) => {
  $("dialogue-caption").querySelector("p")!.textContent = text || "";
  $("dialogue-caption").querySelector("small")!.textContent = available
    ? "LE QUARTIER"
    : "RÉPLIQUE TEXTUELLE · AUDIO EN PRÉPARATION";
};
qualitySelect.onChange = (value) => {
  quality = value as typeof quality;
  applyQuality();
};
function toast(message: string) {
  $("toast").textContent = message;
  $("toast").classList.add("visible");
  toastTime = 3.5;
}
function beep(frequency = 600, duration = 0.12) {
  audio.beep(frequency, duration);
}
$("sound").onclick = () => void audio.setEnabled(!audio.enabled);
let settingsOpener: HTMLElement | null = null,
  creditsOpener: HTMLElement | null = null;
function openSettings() {
  settingsOpener = document.activeElement as HTMLElement;
  if (mode === "settings") return;
  overlayReturn = mode;
  setMode("settings");
  $("close-settings").focus();
}
function closeSettings() {
  setMode(overlayReturn);
  settingsOpener?.focus();
}
function openCredits() {
  creditsOpener = document.activeElement as HTMLElement;
  creditsReturn = mode;
  $("credits-content").innerHTML = creditsMarkup(
    audio.catalog,
    import.meta.env.BASE_URL,
  );
  setMode("credits");
  $("close-credits").focus();
}
$("settings").onclick = openSettings;
$("quality").onclick = openSettings;
$("pause-settings").onclick = openSettings;
$("close-settings").onclick = closeSettings;
$("open-credits").onclick = openCredits;
$("settings-credits").onclick = openCredits;
$("close-credits").onclick = () => {
  setMode(creditsReturn);
  creditsOpener?.focus();
};
function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.fov = innerWidth < 600 ? 57 : 48;
  camera.updateProjectionMatrix();
}
resize();
addEventListener("resize", resize);
function applyQuality() {
  renderer.setPixelRatio(
    quality === "low"
      ? 1
      : Math.min(devicePixelRatio, quality === "high" ? 2 : 1.6),
  );
  renderer.shadowMap.enabled = quality !== "low";
  resize();
}
function resetMission(index: number) {
  missionIndex = index % missions.length;
  const m = missions[missionIndex];
  actorTransition = null;
  show("transition-status", false);
  for (const door of taxi.userData.doors || []) door.rotation.y = 0;
  swimming = false;
  sprinting = false;
  avatar.scale.setScalar(1);
  avatar.rotation.x = 0;
  audio.stopDialogue();
  phase = "pickup";
  comfort = 100;
  timeLeft = m.limit;
  speed = 0;
  angle = Math.PI;
  elapsed = 0;
  collisionCooldown = 0;
  hardBrakeCooldown = 0;
  const road = Math.round(m.pickup.x / 48) * 48;
  bike.group.position.set(road + 3, 0.14, m.pickup.z + 10);
  bike.group.rotation.y = Math.PI;
  taxi.position.set(road - 3, 0.04, m.pickup.z + 10);
  taxi.rotation.y = Math.PI;
  cycle.group.position.set(road - 6.9, 0.12, m.pickup.z + 10);
  cycle.group.rotation.y = Math.PI;
  transport = lastTransport;
  avatar.visible = false;
  bike.rider.visible = transport === "moto";
  cycle.rider.visible = transport === "bicycle";
  taxiDriver.visible = transport === "taxi";
  bike.passenger.visible = false;
  taxiPassenger.visible = false;
  customer.position.set(road + roadWidth(road) / 2 + 2.4, 0.12, m.pickup.z);
  customer.visible = true;
  targetMarker.visible = true;
  setMode("playing");
  updateObjective();
  recenter();
  updateTransport();
  audio.trigger("greeting");
  toast(m.tip + " · F : descendre / monter. M : carte.");
}
function setMode(next: typeof mode) {
  mode = next;
  keys.clear();
  document
    .querySelectorAll(".pressed")
    .forEach((b) => b.classList.remove("pressed"));
  show("pause", mode !== "welcome");
  show("open-map", mode !== "welcome");
  show("map-panel", mode === "map");
  show("welcome", mode === "welcome");
  show("hud", mode !== "welcome");
  show("pause-panel", mode === "paused");
  show("result", mode === "result");
  show("touch", mode === "playing");
  show("vehicle-action", false);
  if (mode !== "playing") show("prompt", false);
  $("pause").setAttribute(
    "aria-label",
    mode === "paused" ? "Reprendre" : "Pause",
  );
  show("settings-panel", mode === "settings");
  show("credits-panel", mode === "credits");
  show(
    "recover-swim",
    mode === "playing" && transport === "walk" && swimming && !actorTransition,
  );
  missionSelect.close(false);
  qualitySelect.close(false);
  trackSelect.close(false);
  audio.setPaused(["paused", "map", "settings", "credits"].includes(mode));
  if (mode === "paused") $("resume").focus();
  if (mode === "map") $("close-map").focus();
  if (mode === "result") $("next").focus();
}
function updateObjective() {
  const m = missions[missionIndex],
    target = phase === "pickup" ? m.pickup : m.drop;
  targetMarker.position.set(target.x, 0, target.z);
  $("phase-label").textContent =
    phase === "pickup"
      ? "01 / PRENDRE UN CLIENT"
      : "02 / ACCOMPAGNER LE CLIENT";
  $("objective").textContent =
    phase === "pickup" ? `${m.person} t’attend` : m.destination;
  $("mission-detail").textContent = phase === "pickup" ? m.role : m.line;
  $("focus").textContent = m.focus;
}
function finish(success: boolean, reason = "") {
  speed = 0;
  $("speed").textContent = "0";
  $("comfort-value").textContent = `${Math.round(comfort)}%`;
  $("comfort-bar").style.width = `${comfort}%`;
  missionSuccess = success;
  setMode("result");
  const m = missions[missionIndex],
    rating = success ? grade(comfort, timeLeft) : 0,
    earned = success ? Math.round(m.reward * (0.6 + comfort * 0.004)) : 0;
  if (success) {
    progress.completed++;
    progress.reputation += rating;
    progress.earnings += earned;
    progress.best = Math.max(progress.best, rating);
    save();
  }
  savedLabel();
  $("result-eyebrow").textContent = success
    ? "LA CONFIANCE, ÇA SE GAGNE"
    : "ON APPREND À CHAQUE VIRAGE";
  $("result-title").textContent = success ? "Bien arrivé !" : "On réessaie ?";
  $("stars").innerHTML = success
    ? Array.from(
        { length: 3 },
        (_, i) =>
          `<span class="${i < rating ? "earned" : ""}">${icon("Star")}</span>`,
      ).join("")
    : icon("RotateCcw");
  $("result-copy").textContent = success
    ? `${m.person} est à destination. ${rating === 3 ? "« Une conduite au top. Merci, chef ! »" : "« Merci pour le trajet ! »"}`
    : reason;
  $("receipt").innerHTML =
    `<div><span>Confort à l’arrivée</span><b>${Math.round(comfort)} %</b></div><div><span>Temps ${success ? "restant" : "écoulé"}</span><b>${success ? Math.ceil(timeLeft) : Math.round(elapsed)} s</b></div><div><span>Gain de cette course</span><b>${earned.toLocaleString("fr")} F</b></div><div><span>Réputation totale</span><b>${progress.reputation} pts</b></div>`;
  $("next").innerHTML =
    (success
      ? missionIndex === missions.length - 1
        ? "REPARTIR EN TOURNÉE"
        : "COURSE SUIVANTE"
      : "RÉESSAYER") + icon("ArrowUpRight");
  beep(success ? 880 : 180, 0.3);
}
function interact() {
  if (mode !== "playing" || actorTransition) return;
  if (transport === "walk" || transport === "bicycle") {
    toast("Utilise la moto ou le taxi pour transporter un client.");
    return;
  }
  const m = missions[missionIndex],
    target = phase === "pickup" ? m.pickup : m.drop;
  if (!canInteract(body().position, target, speed)) return;
  startPassengerTransition(phase === "pickup");
}
function pause() {
  if (mode === "settings") {
    closeSettings();
    return;
  }
  if (mode === "credits") {
    $("close-credits").click();
    return;
  }
  if (mode === "map") {
    setMode("playing");
    return;
  }
  if (mode === "playing") setMode("paused");
  else if (mode === "paused") setMode("playing");
}
function home() {
  actorTransition = null;
  show("transition-status", false);
  for (const door of taxi.userData.doors || []) door.rotation.y = 0;
  swimming = false;
  avatar.scale.setScalar(1);
  avatar.rotation.x = 0;
  audio.stopDialogue();
  setMode("welcome");
  transport = "moto";
  lastTransport = "moto";
  speed = 0;
  angle = Math.PI;
  bike.group.position.set(3, 0.14, 35);
  bike.group.rotation.y = Math.PI;
  taxi.position.set(-3, 0.04, 35);
  taxi.rotation.y = Math.PI;
  cycle.group.position.set(-6.9, 0.12, 35);
  cycle.group.rotation.y = Math.PI;
  bike.rider.visible = true;
  taxiDriver.visible = false;
  cycle.rider.visible = false;
  avatar.visible = false;
  bike.passenger.visible = false;
  taxiPassenger.visible = false;
  customer.visible = false;
  targetMarker.visible = false;
  savedLabel();
}

$("start").onclick = () => {
  targetMarker.visible = true;
  const selected = Number(missionSelect.value);
  void audio.unlock().catch(() => {});
  resetMission(
    Number.isInteger(selected) && selected >= 0 && selected < missions.length
      ? selected
      : 0,
  );
};
$("pause").onclick = pause;
$("resume").onclick = pause;
$("restart").onclick = () => resetMission(missionIndex);
$("home").onclick = home;
$("result-home").onclick = home;
$("retry").onclick = () => resetMission(missionIndex);
$("next").onclick = () =>
  resetMission(missionSuccess ? missionIndex + 1 : missionIndex);
$("interact").onclick = interact;
$("vehicle-action").onclick = toggleVehicle;
function toggleMap() {
  if (mode === "playing") setMode("map");
  else if (mode === "map") setMode("playing");
}
$("open-map").onclick = toggleMap;
$("close-map").onclick = toggleMap;
document.querySelector(".wordmark")!.addEventListener("click", (e) => {
  e.preventDefault();
  if (mode === "playing") pause();
});
const mapKeys: Record<string, string> = {
  ArrowUp: "up",
  KeyW: "up",
  KeyZ: "up",
  ArrowDown: "reverse",
  KeyS: "reverse",
  ArrowLeft: "left",
  KeyA: "left",
  KeyQ: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "brake",
  ShiftLeft: "boost",
  ShiftRight: "boost",
};
addEventListener("keydown", (e) => {
  if (
    e.key !== "Tab" &&
    (e.target as HTMLElement)?.closest(
      '.ui-select,.ui-select-popover,[role="slider"]',
    )
  )
    return;
  if (
    e.key === "Tab" &&
    ["settings", "credits", "paused", "result", "map"].includes(mode)
  ) {
    const panel = document.querySelector<HTMLElement>(
      mode === "settings"
        ? "#settings-panel"
        : mode === "credits"
          ? "#credits-panel"
          : mode === "paused"
            ? "#pause-panel"
            : mode === "result"
              ? "#result"
              : "#map-panel",
    );
    const focusable = Array.from(
      panel?.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],[tabindex="0"]',
      ) || [],
    ).filter((el) => el.offsetParent !== null);
    const first = focusable[0],
      last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
    return;
  }
  if (mapKeys[e.code]) {
    if (mode === "playing") e.preventDefault();
    if (mode === "playing") keys.add(mapKeys[e.code]);
  }
  if (e.repeat) return;
  if (e.code === "KeyE") interact();
  if (e.code === "KeyF") toggleVehicle();
  if (e.code === "KeyM") toggleMap();
  if (e.code === "Escape" || e.code === "KeyP") pause();
  if (e.code === "KeyC") recenter();
  if (e.code === "KeyR") recoverSwim();
  if (e.code === "KeyH") horn();
});
addEventListener("keyup", (e) => keys.delete(mapKeys[e.code]));
addEventListener("blur", () => {
  keys.clear();
  if (mode === "playing") setMode("paused");
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && mode === "playing") setMode("paused");
});
document.querySelectorAll<HTMLButtonElement>("[data-key]").forEach((button) => {
  button.onpointerdown = (e) => {
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    if (mode !== "playing" || actorTransition) return;
    keys.add(button.dataset.key!);
    button.classList.add("pressed");
  };
  const release = () => {
    keys.delete(button.dataset.key!);
    button.classList.remove("pressed");
  };
  button.onpointerup = release;
  button.onpointercancel = release;
  button.onlostpointercapture = release;
});
function recenter() {
  const p = body().position;
  camera.position.set(
    p.x - Math.sin(angle) * 9,
    p.y + 6,
    p.z - Math.cos(angle) * 9,
  );
  camera.lookAt(p.x, 1.7, p.z);
}
function collision() {
  if (collisionCooldown > 0) return;
  comfort = clamp(comfort - 22, 0, 100);
  collisionCooldown = 1.3;
  speed *= -0.18;
  beep(130, 0.18);
  if (Math.abs(speed) < 6)
    audio.trigger("light-impact", {
      nearTraffic: traffic.some(
        (c) => distance(c.mesh.position, body().position) < 8,
      ),
      otherTaxi: traffic.some(
        (c) => !c.isTruck && distance(c.mesh.position, body().position) < 8,
      ),
    });
  toast(
    phase === "drop"
      ? "Un choc : −22 % de confort. Ralentis aux croisements."
      : "Attention au trafic et aux façades.",
  );
}
function onRoad(x: number, z: number) {
  return ROADS.some(
    (v) =>
      Math.abs(x - v) < roadWidth(v) / 2 || Math.abs(z - v) < roadWidth(v) / 2,
  );
}
function trafficPosition(t: number, lane: number) {
  const q = ((t % 384) + 384) % 384;
  if (q < 96) return { x: -48 + q, z: -48 + lane, a: Math.PI / 2 };
  if (q < 192) return { x: 48 - lane, z: -48 + q - 96, a: 0 };
  if (q < 288) return { x: 48 - (q - 192), z: 48 - lane, a: -Math.PI / 2 };
  return { x: -48 + lane, z: 48 - (q - 288), a: Math.PI };
}
function environmentBlocked(
  p: { x: number; z: number },
  r: number,
  ignore?: T.Object3D,
) {
  if (coastalBlocked(p, r, transport === "walk") || collisionGrid.blocked(p, r))
    return true;
  for (const v of [
    { root: bike.group, w: dimensions.moto.width, d: dimensions.moto.length },
    { root: taxi, w: dimensions.taxi.width, d: dimensions.taxi.length },
    {
      root: cycle.group,
      w: dimensions.bicycle.width,
      d: dimensions.bicycle.length,
    },
  ])
    if (
      v.root !== ignore &&
      insideVehicle(p, v.root.position, v.root.rotation.y, v.w, v.d, r)
    )
      return true;
  for (const c of traffic)
    if (
      insideVehicle(
        p,
        c.mesh.position,
        c.mesh.rotation.y,
        c.size.width,
        c.size.length,
        r,
      )
    )
      return true;
  for (const npc of npcs)
    if (distance(p, npc.group.position) < r + 0.32) return true;
  if (customer.visible && distance(p, customer.position) < r + 0.32)
    return true;
  return false;
}
function vehicleRoot(v: VehicleMode) {
  return v === "moto" ? bike.group : v === "taxi" ? taxi : cycle.group;
}
function vehicleRider(v: VehicleMode) {
  return v === "moto" ? bike.rider : v === "taxi" ? taxiDriver : cycle.rider;
}
function startTransition(tr: ActorTransition) {
  actorTransition = tr;
  speed = 0;
  keys.clear();
  tr.actor.visible = true;
  show("prompt", false);
  show("transition-status", true);
  show("vehicle-action", false);
  show("recover-swim", false);
  $("transition-status").querySelector("span")!.textContent =
    tr.kind === "enter"
      ? "On s’installe…"
      : tr.kind === "exit"
        ? "On se gare et on descend…"
        : tr.kind === "pickup"
          ? "Le client s’installe…"
          : tr.kind === "dropoff"
            ? "Le client descend…"
            : "Retour au rivage…";
}
function tickTransition(dt: number) {
  const tr = actorTransition;
  if (!tr) return;
  tr.elapsed += dt;
  const raw = Math.min(1, tr.elapsed / tr.duration),
    f = smoothTransition(raw);
  let seated = f;
  if (tr.via) {
    const split = tr.walkFraction || 0.65;
    if (raw < split) {
      tr.actor.position.lerpVectors(
        tr.from,
        tr.via,
        smoothTransition(raw / split),
      );
      tr.actor.scale.copy(tr.fromScale);
      tr.actor.rotation.y = Math.atan2(
        tr.via.x - tr.from.x,
        tr.via.z - tr.from.z,
      );
      animateActor(
        tr.actor,
        distance(tr.from, tr.via) / (tr.duration * split),
        dt,
        "walk",
      );
      seated = 0;
    } else {
      seated = smoothTransition((raw - split) / (1 - split));
      tr.actor.position.lerpVectors(tr.via, tr.to, seated);
      tr.actor.scale.lerpVectors(tr.fromScale, tr.toScale, seated);
      tr.actor.rotation.y = vehicleRoot(tr.vehicle).rotation.y;
      animateSeating(tr.actor, seated, true);
    }
  } else {
    tr.actor.position.lerpVectors(tr.from, tr.to, f);
    tr.actor.position.y += Math.sin(raw * Math.PI) * 0.1;
    tr.actor.scale.lerpVectors(tr.fromScale, tr.toScale, f);
    animateSeating(tr.actor, f, tr.kind === "enter" || tr.kind === "pickup");
  }
  if (tr.vehicle === "taxi")
    for (const door of taxi.userData.doors || [])
      door.rotation.y = door.userData.side * Math.sin(raw * Math.PI) * 0.75;
  if (tr.kind === "recover")
    $("recovery-fade").style.opacity = String(Math.sin(raw * Math.PI));
  $("transition-status").querySelector("i")!.style.width = `${raw * 100}%`;
  if (raw >= 1) {
    actorTransition = null;
    show("transition-status", false);
    $("recovery-fade").style.opacity = "0";
    tr.done();
    transitionUntil = performance.now() + 350;
    updateTransport();
  }
}
function toggleVehicle() {
  if (
    mode !== "playing" ||
    actorTransition ||
    performance.now() < transitionUntil
  )
    return;
  if (swimming) {
    toast("Rejoins la plage avant de monter dans un véhicule.");
    return;
  }
  if (phase === "drop") {
    toast("Dépose ton passager avant de changer de véhicule.");
    return;
  }
  if (transport !== "walk" && Math.abs(speed) > 0.6) {
    toast("Arrête-toi complètement avant de descendre.");
    return;
  }
  if (transport !== "walk") {
    const v = transport,
      root = body(),
      rider = vehicleRider(v);
    const exit = safeExit(
      root.position,
      angle,
      (p) => environmentBlocked(p, 0.38, root),
      v === "taxi" ? -1 : 1,
    );
    if (!exit) {
      toast("Pas assez de place ici. Gare-toi dans un endroit dégagé.");
      return;
    }
    root.updateWorldMatrix(true, true);
    const from = rider.getWorldPosition(new T.Vector3()),
      scale = rider.getWorldScale(new T.Vector3());
    lastTransport = v;
    rider.visible = false;
    transport = "walk";
    avatar.rotation.set(0, angle, 0);
    avatar.userData.helmet.visible = v === "moto";
    avatar.userData.hair.visible = v !== "moto";
    startTransition({
      kind: "exit",
      actor: avatar,
      vehicle: v,
      from,
      to: new T.Vector3(exit.x, groundHeight(exit) + 0.048, exit.z),
      fromScale: scale,
      toScale: new T.Vector3(1, 1, 1),
      elapsed: 0,
      duration: 1.05,
      done: () => {
        restPose(avatar);
        toast("À pied. Maj pour courir ; F près d’un véhicule pour monter.");
      },
    });
  } else {
    const root = nearestVehicle(avatar.position, [
      bike.group,
      taxi,
      cycle.group,
    ]);
    if (!root) {
      toast("Approche-toi du vélo, de la moto ou du taxi.");
      return;
    }
    const v: VehicleMode =
        root === taxi ? "taxi" : root === cycle.group ? "bicycle" : "moto",
      rider = vehicleRider(v);
    root.updateWorldMatrix(true, true);
    angle = root.rotation.y;
    avatar.rotation.y = angle;
    startTransition({
      kind: "enter",
      actor: avatar,
      vehicle: v,
      from: avatar.position.clone(),
      to: rider.getWorldPosition(new T.Vector3()),
      fromScale: avatar.scale.clone(),
      toScale: rider.getWorldScale(new T.Vector3()),
      elapsed: 0,
      duration: 1.1,
      done: () => {
        avatar.visible = false;
        avatar.scale.setScalar(1);
        transport = v;
        lastTransport = v;
        rider.visible = true;
        toast(
          v === "taxi"
            ? "Au volant. Maj pour accélérer."
            : v === "bicycle"
              ? "À vélo. Maj pour pédaler plus fort."
              : "En selle. Maj pour accélérer.",
        );
      },
    });
  }
}
function startPassengerTransition(pickup: boolean) {
  const v = transport as "moto" | "taxi",
    root = vehicleRoot(v),
    seat = v === "moto" ? bike.passenger : taxiPassenger;
  root.updateWorldMatrix(true, true);
  const seatPos = seat.getWorldPosition(new T.Vector3()),
    seatScale = seat.getWorldScale(new T.Vector3());
  const side =
    Math.sign(
      (customer.position.x - root.position.x) * Math.cos(angle) -
        (customer.position.z - root.position.z) * Math.sin(angle),
    ) || 1;
  const exit = safeExit(
    root.position,
    angle,
    (p) => environmentBlocked(p, 0.38, root),
    side,
  );
  if (!exit) {
    toast("Gare-toi dans un endroit dégagé pour le client.");
    return;
  }
  const point = new T.Vector3(exit.x, groundHeight(exit) + 0.048, exit.z);
  seat.visible = false;
  customer.rotation.set(0, angle, 0);
  customer.userData.helmet.visible = v === "moto";
  customer.userData.hair.visible = v !== "moto";
  startTransition({
    kind: pickup ? "pickup" : "dropoff",
    actor: customer,
    vehicle: v,
    from: pickup ? customer.position.clone() : seatPos,
    to: pickup ? seatPos : point,
    fromScale: pickup ? new T.Vector3(1, 1, 1) : seatScale,
    toScale: pickup ? seatScale : new T.Vector3(1, 1, 1),
    elapsed: 0,
    via: pickup ? point : undefined,
    walkFraction: 0.72,
    duration: pickup
      ? Math.max(1.6, distance(customer.position, point) / 1.8 + 1)
      : 1.3,
    done: () => {
      if (pickup) {
        customer.visible = false;
        seat.visible = true;
        phase = "drop";
        timeLeft = missions[missionIndex].limit;
        updateObjective();
        audio.trigger("pickup", { moto: v === "moto" });
        toast("Client installé. En route !");
      } else {
        customer.visible = true;
        restPose(customer);
        audio.trigger("dropoff");
        finish(true);
      }
    },
  });
}
function recoverSwim() {
  if (mode !== "playing" || !swimming || actorTransition) return;
  const target = { x: 310, z: 120 };
  startTransition({
    kind: "recover",
    actor: avatar,
    vehicle: lastTransport,
    from: avatar.position.clone(),
    to: new T.Vector3(target.x, groundHeight(target) + 0.048, target.z),
    fromScale: new T.Vector3(1, 1, 1),
    toScale: new T.Vector3(1, 1, 1),
    elapsed: 0,
    duration: 1,
    done: () => {
      swimming = false;
      avatar.rotation.x = 0;
      restPose(avatar);
      recenter();
      toast("De retour sur la plage.");
    },
  });
}
let lastHorn = -10;
function horn() {
  if (
    mode !== "playing" ||
    actorTransition ||
    transport === "walk" ||
    transport === "bicycle"
  )
    return;
  audio.horn();
  const nearby = traffic.find(
    (c) => distance(c.mesh.position, body().position) < 14,
  );
  audio.trigger("horn", {
    nearTraffic: !!nearby,
    otherTaxi: !!nearby && !nearby.isTruck,
    repeatedHorn: audio.clock - lastHorn < 3,
  });
  lastHorn = audio.clock;
}
$("touch-horn").onclick = horn;
$("recover-swim").onclick = recoverSwim;
function updateTransport() {
  const label =
    transport === "walk"
      ? "À PIED"
      : transport === "moto"
        ? "BEN SKIN"
        : transport === "bicycle"
          ? "VÉLO"
          : "TAXI";
  $("transport-status").innerHTML =
    icon(
      transport === "walk"
        ? "Footprints"
        : transport === "moto"
          ? "Motorbike"
          : transport === "bicycle"
            ? "Bike"
            : "CarTaxiFront",
    ) + `<span>${label}</span>`;
  const nearby =
    transport === "walk"
      ? nearestVehicle(avatar.position, [bike.group, taxi, cycle.group])
      : null;
  const visible =
    phase === "pickup" &&
    ((transport === "walk" && !!nearby) ||
      (transport !== "walk" && Math.abs(speed) < 0.6));
  show(
    "vehicle-action",
    visible && mode === "playing" && !actorTransition && !swimming,
  );
  if (visible)
    setHtml(
      "vehicle-action",
      icon(transport === "walk" ? "LogIn" : "LogOut") +
        `<span>${transport === "walk" ? (nearby === taxi ? "Monter dans le taxi" : nearby === cycle.group ? "Monter sur le vélo" : "Monter sur la moto") : "Garer et descendre"}</span><kbd>F</kbd>`,
    );
}
function updateTraffic(dt: number, t: number) {
  for (const c of traffic) {
    const nextT = c.t + c.speed * dt * (c.reverse ? -1 : 1),
      v = trafficPosition(nextT, c.lane),
      candidate = { x: v.x + c.center.x, z: v.z + c.center.z };
    const playerNear =
      distance(candidate, body().position) <
      (transport === "walk"
        ? c.size.length / 2 + 0.8
        : c.size.length / 2 + bodyRadius() + 0.7);
    const parkedNear = [bike.group, taxi, cycle.group].some(
      (root) =>
        root !== body() &&
        distance(candidate, root.position) < c.size.length / 2 + 2.6,
    );
    const carNear = traffic.some(
      (other) =>
        other !== c &&
        distance(candidate, other.mesh.position) <
          (c.size.length + other.size.length) / 2 + 0.8,
    );
    const npcNear = npcs.some(
      (n) => distance(candidate, n.group.position) < c.size.length / 2 + 0.6,
    );
    if (!playerNear && !parkedNear && !carNear && !npcNear) c.t = nextT;
    const pos = trafficPosition(c.t, c.lane);
    c.mesh.position.set(
      pos.x + c.center.x,
      c.isTruck ? 0.12 : 0.04,
      pos.z + c.center.z,
    );
    c.mesh.rotation.y = pos.a + (c.reverse ? Math.PI : 0);
    c.mesh.visible = distance(c.mesh.position, body().position) < 175;
    if (!c.isTruck)
      animateCar(
        c.mesh,
        c.t === nextT ? c.speed * dt * (c.reverse ? -1 : 1) : 0,
        0,
        c.t !== nextT,
      );
  }
  for (const npc of npcs) {
    npc.group.visible = distance(npc.group.position, body().position) < 100;
    const nz = npc.group.position.z + npc.direction * dt * 0.75,
      candidate = { x: npc.x, z: nz };
    if (nz < npc.z - 10 || nz > npc.z + 10) {
      npc.direction *= -1;
      continue;
    }
    const blocked =
      distance(candidate, body().position) < 1.1 ||
      collisionGrid.blocked(candidate, 0.35) ||
      traffic.some((c) =>
        insideVehicle(
          candidate,
          c.mesh.position,
          c.mesh.rotation.y,
          c.size.width,
          c.size.length,
          0.4,
        ),
      ) ||
      [bike.group, taxi, cycle.group].some((v) =>
        insideVehicle(
          candidate,
          v.position,
          v.rotation.y,
          v === taxi
            ? dimensions.taxi.width
            : v === cycle.group
              ? dimensions.bicycle.width
              : dimensions.moto.width,
          v === taxi
            ? dimensions.taxi.length
            : v === cycle.group
              ? dimensions.bicycle.length
              : dimensions.moto.length,
          0.4,
        ),
      ) ||
      (customer.visible && distance(candidate, customer.position) < 0.8);
    if (blocked) {
      npc.direction *= -1;
      animatePerson(npc.group, t, 0);
    } else {
      npc.group.position.z = nz;
      npc.group.rotation.y = npc.direction > 0 ? 0 : Math.PI;
      animatePerson(npc.group, t, 0.65);
    }
  }
}
function update(dt: number, t: number) {
  if (actorTransition) {
    tickTransition(dt);
    updateTraffic(dt, t);
    return;
  }
  const p = body().position;
  collisionCooldown = Math.max(0, collisionCooldown - dt);
  hardBrakeCooldown = Math.max(0, hardBrakeCooldown - dt);
  elapsed += dt;
  const throttle = keys.has("up") ? 1 : keys.has("reverse") ? -1 : 0,
    brake = keys.has("brake"),
    boost = keys.has("boost"),
    previousSpeed = speed;
  sprinting = transport === "walk" && !swimming && boost && throttle !== 0;
  speed =
    transport === "walk"
      ? T.MathUtils.damp(
          speed,
          brake ? 0 : footTargetSpeed(throttle, boost, swimming),
          9,
          dt,
        )
      : transport === "bicycle"
        ? cycleDrive(speed, throttle, brake, dt, boost)
        : drive(speed, throttle, brake, dt, boost, transport === "taxi");
  if (transport !== "walk" && !onRoad(p.x, p.z)) speed *= Math.exp(-dt * 1.5);
  const steering = (keys.has("left") ? 1 : 0) - (keys.has("right") ? 1 : 0);
  angle +=
    steering *
    (transport === "walk"
      ? swimming
        ? 1.8
        : 2.7
      : clamp(Math.abs(speed) / 5, 0, 1) *
        (transport === "taxi" ? 0.95 : transport === "bicycle" ? 1.9 : 1.55)) *
    dt *
    (transport === "walk" ? 1 : Math.sign(speed || 1));
  const old = p.clone(),
    result = moveSwept(
      p,
      { x: Math.sin(angle) * speed * dt, z: Math.cos(angle) * speed * dt },
      (q) => environmentBlocked(q, bodyRadius(), body()),
      transport === "walk",
    );
  p.x = result.position.x;
  p.z = result.position.z;
  const travelled = distance(old, p) * Math.sign(speed || 1);
  if (result.hit) {
    if (transport === "walk") speed = travelled / dt;
    else collision();
  }
  body().rotation.y = angle;
  if (transport === "walk") {
    const was = swimming;
    swimming = nextWaterState(p, swimming);
    if (was !== swimming)
      toast(
        swimming
          ? "Dans l’eau. Maj pour nager plus vite ; R pour revenir à la plage."
          : "Sur le sable. Maj pour courir.",
      );
    avatar.rotation.x = T.MathUtils.damp(
      avatar.rotation.x,
      swimming ? 0.95 : 0,
      7,
      dt,
    );
    p.y = swimming ? -0.58 + Math.sin(t * 2) * 0.025 : groundHeight(p) + 0.048;
    animateActor(
      avatar,
      travelled / dt,
      dt,
      swimming ? "swim" : sprinting ? "run" : "walk",
    );
  } else if (transport === "taxi") {
    p.y = 0.04;
    animateCar(taxi, travelled, steering * 0.28, brake);
    poseVehicleRider(taxiDriver, taxi, "taxi");
  } else if (transport === "bicycle") {
    p.y = 0.12;
    if (throttle) pedalPhase += travelled * 1.2;
    animateBicycle(
      cycle,
      pedalPhase,
      travelled,
      -steering * Math.min(Math.abs(speed) * 0.025, 0.16),
    );
  } else {
    p.y = 0.14;
    bike.lean.rotation.z = T.MathUtils.damp(
      bike.lean.rotation.z,
      -steering * Math.min(Math.abs(speed) * 0.023, 0.26),
      7,
      dt,
    );
    for (const wheel of bike.wheels) {
      wheel.rotation.x += travelled / 0.394;
      wheel.rotation.y = wheel.userData.front ? steering * 0.18 : 0;
    }
    poseVehicleRider(bike.rider, bike.lean, "moto");
  }
  updateTraffic(dt, t);
  if (
    brake &&
    previousSpeed > 12 &&
    hardBrakeCooldown <= 0 &&
    phase === "drop"
  ) {
    comfort = clamp(comfort - 4, 0, 100);
    hardBrakeCooldown = 3;
    toast("Freinage brusque : −4 % de confort.");
  }
  if (phase === "drop") {
    timeLeft = Math.max(0, timeLeft - dt);
    if (timeLeft <= 0) {
      finish(
        false,
        "Le rendez-vous est passé. Essaie un itinéraire plus direct.",
      );
      return;
    }
    if (comfort < missions[missionIndex].minComfort) {
      finish(
        false,
        `${missions[missionIndex].person} préfère s’arrêter ici. Ralentis et garde tes distances.`,
      );
      return;
    }
  }
  const target =
      phase === "pickup"
        ? missions[missionIndex].pickup
        : missions[missionIndex].drop,
    near = distance(p, target) < 6;
  show("prompt", near && transport !== "walk" && transport !== "bicycle");
  $("prompt").querySelector("span")!.textContent =
    Math.abs(speed) >= 1.8
      ? "Freine pour t’arrêter"
      : phase === "pickup"
        ? `Prendre ${missions[missionIndex].person}`
        : "Déposer le passager";
  ($("interact") as HTMLButtonElement).disabled = Math.abs(speed) >= 1.8;
  setHtml(
    "interact",
    (phase === "pickup" ? "PRENDRE" : "DÉPOSER") +
      icon(phase === "pickup" ? "LogIn" : "LogOut"),
  );
  const d = distance(p, target);
  $("distance").textContent =
    d >= 1000 ? `${(d / 1000).toFixed(1)} km` : `${Math.round(d)} m`;
  $("bearing").textContent = near
    ? phase === "pickup"
      ? "POINT DE RENDEZ-VOUS"
      : "POINT DE DÉPOSE"
    : phase === "pickup"
      ? "CLIENT À REJOINDRE"
      : "DESTINATION";
  $("speed").textContent = String(Math.round(Math.abs(speed) * 3.6));
  $("speed-bar").style.width = `${(Math.abs(speed) / 22) * 100}%`;
  $("timer").textContent =
    phase === "pickup" ? "À TON RYTHME" : `${Math.ceil(timeLeft)} s`;
  $("timer").classList.toggle("urgent", phase === "drop" && timeLeft < 20);
  $("comfort-bar").style.width = `${comfort}%`;
  $("comfort-value").textContent = `${Math.round(comfort)}%`;
  $("district-name").textContent = districtAt(p.x, p.z).name.toUpperCase();
  updateTransport();
  show("recover-swim", swimming);
  show("touch-horn", transport === "moto" || transport === "taxi");
  $("transport-status").innerHTML =
    icon(
      swimming
        ? "Waves"
        : transport === "walk"
          ? "Footprints"
          : transport === "moto"
            ? "Motorbike"
            : transport === "bicycle"
              ? "Bike"
              : "CarTaxiFront",
    ) +
    `<span>${swimming ? "NAGE" : sprinting ? "COURSE" : transport === "walk" ? "À PIED" : transport === "moto" ? "BEN SKIN" : transport === "bicycle" ? "VÉLO" : "TAXI"}</span>`;
  const nearTraffic = traffic.find((c) => distance(c.mesh.position, p) < 7);
  if (transport !== "walk" && nearTraffic) {
    const context = {
      nearTraffic: true,
      otherTaxi: !nearTraffic.isTruck,
      passenger: phase === "drop",
      aggressive: Math.abs(speed) > 20,
    };
    if (Math.abs(speed) > 5) audio.trigger("near-miss", context);
    else if (throttle && Math.abs(speed) < 0.8)
      audio.trigger("blocked", context);
    else if (Math.abs(speed) < 2) audio.trigger("colleague", context);
  }
  if (near && (transport === "moto" || transport === "taxi"))
    audio.trigger(
      phase === "pickup"
        ? Math.abs(speed) > 1.8
          ? "client-moving"
          : "client-near"
        : Math.abs(speed) > 1.8
          ? "drop-moving"
          : "drop-near",
    );
}
const map = $("map") as HTMLCanvasElement,
  ctx = map.getContext("2d")!,
  fullMap = $("full-map") as HTMLCanvasElement,
  fullCtx = fullMap.getContext("2d")!;
const mapIcons = new globalThis.Map<string, HTMLImageElement>();
for (const name of [
  "Navigation2",
  "Bike",
  "MapPin",
  "Motorbike",
  "CarTaxiFront",
] as const) {
  const image = new Image();
  image.src =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      icon(name).replace(
        "currentColor",
        name === "MapPin" ? "#f4c651" : "#fff3d0",
      ),
    );
  mapIcons.set(name, image);
}
function stamp(
  context: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number,
  rotation = 0,
) {
  const image = mapIcons.get(name);
  if (!image?.complete) return;
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.drawImage(image, -size / 2, -size / 2, size, size);
  context.restore();
}
let mapRotation = 0;
function drawMap(dt = 0.016) {
  const p = body().position,
    s = 1.35,
    w = 320,
    h = 200,
    ox = w / 2,
    oz = h * 0.58;
  mapRotation = T.MathUtils.damp(mapRotation, angle - Math.PI, 7, dt);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#586b60";
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  ctx.translate(ox, oz);
  ctx.rotate(mapRotation);
  ctx.scale(s, s);
  ctx.translate(-p.x, -p.z);
  ctx.fillStyle = "#b2a57e";
  ctx.fillRect(298, -300, 24, 600);
  ctx.fillStyle = "#5c8589";
  ctx.fillRect(EXTENT, -EXTENT, 200, EXTENT * 2);
  for (let ix = 0; ix < 12; ix++)
    for (let iz = 0; iz < 12; iz++) {
      const x = ROADS[ix] + 24,
        z = ROADS[iz] + 24;
      if (Math.abs(x - p.x) > 180 || Math.abs(z - p.z) > 180) continue;
      ctx.fillStyle = x < -104 && (ix + iz) % 3 === 0 ? "#70896a" : "#78847a";
      ctx.fillRect(x - 17, z - 17, 34, 34);
    }
  ctx.strokeStyle = "#b8beb5";
  for (const v of ROADS) {
    ctx.lineWidth = roadWidth(v);
    ctx.beginPath();
    ctx.moveTo(v, -EXTENT);
    ctx.lineTo(v, EXTENT);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-EXTENT, v);
    ctx.lineTo(EXTENT, v);
    ctx.stroke();
  }
  for (const solid of solids) {
    if (Math.abs(solid.x - p.x) > 180 || Math.abs(solid.z - p.z) > 180)
      continue;
    if (solid.w > 5 && solid.d > 5) {
      ctx.fillStyle = "#4c5e54";
      ctx.fillRect(
        solid.x - solid.w / 2,
        solid.z - solid.d / 2,
        solid.w,
        solid.d,
      );
      ctx.strokeStyle = "#3f5349";
      ctx.lineWidth = 0.45;
      ctx.strokeRect(
        solid.x - solid.w / 2,
        solid.z - solid.d / 2,
        solid.w,
        solid.d,
      );
    } else if (solid.w > 15 || solid.d > 15) {
      ctx.fillStyle = "#798674";
      ctx.fillRect(
        solid.x - solid.w / 2,
        solid.z - solid.d / 2,
        solid.w,
        solid.d,
      );
    }
  }
  ctx.strokeStyle = "#e0e1cf88";
  ctx.lineWidth = 0.35;
  ctx.setLineDash([3, 4]);
  for (const v of ROADS) {
    ctx.beginPath();
    ctx.moveTo(v, -EXTENT);
    ctx.lineTo(v, EXTENT);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-EXTENT, v);
    ctx.lineTo(EXTENT, v);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
  function local(point: { x: number; z: number }) {
    const dx = (point.x - p.x) * s,
      dz = (point.z - p.z) * s;
    return {
      x: ox + dx * Math.cos(mapRotation) - dz * Math.sin(mapRotation),
      y: oz + dx * Math.sin(mapRotation) + dz * Math.cos(mapRotation),
    };
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(4, 4, w - 8, h - 8);
  ctx.clip();
  for (const mark of landmarks) {
    const q = local(mark);
    stamp(ctx, "MapPin", q.x, q.y, 13);
  }
  for (const c of traffic) {
    const q = local(c.mesh.position);
    ctx.fillStyle = c.isTruck ? "#b9aa83" : "#d6c48d";
    ctx.fillRect(q.x - 2, q.y - 2, 4, 4);
  }
  if (transport !== "moto") {
    const q = local(bike.group.position);
    stamp(ctx, "Motorbike", q.x, q.y, 17);
  }
  if (transport !== "taxi") {
    const q = local(taxi.position);
    stamp(ctx, "CarTaxiFront", q.x, q.y, 18);
  }
  if (transport !== "bicycle") {
    const q = local(cycle.group.position);
    stamp(ctx, "Bike", q.x, q.y, 18);
  }
  const target = local(targetMarker.position),
    dx = target.x - ox,
    dz = target.y - oz,
    factor = Math.min(
      1,
      (ox - 17) / Math.max(Math.abs(dx), 0.01),
      (oz - 17) / Math.max(-dz, 0.01),
      (h - oz - 17) / Math.max(dz, 0.01),
    );
  stamp(ctx, "MapPin", ox + dx * factor, oz + dz * factor, 23);
  ctx.fillStyle = "#203e35b0";
  ctx.beginPath();
  ctx.arc(ox, oz, 13, 0, Math.PI * 2);
  ctx.fill();
  stamp(ctx, "Navigation2", ox, oz, 22, Math.PI - angle + mapRotation);
  ctx.restore();
  const nx = Math.sin(mapRotation),
    nz = -Math.cos(mapRotation),
    nf = Math.min(
      (ox - 12) / Math.max(Math.abs(nx), 0.001),
      (oz - 12) / Math.max(-nz, 0.001),
      (h - oz - 12) / Math.max(nz, 0.001),
    ),
    northX = ox + nx * nf,
    northY = oz + nz * nf;
  ctx.fillStyle = "#263f35e0";
  ctx.beginPath();
  ctx.arc(northX, northY, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f2e9ce";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", northX, northY + 0.5);
  if (mode === "map") drawFullMap();
}
function drawFullMap() {
  const w = fullMap.width,
    h = fullMap.height,
    s = 1.2,
    ox = w / 2,
    oz = h / 2;
  fullCtx.fillStyle = "#173e35";
  fullCtx.fillRect(0, 0, w, h);
  for (const d of districts) {
    fullCtx.fillStyle = d.color + "30";
    fullCtx.beginPath();
    fullCtx.arc(ox + d.x * s, oz + d.z * s, 110, 0, Math.PI * 2);
    fullCtx.fill();
  }
  fullCtx.strokeStyle = "#80978a";
  fullCtx.lineWidth = 10;
  for (const v of ROADS) {
    fullCtx.lineWidth = roadWidth(v) * s;
    fullCtx.beginPath();
    fullCtx.moveTo(ox + v * s, oz - EXTENT * s);
    fullCtx.lineTo(ox + v * s, oz + EXTENT * s);
    fullCtx.stroke();
    fullCtx.beginPath();
    fullCtx.moveTo(ox - EXTENT * s, oz + v * s);
    fullCtx.lineTo(ox + EXTENT * s, oz + v * s);
    fullCtx.stroke();
  }
  for (const b of solids)
    if (b.w > 5 && b.d > 5) {
      fullCtx.fillStyle = "#50685a";
      fullCtx.fillRect(
        ox + (b.x - b.w / 2) * s,
        oz + (b.z - b.d / 2) * s,
        b.w * s,
        b.d * s,
      );
    }
  fullCtx.fillStyle = "#b2a57e";
  fullCtx.fillRect(ox + 298 * s, oz - 300 * s, 24 * s, 600 * s);
  fullCtx.fillStyle = "#6ba7a8";
  fullCtx.fillRect(ox + EXTENT * s, oz - EXTENT * s, 65, EXTENT * 2 * s);
  for (const d of districts) {
    fullCtx.fillStyle = "#f1e8c6";
    fullCtx.font = innerWidth < 700 ? "bold 36px Arial" : "bold 25px Arial";
    fullCtx.textAlign = "center";
    fullCtx.fillText(
      (innerWidth < 700 ? d.name.split(" ").at(-1)! : d.name).toUpperCase(),
      ox + d.x * s,
      oz + d.z * s - 12,
    );
  }
  for (const mark of landmarks) {
    stamp(fullCtx, "MapPin", ox + mark.x * s, oz + mark.z * s, 23);
    fullCtx.fillStyle = "#f2d88d";
    fullCtx.font = innerWidth < 700 ? "35px Arial" : "19px Arial";
    fullCtx.textAlign = "left";
    fullCtx.fillText(
      innerWidth < 700 ? mark.name.split(" ")[0] : mark.name,
      ox + mark.x * s + 12,
      oz + mark.z * s + 5,
    );
  }
  const p = body().position,
    target = targetMarker.position;
  fullCtx.strokeStyle = "#f5c64b";
  fullCtx.lineWidth = 3;
  fullCtx.setLineDash([6, 7]);
  fullCtx.beginPath();
  fullCtx.moveTo(ox + p.x * s, oz + p.z * s);
  fullCtx.lineTo(ox + target.x * s, oz + target.z * s);
  fullCtx.stroke();
  fullCtx.setLineDash([]);
  stamp(fullCtx, "MapPin", ox + target.x * s, oz + target.z * s, 35);
  stamp(
    fullCtx,
    "Motorbike",
    ox + bike.group.position.x * s,
    oz + bike.group.position.z * s,
    25,
  );
  stamp(
    fullCtx,
    "CarTaxiFront",
    ox + taxi.position.x * s,
    oz + taxi.position.z * s,
    25,
  );
  stamp(
    fullCtx,
    "Bike",
    ox + cycle.group.position.x * s,
    oz + cycle.group.position.z * s,
    25,
  );
  stamp(
    fullCtx,
    "Navigation2",
    ox + p.x * s,
    oz + p.z * s,
    30,
    Math.PI - angle,
  );
  fullCtx.fillStyle = "#e1d8b9";
  fullCtx.font = "14px Arial";
  fullCtx.textAlign = "left";
  fullCtx.fillText("0", 70, h - 35);
  fullCtx.fillRect(85, h - 43, 120, 3);
  fullCtx.fillText("100 m", 215, h - 35);
}
let last = performance.now(),
  total = 0,
  frames = 0,
  frameTime = 0,
  adapted = false,
  simulationTime = 0;
bike.group.position.set(3, 0.14, 35);
bike.group.rotation.y = Math.PI;
taxi.rotation.y = Math.PI;
targetMarker.visible = false;
customer.visible = false;
poseVehicleRider(bike.rider, bike.lean, "moto");
poseVehicleRider(taxiDriver, taxi, "taxi");
function frame(now: number) {
  requestAnimationFrame(frame);
  const raw = (now - last) / 1000,
    dt = Math.min(raw, 0.05);
  last = now;
  total += dt;
  environmentTime.value = total;
  environment.sky.position.set(body().position.x, 0, body().position.z);
  if (mode === "playing") {
    simulationTime += dt;
    update(dt, simulationTime);
  }
  if (mode === "welcome") {
    const a = -0.55 + Math.sin(total * 0.09) * 0.08;
    desired.set(3 + Math.sin(a) * 12, 5.3, 35 + Math.cos(a) * 12);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 2));
    camera.lookAt(3, 1.4, 35);
  } else {
    const p = body().position;
    sun.position.set(p.x - 35, 65, p.z + 35);
    sun.target.position.set(p.x, 0, p.z);
    sun.target.updateMatrixWorld();
    desired.set(
      p.x -
        Math.sin(angle) *
          ((transport === "walk" ? 6.5 : transport === "taxi" ? 12 : 10.5) +
            Math.abs(speed) * 0.11),
      p.y +
        (transport === "walk" ? 3.5 : transport === "taxi" ? 4.8 : 4.1) +
        Math.abs(speed) * 0.025,
      p.z -
        Math.cos(angle) *
          ((transport === "walk" ? 6.5 : transport === "taxi" ? 12 : 10.5) +
            Math.abs(speed) * 0.11),
    );
    for (let step = 1; step <= 20; step++) {
      const f = step / 20;
      if (
        collisionGrid.blocked(
          { x: p.x + (desired.x - p.x) * f, z: p.z + (desired.z - p.z) * f },
          0.35,
        )
      ) {
        const safe = Math.max(0.12, (step - 1) / 20);
        desired.set(
          p.x + (desired.x - p.x) * safe,
          2.1 + (desired.y - 2.1) * safe,
          p.z + (desired.z - p.z) * safe,
        );
        break;
      }
    }
    camera.position.lerp(desired, 1 - Math.exp(-dt * 5));
    if (collisionGrid.blocked(camera.position, 0.2))
      camera.position.copy(desired);
    look.set(
      p.x + Math.sin(angle) * 3,
      swimming ? 0.25 : 1.5,
      p.z + Math.cos(angle) * 3,
    );
    camera.lookAt(look);
    drawMap(dt);
  }
  audio.tick(
    dt,
    speed,
    mode === "playing" && (transport === "moto" || transport === "taxi"),
  );
  show(
    "dialogue-caption",
    mode === "playing" && audio.subtitles && !!audio.currentText,
  );
  targetMarker.children[1].position.y = 4.7 + Math.sin(total * 3) * 0.3;
  targetMarker.children[1].rotation.y = total;
  toastTime -= dt;
  if (toastTime <= 0) $("toast").classList.remove("visible");
  renderer.render(scene, camera);
  if (mode === "playing" && quality === "auto" && !adapted) {
    frames++;
    frameTime += raw;
    if (frames === 180) {
      if (frameTime / frames > 0.035) {
        renderer.setPixelRatio(1);
        renderer.shadowMap.enabled = false;
        resize();
        toast("Qualité ajustée pour une conduite plus fluide.");
      }
      adapted = true;
    }
  }
}
requestAnimationFrame(frame);
// Read-only state, useful to inspect a reproducible local play session.
Object.defineProperty(window, "kamerRush", {
  get: () => ({
    mode,
    phase,
    missionIndex,
    speed,
    comfort,
    timeLeft,
    transport,
    swimming,
    sprinting,
    transition: actorTransition?.kind || null,
    position: { x: body().position.x, z: body().position.z },
    progress: { ...progress },
    renderCalls: renderer.info.render.calls,
  }),
});
$("world").addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  if (mode === "playing") setMode("paused");
  show("error", true);
  $("error").textContent =
    "Le contexte graphique a été perdu. Recharge la page pour reprendre.";
});
