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
 *
 * ## The lane rides inside the arc (ADR-0013)
 *
 * Two dancers walking the same circle in opposite senses meet head-on, and CALLERLAB's
 * Passing Rule says they pass right shoulders **and continue** — an adjustment made
 * inside the walk, not a step before and after it. So `lane` bows the radius rather
 * than adding blocks around the arc: zero at both ends, peaking where the two meet.
 *
 * 🔴 **The first Partner Trade spent a beat sidestepping onto the lane and another
 * stepping off it**, which made the call 6 beats against the chart's 4 and put two
 * beats of pure lateral translation at every call boundary. Rendered, that reads as a
 * standing couple swaying — Ryan, watching `#dance=two-trades`: *"the sway when just
 * standing … 2x too wide and 2X too slow."* It was not a tuning problem. Sideways
 * motion with no forward component is not something the source describes anywhere,
 * and the beats it took were never in the chart.
 */

import { normaliseDeg, polar, rad2deg, round, turnOf } from "../geometry.js";
import type { Motion, Waypoint } from "../types.js";
import type { Hold } from "./types.js";

export interface OrbitParams {
  /** Which way round. `left` is CCW, matching `arm-turn`'s convention. */
  readonly turn: "right" | "left";
  /** Quarter multiples: 0.25, 0.5, 0.75, 1, … */
  readonly fraction: number;
  /** Distance from the shared centre at the arc's **ends**. */
  readonly radius: number;
  /**
   * How far the dancer bows off `radius` on the way past someone walking the same
   * circle the other way. Positive bows **outward**, negative inward; `0` (the
   * default) is the constant-radius arc every use before the Trade family.
   *
   * Zero at both ends and peaking at the middle of the arc, so the dancer leaves and
   * arrives on their own radius and the widest point is where the two meet
   * (ADR-0013). The profile is `sin²`, chosen for the derivative rather than the
   * shape: it is flat at both ends *and* at the peak, which is what keeps the entry
   * and exit facings exactly tangential and the pass exactly shoulder-to-shoulder.
   */
  readonly lane?: number;
  /**
   * A hand joined for the whole arc, when the figure walks the circle **holding on**.
   *
   * Absent — the default, and every use before California Twirl — is the hands-free
   * arc a Trade walks, and that emptiness is a positive fact rather than an omission
   * (F2 asks whether the hand a following call needs is *available*).
   *
   * Present is the beau's half of a California Twirl: the identical arc, with the
   * inside hands joined and raised into an arch the belle walks under. **The path does
   * not change** — which is the point, and is why this is a parameter here rather than
   * a block of its own.
   */
  readonly hold?: Hold;
}

/** A full circle takes the same 8 beats an `arm-turn` does — the timing charts do not
 *  distinguish. A half turn is 4, which is a Partner Trade **entire** (ADR-0013): the
 *  lane rides inside the arc and is charged nothing. */
export const BEATS_PER_TURN = 8;

/** The dancer starts due south of the centre, as `arm-turn` does. */
const START_ANGLE = 270;

/**
 * How often a waypoint is emitted, in turns — **a forty-eighth of a circle, 7.5°**.
 *
 * 🔴 **It was an eighth — 45° — and that is a defect rather than a coarse setting**
 * (ADR-0022). The waypoints are the path: `sampleMotion` runs a straight line between
 * consecutive marks, so what a dancer walks is a **polyline**, and a chord across 45° of arc
 * sags `r(1 − cos 22.5°)` inside the curve — 7.6% of the radius. Everything that reasons about
 * this block reasons about the circle, and none of it was true of the thing being danced.
 *
 * It surfaced through the clearance. `laneForClearance` solves the beau's bow so the couple's
 * *minimum* separation is the room their bodies need; on townage's cast a Partner Trade solved
 * to exactly the 0.710 its heads want, and delivered **0.670** — the sag, to three decimals.
 * Ryan saw it as the figure being tight: *"I looked at `#dance=two-trades` and it's still too
 * tight."*
 *
 * At 7.5° the sag is `3.4e-4 × r`, which is under `round`'s own sixth decimal for any radius
 * this engine uses, so the polyline **is** the arc as far as anything downstream can tell. The
 * cost is waypoints: a half turn carries 25 marks instead of 5.
 *
 * 🔴 Chosen so that **whole beats stay on sample boundaries**. A full turn is 8 beats, so a
 * forty-eighth of a turn is a sixth of a beat and every integer beat is a mark — which the spec
 * fixtures need, since they look their rows up by exact beat.
 */
const SAMPLE_TURNS = 1 / 48;

