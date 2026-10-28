export type Point = { x: number; z: number };
export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.z - b.z);
export function canInteract(position: Point, target: Point, speed: number) {
  return distance(position, target) < 6 && Math.abs(speed) < 1.8;
}
export function drive(
  speed: number,
  throttle: number,
  brake: boolean,
  dt: number,
  boost = false,
  taxi = false,
) {
  const acceleration = throttle > 0 ? (boost ? 14 : 9) : throttle < 0 ? -5 : 0;
  return clamp(
    speed + (acceleration - speed * (brake ? 3.8 : 0.32)) * dt,
    -5,
    boost ? (taxi ? 29 : 31) : 22,
  );
}
export function grade(comfort: number, timeLeft: number) {
  return comfort >= 75 && timeLeft > 15
    ? 3
    : comfort >= 40 && timeLeft > 0
      ? 2
      : 1;
}
export const missions = [
  {
    name: "Le premier trajet",
    person: "Maya",
    role: "Libraire du quartier",
    line: "Les livres sont prêts. On passe à la librairie ?",
    pickup: { x: 0, z: 25 },
    drop: { x: 0, z: -31 },
    destination: "Librairie des Palmiers",
    limit: 75,
    focus: "FIABILITÉ",
    tip: "Une course simple pour prendre tes repères.",
    reward: 650,
    minComfort: 20,
  },
  {
    name: "Doucement, chef !",
    person: "Samuel",
    role: "Pâtissier",
    line: "Mon gâteau doit arriver entier. On roule souple !",
    pickup: { x: 0, z: -25 },
    drop: { x: 144, z: 128 },
    destination: "Terrasse Bonamé",
    limit: 155,
    focus: "CONFORT",
    tip: "Évite les chocs et les freinages secs. Confort minimum : 55 %.",
    reward: 900,
    minComfort: 55,
  },
  {
    name: "Avant la répétition",
    person: "Aïcha",
    role: "Musicienne",
    line: "La répétition commence bientôt. Tu connais un raccourci ?",
    pickup: { x: 144, z: 118 },
    drop: { x: -144, z: -175 },
    destination: "Studio Mboa",
    limit: 165,
    focus: "RAPIDITÉ",
    tip: "Choisis ton itinéraire, mais garde le contrôle.",
    reward: 1600,
    minComfort: 25,
  },
  {
    name: "Le long du fleuve",
    person: "Paul",
    role: "Guide du quartier",
    line: "La promenade est belle aujourd’hui. Direction l’embarcadère.",
    pickup: { x: -144, z: -165 },
    drop: { x: 288, z: 12 },
    destination: "Embarcadère",
    limit: 200,
    focus: "DÉCOUVERTE",
    tip: "Traverse les secteurs et rejoins les rives du fleuve.",
    reward: 1800,
    minComfort: 30,
  },
  {
    name: "Un jardin pour souffler",
    person: "Estelle",
    role: "Paysagiste",
    line: "J’ai rendez-vous au jardin. Prends ton temps dans les virages.",
    pickup: { x: 288, z: 22 },
    drop: { x: -240, z: 126 },
    destination: "Jardin de Ndolo",
    limit: 210,
    focus: "CONFORT",
    tip: "Un long trajet à travers la ville. Confort minimum : 60 %.",
    reward: 2200,
    minComfort: 60,
  },
  {
    name: "Retour au marché",
    person: "Idriss",
    role: "Commerçant",
    line: "On termine la tournée au marché. Merci pour le coup de main !",
    pickup: { x: -240, z: 116 },
    drop: { x: 48, z: 270 },
    destination: "Marché Nkol",
    limit: 185,
    focus: "FIABILITÉ",
    tip: "Rejoins le secteur des échoppes pour finir ta tournée.",
    reward: 1900,
    minComfort: 40,
  },
];
export type Progress = {
  reputation: number;
  earnings: number;
  completed: number;
  best: number;
};
export function readProgress(raw: string | null): Progress {
  try {
    const p = JSON.parse(raw || "null");
    if (
      p &&
      ["reputation", "earnings", "completed", "best"].every(
        (k) => Number.isFinite(p[k]) && p[k] >= 0,
      )
    )
      return p;
  } catch {}
  return { reputation: 0, earnings: 0, completed: 0, best: 0 };
}

export function cycleDrive(
  speed: number,
  throttle: number,
  brake: boolean,
  dt: number,
  boost = false,
) {
  return clamp(
    speed +
      ((throttle > 0 ? (boost ? 6.6 : 4.2) : throttle < 0 ? -2.5 : 0) -
        speed * (brake ? 5 : 0.55)) *
        dt,
    -2.5,
    boost ? 12 : 9,
  );
}
