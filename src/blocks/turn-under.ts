/**
 * `turn-under` — two dancers with joined hands rotate about them, one passing beneath.
 *
 * Spec: `docs/spec/blocks/turn-under.md`. The arch figure: California Twirl, Star Thru
 * and Box the Gnat are all this block with different parameters, which is the
 * prediction ADR-0005's "the catalog makes later calls cheaper" bet is being tested on.
 *
 * ## Why the pivot side is a parameter and the facing is not tangential
 *
 * [`orbit`](orbit.ts) assumes the dancer walks **forward** around the centre, so its
 * facing is tangential and the pivot is implicitly on one side. That works for a facing
 * pair and breaks for a couple: two dancers of a couple stand on opposite sides of their
 * joined hands and face the **same** way, so the pivot is on one dancer's right and the
 * other's left. A tangential-facing block cannot express both.
 *
 * So the frame here is stated the other way round. The dancer enters at `(±radius, 0)`
 * facing `+y` — the catalog's ordinary block-local forward, as `pass` and `slide` use —
 * and `pivot` says which side the joined hands are on. Facing then rotates **rigidly**
 * with the body rather than following the path, which is what "the couple turns around"
 * means and what distinguishes this from walking a circle.
 *
 * ## The spin is the whole difference between the two dancers
 *
 * Both end facing the same way and in each other's spots. The dancer passing under the
 * arch takes an extra full turn getting there, and that shows up in `momentum.rotation`
 * rather than in the end pose — which is exactly where F4 wants it, since accumulated
 * same-direction rotation is what the flow rules watch.
 */

import { PLUS_Y, normaliseDeg, polar, round, turnOf } from "../geometry.js";
import type { GripSpan, GripStyle, Motion, Waypoint } from "../types.js";

export interface TurnUnderParams {
  /** Which side of the dancer the joined hands are on. */
  readonly pivot: "right" | "left";
  /** Which way the pair rotates. `left` is CCW, matching `orbit` and `arm-turn`. */
  readonly turn: "right" | "left";
  /** Quarter multiples of the shared rotation. A California Twirl is `0.5`. */
  readonly fraction: number;
  /** Distance from the joined hands. */
  readonly radius: number;
  /**
   * Extra self-rotation, in whole turns, for the dancer passing beneath the arch.
   *
   * `0` is the dancer making the arch. `1` is the dancer going under it. Adds to the
   * accumulated rotation and cancels in the end facing, because a full turn is a full
   * turn — which is why the two dancers finish alike and travel differently.
   */
  readonly spin?: number;
  /** The joined hand, for the F2 grip channel. */
  readonly hand: "right" | "left";
  /**
   * How that hand is held — the **handhold**, and therefore how a consumer draws it.
   *
   * 🔴 **Defaults to `arch`, and used to emit `forearm` with no way to say otherwise.**
   * This block's own first line is *"two dancers with joined hands rotate about them, one
   * passing beneath the other's raised arch"* — palms joined and raised clear of the head
   * is the only hold a dancer can walk under, and a forearm grip is at elbow height. The
   * value was written before `arch` existed (ADR-0017 added it to {@link GripStyle}) and
   * nothing caught it, because this block has never had a consumer. A parameter rather
   * than a fixed `arch` because the Box the Gnat family joins right hands palm to palm
   * and the arch family will not be the only one here (ADR-0020).
   */
  readonly grip?: GripStyle;
}

/** A full shared rotation takes 8 beats, as `orbit` and `arm-turn` do. */
export const BEATS_PER_TURN = 8;

/** Waypoints every eighth of the shared rotation. */
const SAMPLE_TURNS = 0.125;

export const turnUnder = {
  name: "turn-under",

  beats: (params: TurnUnderParams): number => params.fraction * BEATS_PER_TURN,

  generate(params: TurnUnderParams): Motion {
    const { pivot, turn, fraction, radius, hand, grip = "arch" } = params;
    const spin = params.spin ?? 0;
    if (fraction <= 0) throw new Error("turn-under: fraction must be positive");
    if (radius <= 0) throw new Error("turn-under: radius must be positive");
    if (spin < 0) throw new Error("turn-under: spin must not be negative");

    const dir = turn === "left" ? 1 : -1;
    const beats = fraction * BEATS_PER_TURN;
    // Hands stay joined, so the pair turns together: the shared rotation. The spin is
    // this dancer's own, on top of it.
    const shared = dir * fraction * 360;
    const rotation = shared + dir * spin * 360;

    // The dancer stands beside the joined hands, on the far side from them: pivot on
    // the right means the dancer is to the pivot's left, at −x.
    const startAngle = pivot === "right" ? 180 : 0;

    const at = (t: number): Waypoint => {
      const p = polar(radius, startAngle + dir * t * fraction * 360);
      return {
        beat: round(t * beats),
        x: round(p.x),
        y: round(p.y),
        // Rigid: the facing turns with the body through the shared rotation, plus this
        // dancer's own spin. Not tangential — that is `orbit`'s model, not this one.
        facing: round(normaliseDeg(PLUS_Y + t * rotation)),
      };
    };

    const waypoints: Waypoint[] = [at(0)];
    const step = SAMPLE_TURNS / fraction;
    for (let t = step; t < 1 - 1e-9; t += step) waypoints.push(at(t));
    waypoints.push(at(1));

    const entry = at(0);
    const exit = at(1);

    const grips: readonly GripSpan[] = [{ hand, grip, from: 0, to: round(beats) }];

    return {
      beats: round(beats),
      waypoints,
      grips,
      entry: { position: { x: entry.x, y: entry.y }, facing: entry.facing },
      exit: { position: { x: exit.x, y: exit.y }, facing: exit.facing },
      momentum: {
        rotation,
        roll: turnOf(rotation),
        bodyFlow: exit.facing,
        lastHand: hand,
      },
    };
  },
} as const;
