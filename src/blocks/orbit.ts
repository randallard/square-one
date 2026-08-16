/**
 * `orbit` — walk forward around a shared centre, hands free.
 *
 * Spec: `docs/spec/blocks/orbit.md`. The catalog's second rotating block, and the
 * first that rotates without engaging a hand.
 *
 * ## Why this is not `arm-turn` with the grip turned off
 *
 * The obvious reading of the Trade family is "an arm turn without the arms", and it
 * is wrong by a radius. `arm-turn` has the dancers **step in** from `ENTRY_RADIUS`
 * 0.5 to `ORBIT_RADIUS` 0.3, because that is what joining forearms costs — its own
 * module doc opens "two dancers join forearms and walk forward around their common
 * pivot". A Trade's dancers never close that gap: they walk the circle they are
 * already standing on.
 *
 * So the relationship runs the other way round. **`orbit` is the primitive and an arm
 * turn is `orbit` plus a grip plus the step-in** — which is the shape Ryan picked
 * ("go with cleaner") over adding a `grip` parameter to `arm-turn`.
 *
 * 🔴 **`arm-turn` is deliberately not refactored onto this.** It is render-validated
 * (2026-07-27, the Allemande's CCW turn) and this family's rule is not to disturb
 * validated geometry to satisfy a tidier decomposition. What is here instead is a test
 * asserting that `orbit` reproduces `arm-turn`'s orbital arc at the same radius, so
 * the claim above is checked rather than asserted, and a future refactor starts from
 * evidence.
 *
 * ## Frame
 *
 * Pivot-centred, like `arm-turn`: the shared centre is the origin and the dancer
 * enters standing off it at `radius`. Unlike `arm-turn` the entry facing is
 * **tangential**, because there is no step-in to turn out of — a dancer walking a
 * circle is facing the way they are going from the first beat.
 */

import { normaliseDeg, polar, round, turnOf } from "../geometry.js";
import type { Motion, Waypoint } from "../types.js";

export interface OrbitParams {
  /** Which way round. `left` is CCW, matching `arm-turn`'s convention. */
  readonly turn: "right" | "left";
  /** Quarter multiples: 0.25, 0.5, 0.75, 1, … */
  readonly fraction: number;
  /** Distance from the shared centre. Constant for the whole arc. */
  readonly radius: number;
}

/** A full circle takes the same 8 beats an `arm-turn` does — the timing charts do not
 *  distinguish, and a Trade's 4 beats for a half turn is exactly this rate. */
export const BEATS_PER_TURN = 8;

/** The dancer starts due south of the centre, as `arm-turn` does. */
const START_ANGLE = 270;

/** How often a waypoint is emitted, in turns. Every eighth of a circle — twice
 *  `arm-turn`'s quarter, because nothing steps in here to mark the arc's start and a
 *  half turn would otherwise carry only three points. */
const SAMPLE_TURNS = 0.125;

export const orbit = {
  name: "orbit",

  beats: (params: OrbitParams): number => params.fraction * BEATS_PER_TURN,

  generate(params: OrbitParams): Motion {
    const { turn, fraction, radius } = params;
    if (fraction <= 0) throw new Error("orbit: fraction must be positive");
    if (radius <= 0) throw new Error("orbit: radius must be positive");

    const dir = turn === "left" ? 1 : -1; // left = CCW = positive, as `arm-turn`
    const beats = fraction * BEATS_PER_TURN;
    const rotation = dir * fraction * 360;

    // Position angle and facing both advance with the walk. Facing is tangential —
    // the dancer goes where they are looking — so it is the position angle a quarter
    // ahead in the direction of travel, and the facing delta equals the arc swept.
    const angleAt = (turns: number): number => START_ANGLE + dir * turns * 360;
    const facingAt = (turns: number): number => angleAt(turns) + dir * 90;

    const at = (turns: number): Waypoint => {
      const p = polar(radius, angleAt(turns));
      return {
        beat: round(turns * BEATS_PER_TURN),
        x: round(p.x),
        y: round(p.y),
        facing: round(normaliseDeg(facingAt(turns))),
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
      waypoints,
      // Hands free for the whole arc — a positive fact for F2, which asks whether the
      // hand a following call needs is *available*. A Trade leaves both available,
      // and that is exactly what makes it flow into anything.
      grips: [],
      entry: { position: { x: entry.x, y: entry.y }, facing: entry.facing },
      exit: { position: { x: exit.x, y: exit.y }, facing: exit.facing },
      momentum: {
        rotation,
        roll: turnOf(rotation),
        bodyFlow: exit.facing,
        lastHand: "none",
      },
    };
  },
} as const;
