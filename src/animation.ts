import * as T from "three";
const UP = new T.Vector3(0, 1, 0);
export function aimBone(mesh: T.Mesh, a: T.Vector3, b: T.Vector3) {
  const d = b.clone().sub(a);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.scale.y = d.length();
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
}
/** Analytic two-bone IK; end targets stay on the reachable annulus. */
export function solveLimb(
  limb: T.Group,
  target: T.Vector3,
  bendDirection = new T.Vector3(0, 0, 1),
) {
  const data = limb.userData,
    a = data.upperLength as number,
    b = data.lowerLength as number;
  const d = T.MathUtils.clamp(
      target.length(),
      Math.abs(a - b) + 0.005,
      a + b - 0.002,
    ),
    axis = target.clone().normalize(),
    end = axis.clone().multiplyScalar(d);
  let bend = bendDirection
    .clone()
    .addScaledVector(axis, -bendDirection.dot(axis));
  if (bend.lengthSq() < 0.001)
    bend = new T.Vector3(1, 0, 0).addScaledVector(axis, -axis.x);
  bend.normalize();
  const along = (a * a + d * d - b * b) / (2 * d),
    height = Math.sqrt(Math.max(0, a * a - along * along)),
    joint = axis.clone().multiplyScalar(along).addScaledVector(bend, height);
  const group = data.joint as T.Group;
  group.position.copy(joint);
  group.rotation.set(0, 0, 0);
  aimBone(data.upper, new T.Vector3(), joint);
  aimBone(data.lower, new T.Vector3(), end.clone().sub(joint));
  const effector = data.endMesh as T.Object3D;
  effector.position.copy(end).sub(joint);
  effector.rotation.set(0, 0, 0);
  data.lastTarget = end;
  return { end, joint };
}
export function restPose(actor: T.Group, seated = false) {
  const legs = actor.userData.legs as T.Group[],
    arms = actor.userData.arms as T.Group[];
  legs?.forEach((leg, i) => {
    leg.rotation.set(0, 0, 0);
    solveLimb(leg, new T.Vector3(0, seated ? -0.46 : -0.77, seated ? 0.28 : 0));
  });
  arms?.forEach((arm, i) => {
    arm.rotation.set(0, 0, 0);
    solveLimb(
      arm,
      new T.Vector3(
        (i ? 1 : -1) * 0.015,
        seated ? -0.16 : -0.55,
        seated ? 0.44 : 0.03,
      ),
      new T.Vector3(0, -1, 0.2),
    );
  });
}
export function animateActor(
  actor: T.Group,
  speed: number,
  dt: number,
  kind: "walk" | "run" | "swim" = "walk",
) {
  const amount = T.MathUtils.damp(
    actor.userData.motion || 0,
    Math.min(
      1,
      Math.abs(speed) / (kind === "run" ? 4.2 : kind === "swim" ? 1.5 : 1.5),
    ),
    9,
    dt,
  );
  actor.userData.motion = amount;
  actor.userData.phase =
    (actor.userData.phase || 0) +
    (speed * dt * Math.PI * 2) /
      (kind === "run" ? 2.6 : kind === "swim" ? 2.0 : 1.9);
  const phase = actor.userData.phase,
    legs = actor.userData.legs as T.Group[],
    arms = actor.userData.arms as T.Group[],
    upper = actor.userData.upperBody as T.Group;
  upper.rotation.x = T.MathUtils.damp(
    upper.rotation.x,
    kind === "run" ? 0.16 : kind === "swim" ? -0.08 : 0,
    8,
    dt,
  );
  upper.rotation.z =
    Math.sin(phase) * amount * (kind === "swim" ? 0.06 : 0.018);
  legs.forEach((leg, i) => {
    leg.rotation.set(0, 0, 0);
    const t = phase + i * Math.PI,
      swing =
        Math.sin(t) *
        amount *
        (kind === "run" ? 0.36 : kind === "swim" ? 0.12 : 0.24),
      lift =
        Math.max(0, Math.cos(t)) *
        amount *
        (kind === "run" ? 0.22 : kind === "swim" ? 0.1 : 0.11);
    solveLimb(leg, new T.Vector3(0, -0.77 + lift, swing));
  });
  arms.forEach((arm, i) => {
    arm.rotation.set(0, 0, 0);
    const t = phase + i * Math.PI;
    if (kind === "swim") {
      solveLimb(
        arm,
        new T.Vector3(
          (i ? 1 : -1) * (0.13 + Math.sin(t) * 0.16),
          -0.21 + Math.sin(t) * 0.22,
          0.3 + Math.cos(t) * 0.18,
        ),
        new T.Vector3(i ? 1 : -1, -0.1, 0.1),
      );
    } else {
      solveLimb(
        arm,
        new T.Vector3(
          (i ? 1 : -1) * 0.015,
          kind === "run" ? -0.36 : -0.54,
          -Math.sin(t) * amount * (kind === "run" ? 0.3 : 0.16),
        ),
        new T.Vector3(0, -0.1, 0.8),
      );
    }
  });
  actor.userData.torso.position.y =
    0.28 +
    Math.abs(Math.sin(phase)) * amount * (kind === "run" ? 0.025 : 0.009);
}
export function animateSeating(
  actor: T.Group,
  progress: number,
  entering: boolean,
) {
  const blend = entering ? progress : 1 - progress,
    upper = actor.userData.upperBody as T.Group;
  upper.rotation.x = 0.32 * blend;
  upper.rotation.z = 0;
  const legs = actor.userData.legs as T.Group[],
    arms = actor.userData.arms as T.Group[];
  legs.forEach((leg, i) => {
    leg.rotation.set(0, 0, 0);
    solveLimb(
      leg,
      new T.Vector3(0, T.MathUtils.lerp(-0.77, -0.46, blend), 0.28 * blend),
    );
  });
  arms.forEach((arm, i) => {
    arm.rotation.set(0, 0, 0);
    solveLimb(
      arm,
      new T.Vector3(
        (i ? 1 : -1) * 0.015,
        T.MathUtils.lerp(-0.54, -0.16, blend),
        0.44 * blend,
      ),
      new T.Vector3(0, -1, 0.3),
    );
  });
}
export function poseVehicleRider(
  actor: T.Group,
  parent: T.Object3D,
  mode: "moto" | "taxi" | "bicycle",
  phase = 0,
) {
  const upper = actor.userData.upperBody as T.Group;
  upper.rotation.set(
    mode === "moto" ? 0.4 : mode === "bicycle" ? 0.5 : 0.06,
    0,
    0,
  );
  const legs = actor.userData.legs as T.Group[],
    arms = actor.userData.arms as T.Group[];
  for (const limb of [...legs, ...arms]) limb.rotation.set(0, 0, 0);
  parent.updateWorldMatrix(true, true);
  legs.forEach((leg, i) => {
    const side = i ? 1 : -1,
      a = phase + i * Math.PI;
    const p =
      mode === "bicycle"
        ? new T.Vector3(
            side * 0.23,
            0.43 - Math.sin(a) * 0.16,
            Math.cos(a) * 0.16,
          )
        : mode === "moto"
          ? new T.Vector3(side * 0.28, 0.7, -0.3)
          : new T.Vector3(-0.4 + side * 0.13, 0.54, 0.72);
    const world = parent.localToWorld(p);
    leg.updateWorldMatrix(true, true);
    solveLimb(leg, leg.worldToLocal(world));
  });
  arms.forEach((arm, i) => {
    const side = i ? 1 : -1;
    const p =
      mode === "bicycle"
        ? new T.Vector3(side * 0.24, 1.12, 0.5)
        : mode === "moto"
          ? new T.Vector3(side * 0.37, 1.52, 0.58)
          : new T.Vector3(-0.4 + side * 0.15, 1.18, 0.72);
    const world = parent.localToWorld(p);
    arm.updateWorldMatrix(true, true);
    solveLimb(arm, arm.worldToLocal(world), new T.Vector3(0, -1, 0.1));
  });
}
