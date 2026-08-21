/**
 * `pass` — move past a counterpart without turning.
 *
 * Spec: `docs/spec/blocks/pass.md`. The atom of Dosado, Pass Thru, and every
 * "pass right/left shoulders" action.
 */

import { PLUS_Y, atLeast, normaliseDeg, round } from "../geometry.js";
import type { Motion } from "../types.js";

export interface PassParams {
  readonly direction: "forward" | "backward";
  readonly shoulder: "right" | "left";
  /** `lane` ends in the offset lane (a lateral block follows — Dosado's
   *  outbound); `centered` traces a shallow S back onto the centre line, ending
   *  on the counterpart's former spot (the call is over — Pass Thru); `close`
   *  finishes a figure: travel the line, then blend diagonally one lane toward
   *  the brushing shoulder on the final beat (Dosado's return — CALLERLAB's
   *  "slide slightly to the left to return", walked as part of the smooth
   *  circular path rather than stepped as a correction). `close` takes 3 beats;
   *  the others 2. */
  readonly exit: "lane" | "centered" | "close";
  /**
   * How much room the two dancers need to pass each other — **a body measurement**,
   * and the only one this block takes (ADR-0020).
   *
   * The two of them split it: each steps half of it into their own lane, so a
   * `clearance` of `c` leaves them `c` apart at the pass. Omitted — the ordinary case,
   * and every use before ADR-0020 — is {@link PASS_CLEARANCE}, the gap the figure is
   * drawn with.
   *
   * 🔴 **A clearance smaller than the figure's own is ignored** (ADR-0021): two dancers who
   * can pass in less room than a Dosado is drawn with still dance the Dosado. This only ever
   * widens the lane.
   *
   * 🔴 **It costs no beats, and that is the same trade `step-pivot` makes.** A wider
   * pass is a longer stride inside the chart's timing, not a slower one — the lane rides
   * inside the walk exactly as ADR-0013's bow rides inside the arc. What ADR-0013 threw
   * out was a *sidestep block* charged a flat beat for a sixth of a Dosado's distance,
   * which is the opposite failure.
   */
  readonly clearance?: number;
}

/** Half the gap between the two lanes. A right-shoulder pass shifts each dancer
 *  into their own *left* lane, which is `-x` when facing `+y`. */
export const LANE_OFFSET = 0.15;

/**
 * The room the figure itself gives two dancers to pass in: both lanes, so twice
 * {@link LANE_OFFSET}.
 *
 * The floor under {@link PassParams.clearance} and the number a consumer's own
 * measurement is compared against. townage has been deriving its whole frame scale from
 * this constant since its ADR-0012 — `minScaleForGap` divides by `2 × ENGINE_LANE_OFFSET`
 * — which is the same fact stated from the other side: with the lane fixed, the only way
 * to give bodies room was to make the floor bigger. Passing a clearance is the way that
 * does not move everybody else.
 */
export const PASS_CLEARANCE = 2 * LANE_OFFSET;

export const pass = {
  name: "pass",
  beats: (params: PassParams): number => (params.exit === "close" ? 3 : 2),

  generate(params: PassParams): Motion {
    // Right shoulders pass ⇒ each dancer shifts to their own left ⇒ -x. Half the
    // clearance each, because both of them step: the pair end `clearance` apart.
    const offset = atLeast(PASS_CLEARANCE, params.clearance) / 2;
    const lane = (params.shoulder === "right" ? -1 : 1) * offset;
    // A backward lane pass holds its lane and travels dead straight. The veer
    // into the lane is not this block's job: per the entry contract the dancer
    // is *already* laterally clear of the counterpart (in Dosado, the slide put
    // them there), and backing while drifting wider reads as leaving the set.
    // The first model here — "backward is the time-reversal of the forward
    // pass" — was plausible and wrong: time-reversing from an entry that is
    // already displaced re-applies the veer outward, bulging the dancer to
    // twice the lane offset on the closing beat. Invisible in the endpoint
    // maths, invisible in the spec table (which skipped beat 5), and caught by
    // the first human render watch (townage, 2026-07-26).
    const forward = params.direction === "forward";
    const dir = forward ? 1 : -1;

    let rows: readonly (readonly [number, number, number])[];
    if (params.exit === "close") {
      // The figure-ending pass. Dosado's dance action is "walking a smooth
      // circular path … slide slightly to the left to return to their starting
      // position" (CALLERLAB Basic definitions, Dosado): the slight closing
      // lateral is *walked*, blended into the final beat as the opening veer
      // mirrored from the other side — not a straight retreat with a sidestep
      // correction bolted on (render feedback, 2026-07-26). Backing covers
      // less ground per beat than walking, so the straight portion takes two
      // beats for the same 0.4.
      const drift = -lane; // one lane toward the brushing shoulder = toward home
      rows = forward
        ? [[0, 0, 0], [1, lane, 0.4], [2, lane, 0.6], [3, lane, 0.8]]
        : [[0, 0, 0], [1, 0, -0.2], [2, 0, -0.4], [3, drift, -0.8]];
    } else {
      // The lateral schedule. `centered` traces a symmetric S, so it reads the
      // same in either direction.
      const xs: readonly [number, number, number] =
        params.exit === "lane" ? (forward ? [0, lane, lane] : [0, 0, 0]) : [0, lane, 0];

      const ys: readonly [number, number, number] =
        params.exit === "lane" ? [0, dir * 0.4, dir * 0.8] : [0, dir * 0.5, dir * 1.0];

      rows = [
        [0, xs[0], ys[0]],
        [1, xs[1], ys[1]],
        [2, xs[2], ys[2]],
      ];
    }

    const waypoints = rows.map(([beat, x, y]) => ({
      beat,
      x: round(x),
      y: round(y),
      facing: PLUS_Y, // facing never changes during a pass
    }));

    const last = waypoints[waypoints.length - 1];
    const prev = waypoints[waypoints.length - 2];
    /* v8 ignore next 2 -- rows is a non-empty literal; this is a type narrowing only */
    if (last === undefined || prev === undefined)
      throw new Error("pass: empty waypoints");

    // Exit flow follows the final segment: straight ahead/back for lane and
    // centered exits, the closing diagonal's true bearing for `close`.
    const bodyFlow =
      params.exit === "close"
        ? round(normaliseDeg((Math.atan2(last.y - prev.y, last.x - prev.x) * 180) / Math.PI))
        : forward
          ? PLUS_Y
          : PLUS_Y - 180;

    return {
      beats: pass.beats(params),
      waypoints,
      grips: [], // hands stay free — F2-positive, per the Dosado definition

      entry: { position: { x: 0, y: 0 }, facing: PLUS_Y }, // dancer-centred frame
      exit: { position: { x: last.x, y: last.y }, facing: PLUS_Y },
      momentum: {
        rotation: 0,
        roll: null, // no turning motion — CALLERLAB lists Pass Thru as cannot-roll
        bodyFlow,
        lastHand: "none",
      },
    };
  },
} as const;
