import * as T from "three";
import { ROADS, EXTENT, districtAt, landmarks } from "./map";
import { roadWidth } from "./dimensions";
import { SHORE } from "./locomotion";
import { environmentTime } from "./environment";
import { restPose, animateActor, poseVehicleRider } from "./animation";
export type Solid = { x: number; z: number; w: number; d: number };
const cubeGeometry = new T.BoxGeometry(1, 1, 1);
const sphereGeometry = new T.SphereGeometry(1, 10, 8);
const poleGeometry = new T.CylinderGeometry(1, 1, 1, 8);
const planeGeometry = new T.PlaneGeometry(1, 1);
const signMaterials = new Map<string, T.MeshBasicMaterial>();
const cylinderGeometries = new Map<string, T.CylinderGeometry>();
const materials = new Map<string, T.MeshStandardMaterial>();
export function material(color: string, roughness = 0.8, metalness = 0) {
  const key = color + roughness + metalness;
  if (!materials.has(key))
    materials.set(
      key,
      new T.MeshStandardMaterial({ color, roughness, metalness }),
    );
  return materials.get(key)!;
}
export function box(
  parent: T.Object3D,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: string,
) {
  const mesh = new T.Mesh(cubeGeometry, material(color));
  mesh.position.set(x, y, z);
  mesh.scale.set(w, h, d);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function sphere(
  parent: T.Object3D,
  r: number,
  x: number,
  y: number,
  z: number,
  color: string,
  sx = 1,
  sy = 1,
  sz = 1,
) {
  const m = new T.Mesh(sphereGeometry, material(color));
  m.position.set(x, y, z);
  m.scale.set(sx * r, sy * r, sz * r);
  m.castShadow = true;
  parent.add(m);
  return m;
}
function cylinder(
  parent: T.Object3D,
  r1: number,
  r2: number,
  h: number,
  x: number,
  y: number,
  z: number,
  color: string,
) {
  const key = String(r1 / r2);
  if (!cylinderGeometries.has(key))
    cylinderGeometries.set(key, new T.CylinderGeometry(r1 / r2, 1, 1, 10));
  const m = new T.Mesh(cylinderGeometries.get(key)!, material(color));
  m.scale.set(r2, h, r2);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function beam(
  parent: T.Object3D,
  a: T.Vector3,
  b: T.Vector3,
  r: number,
  color: string,
) {
  const m = new T.Mesh(poleGeometry, material(color));
  m.scale.set(r, a.distanceTo(b), r);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(
    new T.Vector3(0, 1, 0),
    b.clone().sub(a).normalize(),
  );
  m.castShadow = true;
  parent.add(m);
  return m;
}
function sign(
  parent: T.Object3D,
  text: string,
  w: number,
  x: number,
  y: number,
  z: number,
  color = "#163f3b",
  angle = 0,
) {
  const key = text + color;
  if (!signMaterials.has(key)) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = "#fff3cd";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText(text, 256, 65, 480);
    const texture = new T.CanvasTexture(c);
    texture.colorSpace = T.SRGBColorSpace;
    signMaterials.set(key, new T.MeshBasicMaterial({ map: texture }));
  }
  const m = new T.Mesh(planeGeometry, signMaterials.get(key)!);
  m.scale.set(w, w / 4, 1);
  m.position.set(x, y, z);
  m.rotation.y = angle;
  parent.add(m);
}
export function person(
  color = "#d98550",
  seated = false,
  skin = "#75482f",
  hero = false,
) {
  const g = new T.Group(),
    upperBody = new T.Group();
  upperBody.position.y = 0.8;
  g.add(upperBody);
  const head = new T.Group();
  head.position.set(0, 0.73, 0);
  upperBody.add(head);
  sphere(head, 0.18, 0, 0, 0, skin, 0.86, 1.15, 0.88);
  const hair = sphere(
    head,
    0.185,
    0,
    0.158,
    -0.018,
    "#25352e",
    0.94,
    0.42,
    0.94,
  );
  sphere(head, 0.018, -0.058, 0.032, 0.15, "#17251f");
  sphere(head, 0.018, 0.058, 0.032, 0.15, "#17251f");
  sphere(head, 0.027, 0, -0.026, 0.176, skin, 0.65, 1.2, 0.9);
  sphere(head, 0.027, -0.16, 0, 0, skin, 0.6, 1, 1);
  sphere(head, 0.027, 0.16, 0, 0, skin, 0.6, 1, 1);
  box(head, 0.065, 0.009, 0.012, 0, -0.075, 0.153, "#704232");
  cylinder(upperBody, 0.065, 0.075, 0.13, 0, 0.53, 0, skin);
  const torso = new T.Mesh(
    new T.CapsuleGeometry(0.225, 0.24, 5, 12),
    material(color),
  );
  torso.position.set(0, 0.28, 0);
  torso.scale.z = 0.72;
  torso.castShadow = true;
  upperBody.add(torso);
  box(upperBody, 0.16, 0.035, 0.035, 0, 0.51, 0.168, "#eee3c9");
  if (hero) {
    box(upperBody, 0.012, 0.35, 0.018, 0, 0.27, 0.171, "#e6d4aa");
    for (const side of [-1, 1])
      box(upperBody, 0.075, 0.045, 0.016, side * 0.13, 0.22, 0.175, "#ba673c");
    const pack = new T.Mesh(
      new T.CapsuleGeometry(0.18, 0.15, 4, 10),
      material("#264b43"),
    );
    pack.position.set(0, 0.25, -0.17);
    pack.scale.set(1, 1, 0.5);
    upperBody.add(pack);
  }
  const legs: T.Group[] = [],
    arms: T.Group[] = [];
  for (const side of [-1, 1]) {
    const arm = new T.Group();
    arm.position.set(side * 0.225, 0.5, 0);
    upperBody.add(arm);
    const elbow = new T.Group();
    elbow.position.set(side * 0.015, -0.3, 0);
    arm.add(elbow);
    const a = beam(arm, new T.Vector3(), elbow.position, 0.075, color),
      b = beam(
        elbow,
        new T.Vector3(),
        new T.Vector3(0, -0.29, 0.02),
        0.058,
        skin,
      ),
      hand = sphere(elbow, 0.06, 0, -0.29, 0.02, skin, 0.85, 1.1, 0.8);
    arm.userData = {
      joint: elbow,
      upper: a,
      lower: b,
      endMesh: hand,
      upperLength: 0.3,
      lowerLength: 0.29,
      kind: "arm",
    };
    arms.push(arm);
    const leg = new T.Group();
    leg.position.set(side * 0.12, 0.8, 0);
    g.add(leg);
    const knee = new T.Group();
    knee.position.set(0, -0.4, 0);
    leg.add(knee);
    const u = beam(leg, new T.Vector3(), knee.position, 0.1, "#263e4a"),
      l = beam(
        knee,
        new T.Vector3(),
        new T.Vector3(0, -0.38, 0),
        0.078,
        "#263e4a",
      ),
      foot = new T.Group();
    knee.add(foot);
    box(foot, 0.17, 0.12, 0.29, 0, 0, 0.07, "#eee3cd");
    box(foot, 0.17, 0.025, 0.29, 0, -0.065, 0.07, "#395149");
    leg.userData = {
      joint: knee,
      knee,
      upper: u,
      lower: l,
      endMesh: foot,
      foot,
      upperLength: 0.4,
      lowerLength: 0.38,
      kind: "leg",
      seated,
    };
    legs.push(leg);
  }
  const helmet = new T.Group();
  head.add(helmet);
  sphere(helmet, 0.245, 0, 0.04, 0, "#e9b841");
  sphere(helmet, 0.205, 0, 0.02, 0.12, "#263e42", 1, 0.48, 0.6);
  helmet.visible = false;
  g.userData = {
    legs,
    arms,
    upperBody,
    torso,
    head,
    hair,
    helmet,
    phase: 0,
    motion: 0,
    hero,
  };
  restPose(g, seated);
  return g;
}
export function animatePerson(g: T.Group, t: number, amount: number) {
  const delta = Math.min(
    0.05,
    Math.max(0, t - (g.userData.lastAnimationTime ?? t - 0.016)),
  );
  g.userData.lastAnimationTime = t;
  animateActor(g, amount * 0.9, delta, "walk");
}
export function motorcycle(riderColor = "#df754c") {
  const g = new T.Group(),
    lean = new T.Group();
  g.add(lean);
  const wheels: T.Group[] = [];
  for (const z of [-0.85, 0.9]) {
    const hub = new T.Group();
    hub.position.set(0, 0.54, z);
    hub.userData.front = z > 0;
    lean.add(hub);
    const tire = new T.Mesh(
      new T.TorusGeometry(0.41, 0.115, 8, 18),
      material("#202b30"),
    );
    tire.rotation.y = Math.PI / 2;
    tire.position.set(0, 0, 0);
    tire.castShadow = true;
    hub.add(tire);
    wheels.push(hub);
    const rim = new T.Mesh(
      new T.CylinderGeometry(0.29, 0.29, 0.12, 12),
      material("#b2bbc0", 0.35, 0.7),
    );
    rim.rotation.z = Math.PI / 2;
    rim.position.set(0, 0, 0);
    hub.add(rim);
    for (let j = 0; j < 6; j++) {
      const a = (j * Math.PI) / 3;
      beam(
        hub,
        new T.Vector3(),
        new T.Vector3(0, Math.sin(a) * 0.3, Math.cos(a) * 0.3),
        0.015,
        "#e1e3d7",
      );
    }
  }
  beam(
    lean,
    new T.Vector3(0, 0.6, -0.85),
    new T.Vector3(0, 1.12, 0.35),
    0.09,
    "#1c4743",
  );
  beam(
    lean,
    new T.Vector3(0, 0.65, 0.9),
    new T.Vector3(0, 1.5, 0.62),
    0.07,
    "#d3d9ce",
  );
  beam(
    lean,
    new T.Vector3(0, 0.7, -0.7),
    new T.Vector3(0, 0.9, 0.15),
    0.07,
    "#a4b0a7",
  );
  box(lean, 0.46, 0.38, 0.45, 0, 0.71, -0.05, "#55636b");
  for (let i = 0; i < 4; i++)
    box(lean, 0.5, 0.025, 0.43, 0, 0.6 + i * 0.07, -0.05, "#bac3bf");
  sphere(lean, 0.38, 0, 1.14, 0.2, "#e0a32e", 0.7, 0.65, 1.1);
  box(lean, 0.48, 0.14, 0.87, 0, 1.18, -0.47, "#2b3434");
  box(lean, 0.52, 0.08, 0.35, 0, 1.03, -1.05, "#244d47");
  const frontFender = box(lean, 0.28, 0.1, 0.72, 0, 0.99, 0.9, "#e0a32e");
  frontFender.rotation.x = 0.08;
  box(lean, 0.12, 0.12, 0.82, 0.32, 0.55, -0.5, "#c3c7b9");
  const head = sphere(lean, 0.19, 0, 1.38, 0.89, "#fff0ac", 1, 1, 0.5);
  head.material = new T.MeshStandardMaterial({
    color: "#fff3c2",
    emissive: "#e6b952",
    emissiveIntensity: 0.4,
  });
  box(lean, 0.24, 0.11, 0.09, 0, 1, -1.08, "#e35e3e");
  beam(
    lean,
    new T.Vector3(-0.4, 1.52, 0.58),
    new T.Vector3(0.4, 1.52, 0.58),
    0.045,
    "#243337",
  );
  for (const s of [-1, 1]) {
    beam(
      lean,
      new T.Vector3(s * 0.32, 1.5, 0.6),
      new T.Vector3(s * 0.44, 1.88, 0.72),
      0.022,
      "#d9d7c3",
    );
    sphere(lean, 0.09, s * 0.44, 1.9, 0.72, "#aed3ce", 1.4, 0.7, 0.3);
    beam(
      lean,
      new T.Vector3(s * 0.3, 0.73, -0.6),
      new T.Vector3(s * 0.3, 0.58, -1.05),
      0.07,
      "#afb8ae",
    );
  }
  const rider = person(riderColor, true, "#75482f", true);
  rider.scale.setScalar(1 / 0.75);
  rider.position.set(0, 0.2, -0.25);
  lean.add(rider);
  rider.userData.hair.visible = false;
  rider.userData.helmet.visible = true;
  const passenger = person("#5f9d99", true);
  passenger.scale.setScalar(1 / 0.75);
  passenger.position.set(0, 0.2, -0.85);
  passenger.visible = false;
  lean.add(passenger);
  passenger.userData.hair.visible = false;
  passenger.userData.helmet.visible = true;
  g.scale.setScalar(0.75);
  return { group: g, lean, wheels, passenger, rider };
}
export function bicycle() {
  const g = new T.Group(),
    lean = new T.Group();
  g.add(lean);
  const wheels: T.Group[] = [];
  for (const z of [-0.65, 0.65]) {
    const hub = new T.Group();
    hub.position.set(0, 0.39, z);
    lean.add(hub);
    const tyre = new T.Mesh(
      new T.TorusGeometry(0.31, 0.045, 8, 24),
      material("#243438"),
    );
    tyre.rotation.y = Math.PI / 2;
    hub.add(tyre);
    const rim = new T.Mesh(
      new T.TorusGeometry(0.29, 0.017, 6, 24),
      material("#a8bcb1", 0.3, 0.7),
    );
    rim.rotation.y = Math.PI / 2;
    hub.add(rim);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      beam(
        hub,
        new T.Vector3(),
        new T.Vector3(0, Math.sin(a) * 0.29, Math.cos(a) * 0.29),
        0.006,
        "#bdc9bf",
      );
    }
    wheels.push(hub);
  }
  const rear = new T.Vector3(0, 0.39, -0.65),
    seat = new T.Vector3(0, 0.94, -0.23),
    crank = new T.Vector3(0, 0.43, 0),
    head = new T.Vector3(0, 0.99, 0.42),
    front = new T.Vector3(0, 0.39, 0.65);
  for (const [a, b] of [
    [rear, seat],
    [seat, crank],
    [crank, rear],
    [crank, head],
    [head, seat],
    [head, front],
  ])
    beam(lean, a, b, 0.033, "#4d9386");
  beam(
    lean,
    new T.Vector3(0, 0.99, 0.42),
    new T.Vector3(0, 1.12, 0.5),
    0.025,
    "#b9c9bd",
  );
  beam(
    lean,
    new T.Vector3(-0.25, 1.12, 0.5),
    new T.Vector3(0.25, 1.12, 0.5),
    0.027,
    "#293f3c",
  );
  box(lean, 0.2, 0.07, 0.32, 0, 0.98, -0.25, "#2e4140");
  const pedals = new T.Group();
  pedals.position.copy(crank);
  lean.add(pedals);
  beam(
    pedals,
    new T.Vector3(-0.16, 0, 0),
    new T.Vector3(-0.16, 0, 0.16),
    0.018,
    "#b8c6b9",
  );
  beam(
    pedals,
    new T.Vector3(0.16, 0, 0),
    new T.Vector3(0.16, 0, -0.16),
    0.018,
    "#b8c6b9",
  );
  box(pedals, 0.14, 0.045, 0.08, -0.23, 0, 0.16, "#334941");
  box(pedals, 0.14, 0.045, 0.08, 0.23, 0, -0.16, "#334941");
  const rider = person("#df754c", true, "#75482f", true);
  rider.scale.setScalar(1);
  rider.position.set(0, 0.18, -0.2);
  lean.add(rider);
  rider.visible = false;
  return { group: g, lean, wheels, pedals, rider };
}
export function animateBicycle(
  model: ReturnType<typeof bicycle>,
  phase: number,
  travel: number,
  steer: number,
) {
  for (const w of model.wheels) w.rotation.x += travel / 0.355;
  model.pedals.rotation.x = phase;
  model.lean.rotation.z = steer;
  poseVehicleRider(model.rider, model.lean, "bicycle", phase);
}
let carBodyGeometry: T.ExtrudeGeometry | undefined;
export function animateCar(
  g: T.Group,
  distanceMoved: number,
  steer = 0,
  braking = false,
) {
  const wheels = g.userData.wheels as T.Group[] | undefined;
  wheels?.forEach((w) => {
    w.rotation.y = w.userData.front ? steer : 0;
    const tire = w.userData.tire as T.Mesh;
    tire.rotation.x += distanceMoved / 0.35;
  });
  if (g.userData.brakeMaterial)
    g.userData.brakeMaterial.emissiveIntensity = braking ? 1.1 : 0.15;
}
export function car(color = "#e9b632") {
  const g = new T.Group();
  g.scale.set(0.9, 1, 1.2);
  for (const tint of ["#24474d", "#315a5d"]) {
    const glass = material(tint);
    glass.transparent = true;
    glass.opacity = 0.46;
    glass.depthWrite = false;
  }
  if (!carBodyGeometry) {
    const side = new T.Shape();
    side.moveTo(-1.72, 0.52);
    side.lineTo(-1.72, 0.87);
    side.lineTo(-1.25, 1.01);
    side.lineTo(1.25, 1.01);
    side.lineTo(1.72, 0.84);
    side.lineTo(1.72, 0.52);
    side.closePath();
    carBodyGeometry = new T.ExtrudeGeometry(side, {
      depth: 1.7,
      bevelEnabled: true,
      bevelSize: 0.07,
      bevelThickness: 0.07,
      bevelSegments: 2,
      steps: 1,
    });
  }
  const paint = new T.MeshPhysicalMaterial({
    color,
    roughness: 0.31,
    metalness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.25,
  });
  const body = new T.Mesh(carBodyGeometry, paint);
  body.rotation.y = Math.PI / 2;
  body.position.x = -0.85;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  const wheels: T.Group[] = [];
  g.userData.wheels = wheels;
  g.userData.doors = [];
  const brakeMaterial = new T.MeshStandardMaterial({
    color: "#bd4b35",
    emissive: "#ef5c32",
    emissiveIntensity: 0.15,
  });
  g.userData.brakeMaterial = brakeMaterial;
  box(g, 1.55, 0.12, 0.1, 0, 0.68, 1.78, "#52655f");
  box(g, 0.5, 0.18, 0.04, 0, 0.78, -1.84, "#eee4c2");
  box(g, 1.62, 0.13, 2.1, 0, 1.75, -0.1, color);
  for (const sx of [-0.75, 0.75])
    for (const sz of [-1.02, 0.84])
      box(g, 0.09, 0.68, 0.1, sx, 1.38, sz, color);
  box(g, 1.5, 0.49, 0.04, 0, 1.39, 0.87, "#24474d");
  box(g, 1.5, 0.43, 0.04, 0, 1.4, -1.07, "#24474d");
  for (const s of [-1, 1]) {
    const door = new T.Group();
    door.position.set(s * 0.79, 1.05, 0.83);
    g.add(door);
    box(door, 0.035, 0.36, 1.05, 0, 0.02, -0.52, color);
    box(door, 0.025, 0.43, 1.05, 0, 0.35, -0.52, "#315a5d");
    door.userData.side = s;
    g.userData.doors.push(door);
    for (const z of [-1.1, 1.1]) {
      const hub = new T.Group();
      hub.position.set(s * 0.95, 0.43, z);
      g.add(hub);
      const wheel = cylinder(hub, 0.35, 0.35, 0.19, 0, 0, 0, "#253236");
      wheel.rotation.z = Math.PI / 2;
      const cap = cylinder(hub, 0.17, 0.17, 0.015, s * 0.105, 0, 0, "#afbcb2");
      cap.rotation.z = Math.PI / 2;
      hub.userData = { front: z > 0, tire: wheel };
      wheels.push(hub);
    }
    box(g, 0.45, 0.18, 0.08, s * 0.57, 0.8, 1.84, "#fff3b2");
    box(g, 0.4, 0.14, 0.08, s * 0.6, 0.8, -1.84, "#c44c32").material =
      brakeMaterial;
  }
  box(g, 0.6, 0.14, 0.4, 0, 1.79, -0.1, "#fff0bf");
  const steering = new T.Mesh(
    new T.TorusGeometry(0.17, 0.022, 6, 18),
    material("#2a3f39"),
  );
  steering.position.set(-0.4, 1.18, 0.72);
  steering.rotation.x = 0.35;
  g.add(steering);
  g.userData.steeringWheel = steering;
  return g;
}
export function truck() {
  const g = new T.Group();
  box(g, 2.32, 0.35, 6.8, 0, 0.85, 0, "#3a4e4c");
  box(g, 2.34, 1.8, 2.05, 0, 1.65, 2.25, "#d7b354");
  box(g, 2.4, 2.35, 4.9, 0, 2.05, -1.2, "#a7b8a5");
  box(g, 2.12, 0.72, 0.04, 0, 2.12, 3.3, "#31555b");
  for (const side of [-1, 1]) {
    box(g, 0.04, 0.7, 1.4, side * 1.19, 2.1, 2.4, "#31555b");
    box(g, 0.45, 0.2, 0.06, side * 0.76, 1.1, 3.31, "#fff1b8");
    for (const z of [-2.4, -1.1, 2.5]) {
      const wheel = cylinder(g, 0.5, 0.5, 0.25, side * 1.08, 0.5, z, "#253234");
      wheel.rotation.z = Math.PI / 2;
    }
    for (let j = 0; j < 5; j++)
      box(g, 0.035, 2.1, 0.06, side * 1.22, 2.1, -3 + j * 0.95, "#79978b");
  }
  box(g, 1.5, 0.3, 0.05, 0, 1.55, 3.31, "#718177");
  return g;
}
export function buildWorld(scene: T.Scene) {
  const root = new T.Group();
  scene.add(root);
  const solids: Solid[] = [];
  box(root, 822, 0.4, 1000, -89, -0.27, 0, "#bb956f");
  box(root, EXTENT * 2, 0.15, EXTENT * 2, 0, -0.03, 0, "#b4bc8a");
  box(root, 230, 0.13, 950, EXTENT + 120, -0.35, 0, "#3d8c99");
  for (const axis of ROADS) {
    box(root, roadWidth(axis), 0.12, EXTENT * 2, axis, 0.05, 0, "#4b5655");
    box(root, EXTENT * 2, 0.13, roadWidth(axis), 0, 0.055, axis, "#4b5655");
    for (let v = -EXTENT + 5; v < EXTENT; v += 8) {
      if (ROADS.every((r) => Math.abs(v - r) > 7)) {
        box(root, 0.12, 0.015, 2.6, axis, 0.123, v, "#d9cfad");
        box(root, 2.6, 0.015, 0.12, v, 0.13, axis, "#d9cfad");
      }
    }
  }
  for (let v = -EXTENT + 5; v < EXTENT; v += 8)
    if (ROADS.every((r) => Math.abs(v - r) > 10))
      for (const lane of [-4.5, 4.5]) {
        box(root, 0.1, 0.015, 3, lane, 0.14, v, "#d9cfad");
        box(root, 3, 0.015, 0.1, v, 0.14, lane, "#d9cfad");
      }
  const shopNames = [
    "LIBRAIRIE DES PALMIERS",
    "ATELIER NDO",
    "MAISON DES ARTS",
    "CAFÉ BONAMÉ",
    "STUDIO MBOA",
    "CHEZ MADO",
    "LES TISSUS D’ICI",
    "VÉLO & MOTO",
  ];
  let n = 0;
  for (const color of ["#3c785d", "#558557"]) {
    const leaf = material(color);
    leaf.onBeforeCompile = (shader) => {
      shader.uniforms.uBreeze = environmentTime;
      shader.vertexShader =
        "uniform float uBreeze;\n" +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\ntransformed.x+=sin(uBreeze*.9+position.z*2.)*.07;",
        );
    };
    leaf.customProgramCacheKey = () => "kamer-breeze-v1";
  }
  function palm(x: number, z: number, scale = 1) {
    solids.push({ x, z, w: 0.65 * scale, d: 0.65 * scale });
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(scale);
    root.add(g);
    const trunk = cylinder(g, 0.17, 0.29, 6, 0, 3, 0, "#927252");
    trunk.rotation.z = 0.06;
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7;
      const leaf = new T.Mesh(
        sphereGeometry,
        material(i % 2 ? "#3c785d" : "#558557"),
      );
      leaf.scale.set(0.48, 0.17, 2.1);
      leaf.rotation.set(0.2, a, 0.15);
      leaf.position.set(Math.sin(a) * 1.2, 6.2, Math.cos(a) * 1.2);
      leaf.castShadow = true;
      g.add(leaf);
    }
    sphere(g, 0.4, -0.2, 5.9, 0, "#54724d");
  }
  function garden(cx: number, cz: number) {
    box(root, 34, 0.21, 34, cx, 0.15, cz, "#75956d");
    box(root, 3, 0.04, 32, cx, 0.28, cz, "#d9c7a5");
    box(root, 32, 0.04, 3, cx, 0.28, cz, "#d9c7a5");
    for (const ox of [-11, 11])
      for (const oz of [-11, 11]) {
        palm(cx + ox, cz + oz, 1.25);
        sphere(root, 2, cx + ox, 0.6, cz + oz, "#59835b", 1, 0.5, 1);
      }
    for (const ox of [-6, 6]) {
      box(root, 3, 0.15, 0.7, cx + ox, 0.7, cz + 4, "#9b744d");
      solids.push({ x: cx + ox, z: cz + 4, w: 3, d: 0.8 });
      for (const lx of [-1, 1])
        box(root, 0.13, 0.7, 0.4, cx + ox + lx, 0.35, cz + 4, "#3e5b4a");
    }
  }
  for (let ix = 0; ix < ROADS.length - 1; ix++)
    for (let iz = 0; iz < ROADS.length - 1; iz++) {
      const cx = (ROADS[ix] + ROADS[ix + 1]) / 2,
        cz = (ROADS[iz] + ROADS[iz + 1]) / 2;
      const district = districtAt(cx, cz);
      const isGarden =
        district.name === "Jardins de Ndolo" && (ix + iz) % 3 === 0;
      if (isGarden) {
        garden(cx, cz);
        continue;
      }
      const minX = ROADS[ix] + roadWidth(ROADS[ix]) / 2 + 1,
        maxX = ROADS[ix + 1] - roadWidth(ROADS[ix + 1]) / 2 - 1,
        minZ = ROADS[iz] + roadWidth(ROADS[iz]) / 2 + 1,
        maxZ = ROADS[iz + 1] - roadWidth(ROADS[iz + 1]) / 2 - 1;
      box(
        root,
        maxX - minX,
        0.24,
        maxZ - minZ,
        (minX + maxX) / 2,
        0.1,
        (minZ + maxZ) / 2,
        "#cfc19f",
      );
      const palette =
        district.name === "Plateau Mboa"
          ? ["#a5b8ac", "#d5c7a4", "#8faaa9"]
          : district.name === "Marché Nkol"
            ? ["#cd8b65", "#deae76", "#b37b66"]
            : district.name === "Rives du Fleuve"
              ? ["#8cb4ae", "#d9c99f", "#b5c6b3"]
              : ["#dcad78", "#d18e69", "#a1b09a"];
      for (const ox of [-8, 8])
        for (const oz of [-8, 8]) {
          const x =
              cx +
              ox +
              (cx === 24 && ox < 0 ? 2 : cx === -24 && ox > 0 ? -2 : 0),
            z =
              cz +
              oz +
              (cz === 24 && oz < 0 ? 2 : cz === -24 && oz > 0 ? -2 : 0),
            w = 11 + (n % 2),
            d = 10,
            h = (district.name === "Plateau Mboa" ? 8 : 5) + (n % 3) * 2.2;
          const g = new T.Group();
          g.position.set(x, 0, z);
          root.add(g);
          solids.push({ x, z, w: w + 1, d: d + 1 });
          box(g, w, h, d, 0, h / 2 + 0.2, 0, palette[n % 3]);
          box(g, w + 0.7, 0.25, d + 0.7, 0, h + 0.35, 0, "#e2caa1");
          const roof = box(
            g,
            w + 0.6,
            0.22,
            d + 0.8,
            0,
            h + 0.6,
            0,
            n % 2 ? "#7b6d59" : "#688479",
          );
          roof.rotation.x = 0.07;
          for (let floor = 0; floor < Math.floor(h / 2.3); floor++)
            for (const wx of [-3.2, 0, 3.2]) {
              box(g, 1.35, 1.35, 0.04, wx, 1.8 + floor * 2.3, 5.04, "#31565a");
              box(g, 1.5, 0.09, 0.15, wx, 1.15 + floor * 2.3, 5.1, "#edddb3");
              if (floor > 0) {
                box(g, 1.9, 0.08, 0.8, wx, 1.15 + floor * 2.3, 5.3, "#bca482");
                for (const rail of [-0.8, 0.8])
                  box(
                    g,
                    0.045,
                    0.6,
                    0.05,
                    wx + rail,
                    1.5 + floor * 2.3,
                    5.65,
                    "#35564b",
                  );
                box(g, 1.9, 0.06, 0.05, wx, 1.8 + floor * 2.3, 5.65, "#35564b");
              }
            }
          box(g, 1.5, 2.2, 0.1, 0, 1.3, 5.1, "#254a43");
          const awning = box(
            g,
            w + 0.4,
            0.12,
            2.3,
            0,
            2.9,
            5.9,
            n % 2 ? "#e6b145" : "#427e75",
          );
          awning.rotation.x = 0.16;
          for (let a = -w / 2; a < w / 2; a += 1.4)
            box(g, 0.65, 0.13, 2.25, a, 2.96, 5.9, "#e9dfbd");
          sign(g, shopNames[n % shopNames.length], w - 0.5, 0, 3.7, 5.12);
          if (n % 5 === 0) {
            box(g, 2, 0.65, 1, 3, 0.63, 6.1, "#82573d");
            for (let j = 0; j < 5; j++)
              sphere(
                g,
                0.2,
                2.3 + j * 0.32,
                1.1,
                6.1,
                j % 2 ? "#c5683c" : "#d5ad37",
              );
          }
          n++;
        }
      for (const ox of [-16, 16])
        palm(
          cx +
            ox +
            (cx === 24 && ox < 0 ? 2.4 : cx === -24 && ox > 0 ? -2.4 : 0),
          cz + 16 + (cz === -24 ? -2.4 : 0),
          0.85 + ((ix + iz) % 3) * 0.12,
        );
      if (district.name === "Marché Nkol" && (ix + iz) % 2 === 0) {
        const x = cx - 16,
          z = cz - 10;
        cylinder(root, 0.07, 0.07, 2.8, x, 1.4, z, "#6d5742");
        const umbrella = new T.Mesh(
          new T.ConeGeometry(2, 1, 8),
          material("#ca714c"),
        );
        umbrella.position.set(x, 3, z);
        umbrella.castShadow = true;
        root.add(umbrella);
        box(root, 2.3, 0.14, 1.2, x, 1, z, "#8d6449");
        solids.push({ x, z, w: 2.3, d: 1.2 });
      }
    }
  // Riverside walkway and a small original jetty, all within the fictional map.
  box(root, 16, 0.14, 600, 306, 0.02, 0, "#dfc38d");
  box(root, 8, 0.14, 390, 318, 0.02, -105, "#dfc38d");
  box(root, 8, 0.14, 150, 318, 0.02, 225, "#dfc38d");
  box(root, 4, 0.25, 600, 300, 0.12, 0, "#d4c6a2");
  const rampGeometry = new T.BufferGeometry();
  rampGeometry.setAttribute(
    "position",
    new T.Float32BufferAttribute(
      [314, 0.09, 90, 326, -0.35, 90, 314, 0.09, 150, 326, -0.35, 150],
      3,
    ),
  );
  rampGeometry.setIndex([0, 2, 1, 1, 2, 3]);
  rampGeometry.computeVertexNormals();
  const ramp = new T.Mesh(rampGeometry, material("#c6b17d"));
  ramp.receiveShadow = true;
  root.add(ramp);
  solids.push(
    { x: 317, z: -105, w: 0.3, d: 390 },
    { x: 317, z: 225, w: 0.3, d: 150 },
  );
  for (const z of [175, 215, 255]) {
    const umbrella = new T.Mesh(
      new T.ConeGeometry(2.2, 0.8, 10),
      material(z === 215 ? "#bc774e" : "#4a8e84"),
    );
    umbrella.position.set(309, 3, z);
    umbrella.castShadow = true;
    root.add(umbrella);
    cylinder(root, 0.06, 0.06, 2.7, 309, 1.35, z, "#7d6446");
    box(root, 1, 0.12, 2, 311, 0.5, z + 2, "#e9d9b6");
    box(root, 1, 0.55, 0.15, 311, 0.8, z + 1, "#427969");
    solids.push(
      { x: 309, z, w: 0.2, d: 0.2 },
      { x: 311, z: z + 2, w: 1, d: 2 },
    );
  }
  for (let z = -280; z <= 280; z += 24) palm(307, z, 1.15);
  for (const [start, end] of [
    [-300, 90],
    [150, 300],
  ])
    for (let z = start; z < end; z += 24) {
      const len = Math.min(24, end - z);
      box(root, 0.15, 1.1, 0.15, 317, 0.7, z, "#57776c");
      box(root, 0.1, 0.1, len, 317, 1.2, z + len / 2, "#57776c");
    }
  sign(
    root,
    "PLAGE DES RIVES · ACCÈS À PIED",
    6,
    306,
    3,
    92,
    "#235e51",
    -Math.PI / 2,
  );
  solids.push({ x: 306, z: 92, w: 0.2, d: 0.2 });
  box(root, 32, 0.5, 7, 328, 0.4, 12, "#a0825b");
  for (let i = 0; i < 15; i++)
    box(root, 0.12, 0.08, 7, 314 + i * 2, 0.7, 12, "#6f634e");
  for (let i = 0; i < ROADS.length - 1; i++) {
    const c = (ROADS[i] + ROADS[i + 1]) / 2;
    if (Math.abs(c) < 30) continue;
    box(root, 0.8, 0.34, 25, 0, 0.23, c, "#adad94");
    box(root, 25, 0.34, 0.8, c, 0.23, 0, "#adad94");
    solids.push({ x: 0, z: c, w: 0.8, d: 25 }, { x: c, z: 0, w: 25, d: 0.8 });
  }
  for (const axis of ROADS)
    for (const edge of [-EXTENT + 3, EXTENT - 3]) {
      box(root, 10, 0.18, 0.3, axis, 0.8, edge, "#d7b85d");
      box(root, 0.3, 0.18, 10, edge, 0.8, axis, "#d7b85d");
      for (const off of [-4, 0, 4]) {
        box(root, 0.15, 1.5, 0.15, axis + off, 0.75, edge, "#31594f");
        box(root, 0.15, 1.5, 0.15, edge, 0.75, axis + off, "#31594f");
      }
      solids.push(
        { x: axis, z: edge, w: 10, d: 0.8 },
        { x: edge, z: axis, w: 0.8, d: 10 },
      );
    }
  for (const mark of landmarks) {
    const signX = mark.x > 300 ? mark.x : mark.x + 5.8;
    sign(
      root,
      mark.name.toUpperCase(),
      7,
      signX,
      3.8,
      mark.z,
      "#235e51",
      -Math.PI / 2,
    );
    cylinder(root, 0.07, 0.07, 4, signX, 2, mark.z, "#476c58");
    solids.push({ x: signX, z: mark.z, w: 0.2, d: 0.2 });
  }
  const delivery = truck();
  delivery.position.set(7, 0.12, 35);
  delivery.rotation.y = Math.PI;
  root.add(delivery);
  solids.push({ x: 7, z: 35, w: 2.5, d: 7.1 });
  const worker = person("#618e81");
  worker.position.set(10.7, 0.14, 35);
  root.add(worker);
  solids.push({ x: 10.7, z: 35, w: 0.7, d: 0.7 });
  // Batch static geometry: shared primitive geometries + per-material GPU instances.
  root.updateMatrixWorld(true);
  const batches = new Map<
    string,
    {
      geometry: T.BufferGeometry;
      material: T.Material;
      matrices: T.Matrix4[];
      shadow: boolean;
    }
  >();
  root.traverseVisible((obj) => {
    if (obj instanceof T.Mesh) {
      const key = obj.geometry.uuid + "|" + (obj.material as T.Material).uuid;
      let batch = batches.get(key);
      if (!batch) {
        batch = {
          geometry: obj.geometry,
          material: obj.material as T.Material,
          matrices: [],
          shadow: obj.castShadow,
        };
        batches.set(key, batch);
      }
      batch.matrices.push(obj.matrixWorld.clone());
    }
  });
  scene.remove(root);
  for (const batch of batches.values()) {
    const instanced = new T.InstancedMesh(
      batch.geometry,
      batch.material,
      batch.matrices.length,
    );
    batch.matrices.forEach((m, i) => instanced.setMatrixAt(i, m));
    instanced.castShadow = batch.shadow;
    instanced.receiveShadow = true;
    instanced.computeBoundingSphere();
    scene.add(instanced);
  }
  return solids;
}
export function marker() {
  const g = new T.Group();
  const ring = new T.Mesh(
    new T.TorusGeometry(3.3, 0.12, 8, 48),
    new T.MeshBasicMaterial({ color: "#f6c853" }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.2;
  g.add(ring);
  const cone = new T.Mesh(
    new T.ConeGeometry(0.7, 1.2, 5),
    new T.MeshBasicMaterial({ color: "#f6c853" }),
  );
  cone.rotation.z = Math.PI;
  cone.position.y = 4.7;
  g.add(cone);
  const beamMesh = new T.Mesh(
    new T.CylinderGeometry(1.2, 2.7, 8, 24, 1, true),
    new T.MeshBasicMaterial({
      color: "#f8cc64",
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      side: T.DoubleSide,
    }),
  );
  beamMesh.position.y = 4;
  g.add(beamMesh);
  return g;
}
