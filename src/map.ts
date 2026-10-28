export const ROAD_STEP = 48;
export const ROADS = Array.from({ length: 13 }, (_, i) => (i - 6) * ROAD_STEP);
export const EXTENT = 322;
export const districts = [
  {
    name: "Bonamé",
    subtitle: "Commerces & rencontres",
    x: 0,
    z: 0,
    color: "#c99b69",
  },
  {
    name: "Plateau Mboa",
    subtitle: "Ateliers créatifs & bureaux",
    x: 0,
    z: -210,
    color: "#91a9a1",
  },
  {
    name: "Marché Nkol",
    subtitle: "Échoppes & terrasses",
    x: 0,
    z: 210,
    color: "#c48260",
  },
  {
    name: "Jardins de Ndolo",
    subtitle: "Rues arborées & jardins",
    x: -210,
    z: 0,
    color: "#6c986e",
  },
  {
    name: "Rives du Fleuve",
    subtitle: "Promenade & embarcadère",
    x: 210,
    z: 0,
    color: "#6faca6",
  },
];
export const landmarks = [
  { name: "Librairie des Palmiers", x: 0, z: -31 },
  { name: "Terrasse Bonamé", x: 144, z: 128 },
  { name: "Studio Mboa", x: -144, z: -175 },
  { name: "Embarcadère", x: 288, z: 12 },
  { name: "Jardin de Ndolo", x: -240, z: 126 },
  { name: "Marché Nkol", x: 48, z: 270 },
];
export function districtAt(x: number, z: number) {
  return x > 104
    ? districts[4]
    : x < -104
      ? districts[3]
      : z < -104
        ? districts[1]
        : z > 104
          ? districts[2]
          : districts[0];
}
