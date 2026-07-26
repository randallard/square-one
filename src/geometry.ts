/**
 * Geometry primitives for the block-local frame.
 *
 * **Facing convention.** Facing is degrees, **counterclockwise-positive**, measured
 * from `+x`. CCW-positive is forced by the specs: `arm-turn` records its rotation
 * delta as `fraction × ±360°` with "left: +/CCW, right: −/CW", so a left arm turn
 * has to come out positive.
 *
 * The specs write facings as cardinals (`+y`, `−x`, …) because every block-local
 * frame starts with the dancer facing `+y`. {@link PLUS_Y} and friends are those
 * cardinals in this convention.
 */

/** A point in the block-local frame. One unit is the gap between facing dancers. */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

/** Degrees, CCW-positive from `+x`. Not normalised — accumulated rotation is signed
 *  and may exceed ±360°, which is exactly what the flow rules (F3/F4) measure. */
export type Degrees = number;

export const PLUS_X: Degrees = 0;
export const PLUS_Y: Degrees = 90;
export const MINUS_X: Degrees = 180;
export const MINUS_Y: Degrees = 270;

/** Which way a rotation went. `null` means "no rotation" — a dancer with no
 *  rotational momentum cannot Roll, which is why this is three-valued. */
export type Turn = "cw" | "ccw" | null;

export const deg2rad = (d: Degrees): number => (d * Math.PI) / 180;
export const rad2deg = (r: number): Degrees => (r * 180) / Math.PI;

/** Normalise to `[0, 360)`. Only for comparing *bearings*; never apply it to
 *  accumulated rotation, which must stay signed and unbounded. */
export function normaliseDeg(d: Degrees): Degrees {
  const m = d % 360;
  return m < 0 ? m + 360 : m;
}

/** Signed difference `to - from`, taken the short way round, in `(-180, 180]`. */
export function deltaDeg(from: Degrees, to: Degrees): Degrees {
  const d = normaliseDeg(to - from);
  return d > 180 ? d - 360 : d;
}

/** The direction of a signed rotation. Exactly zero means no rotation, not CW. */
export function turnOf(rotation: Degrees): Turn {
  if (rotation > 0) return "ccw";
  if (rotation < 0) return "cw";
  return null;
}

export function polar(radius: number, angle: Degrees): Vec2 {
  const a = deg2rad(angle);
  return { x: radius * Math.cos(a), y: radius * Math.sin(a) };
}

/** Mirror across the `y` axis: negate `x`, reflect facing. This is the transform
 *  the specs mean by "`shoulder: left` mirrors x" — and it must flip the sense of
 *  rotation too, which is why facing becomes `180 - facing`. */
export function mirrorX(p: Vec2): Vec2 {
  return { x: -p.x, y: p.y };
}

export function mirrorFacing(f: Degrees): Degrees {
  return 180 - f;
}

/** Round to a fixed number of decimals. Waypoint tables in the specs are written
 *  to 2dp, so comparisons happen at that resolution rather than on float equality. */
export function round(n: number, dp = 6): number {
  const f = 10 ** dp;
  // `+ 0` collapses `-0` to `0`; a mirrored zero should not read as negative.
  return Math.round(n * f) / f + 0;
}
