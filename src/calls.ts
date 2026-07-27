/**
 * The call catalog — plain data (ADR-0008).
 *
 * A call carries no geometry of its own: it is a chain of block invocations, which
 * is exactly the structure the custom-move workshop emits and the social layer will
 * share. Two of the three starter calls are a single block.
 *
 * The pair frame (established in `docs/spec/calls/dosado.md` for all 2-dancer
 * calls): a local frame centred on the pair's midpoint, dancer A at `(0, −0.5)`
 * facing `+y`, dancer B at `(0, +0.5)` facing `−y`. B's path is always A's rotated
 * 180° about the origin.
 */

import type { CatalogCall } from "./blocks/index.js";
import { compose, ORIGIN } from "./compose.js";
import { PLUS_Y, normaliseDeg, round, type Degrees } from "./geometry.js";
import type { Motion, Pose } from "./types.js";

export interface CallDef {
  readonly name: string;
  /** Beats from the CALLERLAB timing chart, from point of contact. The composed
   *  chain must sum to this — `beats sum to the chart's N ✓` in the specs. */
  readonly chartBeats: number;
  readonly chain: readonly CatalogCall[];
  /** Whether the call reads differently for boys and girls (ADR-0003 roles). None
   *  of the starter three do. */
  readonly roleDependent: boolean;
}

/** Where dancer A stands in the pair frame. */
export const PAIR_A: Pose = { position: { x: 0, y: -0.5 }, facing: PLUS_Y };
/** Dancer B is always A rotated 180° about the pair centre. */
export const PAIR_B: Pose = { position: { x: 0, y: 0.5 }, facing: PLUS_Y + 180 };

export const dosado: CallDef = {
  name: "Dosado",
  chartBeats: 6,
  roleDependent: false,
  chain: [
    { block: "pass", params: { direction: "forward", shoulder: "right", exit: "lane" } },
    { block: "slide", params: { side: "right" } },
    // The return mirrors the outbound from the other lane: back straight, then
    // blend diagonally onto home — CALLERLAB's "slide slightly to the left to
    // return", walked as part of the "smooth circular path" (render feedback
    // 2026-07-26; a straight retreat with a sidestep correction read wrong).
    { block: "pass", params: { direction: "backward", shoulder: "left", exit: "close" } },
  ],
};

export const passThru: CallDef = {
  name: "Pass Thru",
  chartBeats: 2,
  roleDependent: false,
  chain: [
    { block: "pass", params: { direction: "forward", shoulder: "right", exit: "centered" } },
  ],
};

export const allemandeLeft: CallDef = {
  name: "Allemande Left",
  chartBeats: 8,
  roleDependent: false,
  chain: [{ block: "arm-turn", params: { hand: "left", fraction: 1, exit: "step-out" } }],
};

export const CALLS = {
  dosado,
  "pass-thru": passThru,
  "allemande-left": allemandeLeft,
} as const;

export type CallName = keyof typeof CALLS;

/** Apply a call in the block-local frame (dancer enters at the origin facing `+y`). */
export function applyCall(name: CallName, start: Pose = ORIGIN): Motion {
  return compose(CALLS[name].chain, start);
}

/** Rotate a pose 180° about the pair centre — how dancer B is derived from A. */
export function counterpart(pose: Pose): Pose {
  return {
    position: { x: round(-pose.position.x), y: round(-pose.position.y) },
    facing: round(normaliseDeg(pose.facing + 180)),
  };
}

/**
 * Both dancers of a facing pair performing a call, in the shared pair frame.
 *
 * B's motion is A's rotated 180°, which is the pair symmetry the specs rely on —
 * so it is derived here rather than generated twice.
 */
export function applyCallToPair(name: CallName): { a: Motion; b: Motion } {
  const a = compose(CALLS[name].chain, PAIR_A);
  const b: Motion = {
    ...a,
    waypoints: a.waypoints.map((w) => ({
      beat: w.beat,
      x: round(-w.x),
      y: round(-w.y),
      facing: round(normaliseDeg(w.facing + 180)),
    })),
    entry: counterpart(a.entry),
    exit: counterpart(a.exit),
    momentum: {
      ...a.momentum,
      bodyFlow:
        a.momentum.bodyFlow === null ? null : rotateBearing(a.momentum.bodyFlow, 180),
    },
  };
  return { a, b };
}

function rotateBearing(b: Degrees, by: Degrees): Degrees {
  return round(normaliseDeg(b + by));
}
