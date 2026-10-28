/**
 * `pull-by` — take hands with the dancer you are facing and pass them, letting go on the way.
 *
 * Spec: `docs/spec/blocks/pull-by.md`. The first half of Right and Left Thru (2026-10-28), and
 * the action Right and Left Grand and Square Thru repeat.
 *
 * CALLERLAB (Basic, *Pull By*): *"dancers take right hands as if they were going to shake hands,
 * exert a momentary, gentle pull to initiate forward motion, and perform a Pass Thru action. As
 * the dancers pass each other, the handhold is released"* — and, from the styling glossary,
 * *"hands should be dropped before bodies cross a common plane."*
 *
 * ## Why this is not `pass` with a hold
 *
 * A {@link Hold} is joined for a whole block (`blocks/types.ts`): no figure in the catalog took
 * hands part way through one, and a partial span would be a second timeline inside the block's
 * own. A pull-by is exactly that figure — the hand is let go of **inside** the walk, before the
 * two of them are level — so it owns its grip span rather than borrowing `hold`. The walk is a
 * Pass Thru's, which is the definition's own words.
 *
 * ## The lane, and the drift
 *
 * Passing the named hand's shoulder, each dancer steps half of `clearance` to the other side, as
 * `pass` does. Unlike `pass`'s three-point S the lateral profile is `sin²` of the walk, sampled
 * every thirty-second of a beat: zero and flat at both ends, so the dancer leaves and arrives facing
 * straight ahead with no kink, and widest at the crossing — `orbit`'s lane, for the same reasons
 * (ADR-0013).
 *
 * `drift` is a second sideways move on the same profile, which the dancer's neighbours ask for
 * rather than the dancer they are passing. From facing couples the two belles pass the two beaus
 * **side by side**: each pair's lane moves the belles toward the middle of the set, and two lanes
 * there can put the belles into each other. The formation hands each dancer the drift that keeps
 * the couple wide enough (`facing-couples.ts`); the block only walks it.
 */

import { PLUS_Y, atLeast, round } from "../geometry.js";
import type { Motion, Waypoint } from "../types.js";
import { PAIR_SEPARATION, PASS_CLEARANCE } from "./pass.js";

export interface PullByParams {
  /** Which hand is taken, and therefore which shoulders pass: a Right Pull By passes right. */
  readonly hand: "right" | "left";
  /** How far the dancer walks, to the spot the other one left. Default {@link PAIR_SEPARATION}. */
  readonly distance?: number;
  /**
   * How much room the two need to pass, split between them, as `pass`'s. Floored at
   * {@link PASS_CLEARANCE}: a pull-by is never tighter than a Pass Thru (ADR-0021).
   */
  readonly clearance?: number;
  /**
   * Extra sideways travel at the crossing, in the dancer's own frame: **positive is to their
   * right**. On the lane's profile, so it costs no beats and is gone again at the end.
   */
  readonly drift?: number;
}

/** A Pass Thru's beats: the chart times a Right Pull By as the Pass Thru it is. */
export const PULL_BY_BEATS = 2;

/**
 * When the hands let go, in beats: a quarter beat before the two are level.
 *
 * *"Hands should be dropped before bodies cross a common plane"* — and townage, solving the arms
 * for four bodies, found the same thing from the other side (its journal 2026-10-28-2): held to
 * the crossing or past it, the joined hands trail behind both dancers and drag them back.
 */
export const PULL_BY_RELEASE = PULL_BY_BEATS / 2 - 0.25;

/**
 * Waypoints every thirty-second of a beat, so the `sin²` lane is a curve and not a V.
 *
 * 🔴 A quarter beat was not enough, for ADR-0022's reason: `sampleMotion` walks straight lines
 * between marks, and a chord across the lane's peak cuts inside it. At a quarter beat two dancers
 * given 0.300 to pass passed at **0.295**; a sixteenth still lost 0.5% on a lane as wide as the
 * walk is long (0.791 for 0.795). At a thirty-second the polyline is the curve to 0.1%.
 */
const SAMPLES = 64;

export const pullBy = {
  name: "pull-by",

  beats: (): number => PULL_BY_BEATS,

  generate(params: PullByParams): Motion {
    const { hand, distance = PAIR_SEPARATION, drift = 0 } = params;
    if (!(distance > 0)) throw new Error("pull-by: distance must be positive");
    // Passing right shoulders, each dancer moves to their own left, which is `−x` facing `+y`.
    const half = atLeast(PASS_CLEARANCE, params.clearance) / 2;
    const lateral = (hand === "right" ? -half : half) + drift;

    const waypoints: Waypoint[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      waypoints.push({
        beat: round(t * PULL_BY_BEATS),
        x: round(lateral * Math.sin(Math.PI * t) ** 2),
        y: round(distance * t),
        facing: PLUS_Y,
      });
    }

    return {
      beats: PULL_BY_BEATS,
      waypoints,
      grips: [{ hand, grip: "palm", from: 0, to: PULL_BY_RELEASE, relation: "opposite" }],
      entry: { position: { x: 0, y: 0 }, facing: PLUS_Y },
      exit: { position: { x: 0, y: round(distance) }, facing: PLUS_Y },
      momentum: {
        rotation: 0,
        // A Pass Thru: no turning, so nothing to Roll.
        roll: null,
        bodyFlow: PLUS_Y,
        lastHand: hand,
      },
    };
  },
} as const;
