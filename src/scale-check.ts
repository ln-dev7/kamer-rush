/** Developer visual fixture: identical depth, orthographic camera, shared models. */
import * as T from "three";
import { car, motorcycle, person, truck, bicycle } from "./world";
const style = document.createElement("style");
style.textContent =
  "body{margin:0;background:#bfd5ca;color:#173e35;font-family:Arial}canvas{display:block}header{position:fixed;top:25px;left:30px;right:30px;display:flex;justify-content:space-between;gap:30px}h1{margin:0;font-size:25px}p{font-size:12px;line-height:1.7}a{color:inherit}#labels{position:fixed;left:30px;right:30px;bottom:28px;display:grid;grid-template-columns:repeat(5,1fr);gap:10px}section{padding:14px;background:#fff1d0dd;border:1px solid #173e3530;border-radius:8px;font-size:12px}section b{display:block;margin-bottom:8px}";
document.head.append(style);
document.body.innerHTML =
  '<header><div><h1>Kamer Rush · shared world scale</h1><p>Metres · identical centre depth z = 0 · orthographic camera · 1 m ground grid<br>Exact game models, no individual camera compensation.</p></div><a href="/">Return to the city</a></header><div id="labels"></div>';
const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.prepend(renderer.domElement);
const scene = new T.Scene();
scene.background = new T.Color("#bfd5ca");
scene.add(new T.HemisphereLight("#e5eedc", "#9c805b", 2.3));
const light = new T.DirectionalLight("#fff1d0", 3);
light.position.set(-10, 20, 8);
light.castShadow = true;
light.shadow.mapSize.set(2048, 2048);
Object.assign(light.shadow.camera, {
  left: -15,
  right: 15,
  top: 12,
  bottom: -12,
  near: 1,
  far: 60,
});
scene.add(light);
const floor = new T.Mesh(
  new T.PlaneGeometry(100, 100),
  new T.MeshStandardMaterial({ color: "#c8c8a7", roughness: 1 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const grid = new T.GridHelper(40, 40, "#6b8270", "#a1ad8b");
grid.position.y = 0.005;
scene.add(grid);
const cycle = bicycle();
cycle.rider.visible = true;
const models = [
  { name: "Standing person", object: person("#df754c"), x: -12, y: 0 },
  { name: "Bicycle + rider", object: cycle.group, x: -9, y: 0 },

  { name: "Motorcycle + rider", object: motorcycle().group, x: -5.8, y: 0 },
  { name: "Urban taxi", object: car(), x: -0.5, y: 0 },
  { name: "Delivery truck", object: truck(), x: 7, y: 0 },
];
for (const model of models) {
  model.object.position.set(model.x, 0, 0);
  const size = new T.Box3()
    .setFromObject(model.object)
    .getSize(new T.Vector3());
  model.object.rotation.y = Math.PI / 2;
  const bounds = new T.Box3().setFromObject(model.object);
  model.object.position.y -= bounds.min.y;
  scene.add(model.object);
  document.getElementById("labels")!.innerHTML +=
    `<section><b>${model.name}</b>W ${size.x.toFixed(2)} m · H ${size.y.toFixed(2)} m<br>L ${size.z.toFixed(2)} m</section>`;
}
const camera = new T.OrthographicCamera(-15, 15, 9, -9, 0.1, 100);
camera.position.set(0, 6, 23);
camera.lookAt(0, 1, 0);
function resize() {
  const aspect = innerWidth / innerHeight;
  camera.left = -15;
  camera.right = 15;
  camera.top = 15 / aspect;
  camera.bottom = -15 / aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.render(scene, camera);
}
addEventListener("resize", resize);
resize();