/**
 * The turns at which this block emits a waypoint, for a given `fraction`.
 *
 * Built as `k / n` rather than by accumulating `+= SAMPLE_TURNS`, because 24 accumulations of
 * a forty-eighth do not land on a half and the fixtures look their rows up by **exact** beat.
 * The final mark is the arc's end whether or not it falls on a boundary, so the last segment
 * may be shorter than the rest.
 */
function sampleTurns(fraction: number): readonly number[] {
  const n = Math.max(1, Math.round(fraction / SAMPLE_TURNS));
  const turns: number[] = [];
  for (let k = 0; k < n; k++) turns.push((k * fraction) / n);
  turns.push(fraction);
  return turns;
}

export const orbit = {
  name: "orbit",

  beats: (params: OrbitParams): number => params.fraction * BEATS_PER_TURN,

  generate(params: OrbitParams): Motion {
    const { turn, fraction, radius, lane = 0, hold } = params;
    if (fraction <= 0) throw new Error("orbit: fraction must be positive");
    if (radius <= 0) throw new Error("orbit: radius must be positive");
    if (radius + Math.min(0, lane) <= 0) {
      throw new Error("orbit: lane must not bow the dancer through the centre");
    }

    const dir = turn === "left" ? 1 : -1; // left = CCW = positive, as `arm-turn`
    const beats = fraction * BEATS_PER_TURN;
    const rotation = dir * fraction * 360;

    // Position angle advances with the walk, at a steady rate; the radius does not,
    // when there is a lane to bow into.
    const angleAt = (turns: number): number => START_ANGLE + dir * turns * 360;
    const radiusAt = (turns: number): number =>
      radius + lane * Math.sin((Math.PI * turns) / fraction) ** 2;
    /** `d(radius)/d(turns)` — the bow's own speed, outward-positive. */
    const radialRate = (turns: number): number =>
      lane * (Math.PI / fraction) * Math.sin((2 * Math.PI * turns) / fraction);

    /**
     * Facing is the **tangent to the path actually walked**, not to the circle.
     *
     * With no lane those are the same thing and this reduces to the position angle a
     * quarter ahead in the direction of travel — `radialRate` is exactly `0`, the
     * crab term is exactly `0`, and every pre-lane vector is untouched.
     *
     * With a lane they differ, and the difference is the point: a dancer bowing out
     * is travelling slightly outward as well as round, and *walking forward* means
     * facing where they are actually going. Decomposing the velocity in the local
     * (radial, tangential) basis, the bearing of travel is `atan2(tangential,
     * radial)`, and the crab is how far that sits off the pure tangent.
     */
    const facingAt = (turns: number): number => {
      const radial = radialRate(turns);
      const tangential = dir * 2 * Math.PI * radiusAt(turns);
      const crab =
        radial === 0 ? 0 : rad2deg(Math.atan2(tangential, radial)) - dir * 90;
      return angleAt(turns) + dir * 90 + crab;
    };

    const at = (turns: number): Waypoint => {
      const p = polar(radiusAt(turns), angleAt(turns));
      return {
        beat: round(turns * BEATS_PER_TURN),
        x: round(p.x),
        y: round(p.y),
        // Rounded **before** normalising, not after. A bowed arc's closing facing lands
        // a float's breath below its cardinal — the crab term returns to zero through
        // `Math.sin(2π)`, which is −2.4e-16 rather than 0 — and normalising first sent
        // that to 359.999…, which `round` then reported as a facing of `360`. Outside
        // `normaliseDeg`'s own `[0, 360)` contract, and it made an exit facing that
        // should have been identical to the lane-free one differ by a whole turn.
        facing: normaliseDeg(round(facingAt(turns))),
      };
    };

    const marks = sampleTurns(fraction);
    const waypoints: Waypoint[] = marks.map((turns) => at(turns));

    const entry = at(0);
    const exit = at(fraction);

    return {
      beats: round(beats),
      waypoints,
      // Hands free for the whole arc unless the figure names one — a positive fact for
      // F2, which asks whether the hand a following call needs is *available*. A Trade
      // leaves both available, and that is exactly what makes it flow into anything; a
      // California Twirl walks the same arc with the inside hand joined throughout.
      grips: hold === undefined
        ? []
        : [{ hand: hold.hand, grip: hold.grip, from: 0, to: round(beats) }],
      entry: { position: { x: entry.x, y: entry.y }, facing: entry.facing },
      exit: { position: { x: exit.x, y: exit.y }, facing: exit.facing },
      momentum: {
        rotation,
        roll: turnOf(rotation),
        bodyFlow: exit.facing,
        // What *finished* engaged, which is the hand held to the last beat, or none.
        lastHand: hold?.hand ?? "none",
      },
    };
  },
} as const;
