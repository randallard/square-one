/**
 * Composition: a call is a chain of blocks (ADR-0005), and so is a custom move.
 *
 * Each block emits its path in a local frame entered at the origin facing `+y`.
 * Composing means embedding block *k*'s frame onto block *k−1*'s exit pose, then
 * concatenating on the beat axis.
 */

import {
  PLUS_Y,
  deg2rad,
  normaliseDeg,
  round,
  turnOf,
  type Degrees,
} from "./geometry.js";
import { generateBlock, type CatalogCall } from "./blocks/index.js";
import type { ChainDefect } from "./blocks/types.js";
import type { Motion, Pose, Waypoint } from "./types.js";

/** The pose a chain starts from, when it isn't the default local frame. */
export const ORIGIN: Pose = { position: { x: 0, y: 0 }, facing: PLUS_Y };

function rotatePoint(x: number, y: number, byDeg: Degrees): { x: number; y: number } {
  const a = deg2rad(byDeg);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: x * c - y * s, y: x * s + y * c };
}

/**
 * Place a block-local motion into a parent frame so its **entry pose** lands on
 * `at`.
 *
 * Aligning on `entry` rather than on the local origin is what lets blocks use
 * different frame conventions — `arm-turn` is grip-centred, `pass` and `slide` are
 * dancer-centred — without the chain developing a gap where they meet.
 */
export function embed(motion: Motion, at: Pose, beatOffset: number): Motion {
  const rot = at.facing - motion.entry.facing;
  const origin = motion.entry.position;

  // Rotate about the entry point, then translate that point onto `at`.
  const place = (x: number, y: number): { x: number; y: number } => {
    const p = rotatePoint(x - origin.x, y - origin.y, rot);
    return { x: p.x + at.position.x, y: p.y + at.position.y };
  };

  const waypoints = motion.waypoints.map((w): Waypoint => {
    const p = place(w.x, w.y);
    return {
      beat: round(w.beat + beatOffset),
      x: round(p.x),
      y: round(p.y),
      facing: round(normaliseDeg(w.facing + rot)),
    };
  });

  const e = place(motion.exit.position.x, motion.exit.position.y);

  return {
    beats: motion.beats,
    waypoints,
    entry: at,
    exit: {
      position: { x: round(e.x), y: round(e.y) },
      facing: round(normaliseDeg(motion.exit.facing + rot)),
    },
    momentum: {
      ...motion.momentum,
      bodyFlow:
        motion.momentum.bodyFlow === null
          ? null
          : round(normaliseDeg(motion.momentum.bodyFlow + rot)),
    },
  };
}

/**
 * Chain a sequence of blocks into a single motion.
 *
 * Waypoints at a block boundary are deduplicated: block *k+1*'s beat-0 waypoint is
 * by construction block *k*'s exit, so keeping both would double-count the instant.
 */
export function compose(chain: readonly CatalogCall[], start: Pose = ORIGIN): Motion {
  if (chain.length === 0) {
    return {
      beats: 0,
      waypoints: [{ beat: 0, x: start.position.x, y: start.position.y, facing: start.facing }],
      entry: start,
      exit: start,
      momentum: { rotation: 0, roll: null, bodyFlow: null, lastHand: "none" },
    };
  }

  const waypoints: Waypoint[] = [];
  let at = start;
  let beatOffset = 0;
  let rotation = 0;
  let last: Motion | undefined;

  for (const step of chain) {
    const placed = embed(generateBlock(step), at, beatOffset);
    // Drop the leading waypoint on every block after the first — it repeats the
    // previous block's exit instant.
    waypoints.push(...(waypoints.length === 0 ? placed.waypoints : placed.waypoints.slice(1)));
    rotation += placed.momentum.rotation;
    beatOffset += placed.beats;
    at = placed.exit;
    last = placed;
  }

  /* v8 ignore next -- chain is non-empty here, so `last` is always assigned */
  if (last === undefined) throw new Error("compose: unreachable");

  return {
    beats: round(beatOffset),
    waypoints,
    entry: start,
    exit: at,
    momentum: {
      // Accumulated across the whole chain — F4 measures same-direction rotation
      // across transitions, so this must not be reduced to the final block's share.
      rotation: round(rotation),
      // Roll is what you were doing *at the end*, so it comes from the last block.
      roll: turnOf(last.momentum.rotation),
      bodyFlow: last.momentum.bodyFlow,
      lastHand: last.momentum.lastHand,
    },
  };
}

/**
 * Check that each block's exit satisfies the next block's entry contract.
 *
 * v1 checks the mechanical part: blocks meet in space. The richer contracts
 * ("a counterpart facing this dancer within reach") need square-level state and
 * land with formation recognition.
 */
export function checkChain(chain: readonly CatalogCall[], start: Pose = ORIGIN): ChainDefect[] {
  const defects: ChainDefect[] = [];
  let at = start;
  let beatOffset = 0;

  chain.forEach((step, index) => {
    const placed = embed(generateBlock(step), at, beatOffset);
    const head = placed.waypoints[0];

    if (head !== undefined) {
      const gap = Math.hypot(head.x - at.position.x, head.y - at.position.y);
      if (gap > 1e-6) {
        defects.push({
          index,
          block: step.block,
          reason: `starts ${gap.toFixed(3)} from the previous exit`,
        });
      }
    }

    at = placed.exit;
    beatOffset += placed.beats;
  });

  return defects;
}
