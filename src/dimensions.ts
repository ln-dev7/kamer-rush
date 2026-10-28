/** Metres in the shared world; collider envelopes include a small clearance. */
export const dimensions = {
  bicycle: { width: 0.7, length: 2.01, radius: 1.06 },
  moto: { width: 0.85, length: 2.1, radius: 1.06 },
  taxi: { width: 1.9, length: 4.45, radius: 2.35 },
  truck: { width: 2.5, length: 7.1, radius: 3.75 },
  person: { radius: 0.34 },
} as const;
export const roadWidth = (axis: number) => (axis === 0 ? 18 : 12);
