/**
 * `step-pivot` — step to one side while turning on the spot.
 *
 * Spec: `docs/spec/blocks/step-pivot.md`. The belle's half of a Partner Trade, and the
 * catalog's first block whose travel is lateral **on purpose**.
 *
 * ## Why this is not `slide`, and why that matters
 *
 * [`slide`](slide.ts) is "sidestep laterally **without turning**", one beat, one fixed
 * distance. Every one of those three is wrong here, and the third is a trap this catalog
 * has already fallen into once: a `distance` parameter was added to `slide` for Partner
 * Trade on 2026-08-15 and removed the next day by ADR-0013, because charging a flat beat
 * for a sixth of a Dosado's crossing made the step crawl. `slide`'s own doc leaves the
 * standing instruction — *"if the Dodge family needs partial slides, design the parameter
 * **and its timing** together."*
 *
 * So this block is timed by its **rotation**, not by its distance: `BEATS_PER_TURN`, the
 * same 8 that `orbit` and `arm-turn` use, of which a half turn is 4 — a Partner Trade
 * entire. The distance rides inside that budget the way ADR-0013's lane rides inside an
 * arc, and a wider couple's belle covers more ground in the same beats, which is what
 * stepping across a wider couple *is*.
 *
 * ## Lateral travel is not sway, when the dancer is turning
 *
 * The Trade's render watch (2026-08-16) produced the invariant *every step has a forward
 * component*, because two beats of pure lateral translation **with the facing constant**
 * read on screen as a standing couple swaying. The cure was right and the invariant
 * over-stated the reason: what makes sway read as sway is the **absence of turning**, not
 * the presence of sideways travel. Here the dancer rotates through the whole step, so by
 * the middle of it the direction she is travelling *is* her forward. See ADR-0014.
 *
 * ## Frame
 *
 * The catalog's ordinary block-local frame, as `pass` and `slide` use and unlike `orbit`:
 * the dancer enters at the origin facing `+y`. `side` is their own left or right, so a
 * dancer facing `+y` stepping `left` moves toward `−x`.
 *
 * Position is **linear** in the beat and facing turns at a steady rate, so the midpoint of
 * the step is the midpoint of the travel and of the turn at once. That coincidence is what
 * a Partner Trade's right-shoulder pass is asserted against, and easing either one would
 * move the pass off the middle of the call for no reason the source describes.
 */

import { PLUS_Y, normaliseDeg, round, turnOf } from "../geometry.js";
import type { Motion, Waypoint } from "../types.js";
import type { Hold } from "./types.js";

export interface StepPivotParams {
  /** Which way the dancer steps — their **own** left or right. */
  readonly side: "right" | "left";
  /** How far they step, in engine units. `0` is a pivot on the spot. */
  readonly distance: number;
  /** Which way they turn. `left` is CCW, matching `orbit` and `arm-turn`. */
  readonly turn: "right" | "left";
  /** Quarter multiples of the turn. A Partner Trade's belle is `0.5`. */
  readonly fraction: number;
  /**
   * A hand joined for the whole step, when the figure steps across **holding on**.
   *
   * Absent is a Partner Trade's belle, who lets go and takes nothing. Present is a
   * California Twirl's: the identical step and pivot, with her inside hand joined to
   * the beau's and raised — so what she is walking under is her own held hand, and the
   * step across is the duck under the arch. The path is the same either way, which is
   * why the hold is a parameter and not a second block.
   */
  readonly hold?: Hold;
}

/** The catalog's shared rotation budget: a full turn is 8 beats, a half 4. Same number
 *  `orbit` and `arm-turn` use, because the timing charts do not distinguish. */
export const BEATS_PER_TURN = 8;

/** How often a waypoint is emitted, in turns — every eighth of a circle, matching
 *  `orbit`, so a Trade's two sides are sampled at the same beats and can be compared
 *  waypoint for waypoint. */
const SAMPLE_TURNS = 0.125;

export const stepPivot = {
  name: "step-pivot",

  beats: (params: StepPivotParams): number => params.fraction * BEATS_PER_TURN,

  generate(params: StepPivotParams): Motion {
    const { side, distance, turn, fraction, hold } = params;
    if (fraction <= 0) throw new Error("step-pivot: fraction must be positive");
    if (distance < 0) {
      throw new Error("step-pivot: distance must not be negative — use `side` for direction");
    }

    const dir = turn === "left" ? 1 : -1;
    const beats = fraction * BEATS_PER_TURN;
    const rotation = dir * fraction * 360;
    // A dancer facing `+y` has their left toward `−x`.
    const dx = (side === "right" ? 1 : -1) * distance;

    const at = (turns: number): Waypoint => {
      const t = turns / fraction;
      return {
        beat: round(turns * BEATS_PER_TURN),
        x: round(dx * t),
        y: 0,
        // Rounded before normalising, for the reason `orbit` gives: a closing facing that
        // lands a float's breath below its cardinal normalises to 359.999… and rounds to
        // a facing of 360, outside `normaliseDeg`'s own contract.
        facing: normaliseDeg(round(PLUS_Y + dir * turns * 360)),
      };
    };

    const waypoints: Waypoint[] = [at(0)];
    for (let turns = SAMPLE_TURNS; turns < fraction - 1e-9; turns += SAMPLE_TURNS) {
      waypoints.push(at(turns));
    }
    waypoints.push(at(fraction));

    const entry = at(0);
    const exit = at(fraction);

    return {
      beats: round(beats),
      // Hands free unless the figure names one. The belle's Partner Trade releases the
      // handhold and takes nothing — the F2 fact that lets a Trade flow into anything is
      // true of this half too. Her California Twirl keeps it, and it is the same step.
      grips: hold === undefined
        ? []
        : [{ hand: hold.hand, grip: hold.grip, from: 0, to: round(beats) }],
      waypoints,
      entry: { position: { x: entry.x, y: entry.y }, facing: entry.facing },
      exit: { position: { x: exit.x, y: exit.y }, facing: exit.facing },
      momentum: {
        rotation,
        roll: turnOf(rotation),
        // Along the final facing, as `orbit`'s is — the dancer finishes turning into the
        // way they are going, which is the whole point of the pivot. Not the lateral
        // vector `slide` reports, because by the exit the step is no longer lateral.
        bodyFlow: exit.facing,
        // What *finished* engaged, which is the hand held to the last beat, or none.
        lastHand: hold?.hand ?? "none",
      },
    };
  },
} as const;
