import * as T from "three";
import { EXTENT } from "./map";
import { SHORE } from "./locomotion";
/** Shared time drives original analytic water and a light cosmetic leaf breeze. */
export const environmentTime = { value: 0 };
export function createEnvironment(scene: T.Scene) {
  const material = new T.ShaderMaterial({
    uniforms: {
      uTime: environmentTime,
      shallow: { value: new T.Color("#67b5a9") },
      deep: { value: new T.Color("#236e89") },
    },
    vertexShader: `uniform float uTime;varying vec3 vWorld;void main(){vec3 p=position;vec3 w=(modelMatrix*vec4(p,1.)).xyz;float shore=smoothstep(322.,338.,w.x);p.z+=(sin(w.x*.13+uTime*.8)*.09+sin(w.z*.23-uTime*.65)*.045)*shore;vWorld=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
    fragmentShader: `uniform float uTime;uniform vec3 shallow;uniform vec3 deep;varying vec3 vWorld;void main(){float d=max(0.,vWorld.x-322.);float rip=sin(vWorld.x*.18+vWorld.z*.16-uTime*1.2)*sin(vWorld.z*.11-uTime*.8);vec3 col=mix(shallow,deep,smoothstep(0.,120.,d));col+=rip*.025;float rim=pow(1.-abs(dot(normalize(cameraPosition-vWorld),vec3(0.,1.,0.))),3.);col=mix(col,vec3(.62,.79,.79),rim*.28);float foam=(1.-smoothstep(0.,4.,d))*smoothstep(.5,.9,sin(vWorld.z*.29+uTime)*.5+.5);col=mix(col,vec3(.87,.88,.7),foam*.65);gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
  });
  const water = new T.Mesh(new T.PlaneGeometry(640, 940, 64, 100), material);
  water.rotation.x = -Math.PI / 2;
  water.position.set(EXTENT + 320, -0.04, 0);
  water.frustumCulled = false;
  scene.add(water);
  const buoyGeometry = new T.SphereGeometry(0.3, 8, 6),
    buoyMaterial = new T.MeshStandardMaterial({
      color: "#edc65d",
      roughness: 0.5,
    });
  const buoys: T.Mesh[] = [];
  for (let z = SHORE.swimMinZ; z <= SHORE.swimMaxZ; z += 11) {
    const b = new T.Mesh(buoyGeometry, buoyMaterial);
    b.position.set(SHORE.swimMaxX, 0.05, z);
    scene.add(b);
    buoys.push(b);
  }
  for (const z of [SHORE.swimMinZ, SHORE.swimMaxZ])
    for (let x = 332; x < SHORE.swimMaxX; x += 12) {
      const b = new T.Mesh(buoyGeometry, buoyMaterial);
      b.position.set(x, 0.05, z);
      scene.add(b);
      buoys.push(b);
    }

  const sky = new T.Mesh(
    new T.SphereGeometry(450, 20, 12),
    new T.ShaderMaterial({
      side: T.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new T.Color("#a4cece") },
        horizon: { value: new T.Color("#efdfb5") },
      },
      vertexShader:
        "varying vec3 vPosition;void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: `varying vec3 vPosition;uniform vec3 top;uniform vec3 horizon;void main(){float a=smoothstep(-.03,.55,normalize(vPosition).y);gl_FragColor=vec4(mix(horizon,top,a),1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
    }),
  );
  scene.add(sky);
  return { water, sky, buoys };
}
