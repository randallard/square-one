/**
 * `pass` — move past a counterpart without turning.
 *
 * Spec: `docs/spec/blocks/pass.md`. The atom of Dosado, Pass Thru, and every
 * "pass right/left shoulders" action.
 */

import { PLUS_Y, round } from "../geometry.js";
import type { Motion } from "../types.js";

export interface PassParams {
  readonly direction: "forward" | "backward";
  readonly shoulder: "right" | "left";
  /** `lane` ends in the offset lane (a lateral block follows — Dosado); `centered`
   *  traces a shallow S back onto the centre line, ending on the counterpart's
   *  former spot (the call is over — Pass Thru). */
  readonly exit: "lane" | "centered";
}

/** Half the gap between the two lanes. A right-shoulder pass shifts each dancer
 *  into their own *left* lane, which is `-x` when facing `+y`. */
export const LANE_OFFSET = 0.15;

const BEATS = 2;

export const pass = {
  name: "pass",
  beats: (): number => BEATS,

  generate(params: PassParams): Motion {
    // Right shoulders pass ⇒ each dancer shifts to their own left ⇒ -x.
    const lane = (params.shoulder === "right" ? -1 : 1) * LANE_OFFSET;
    // Backing up is a full **time-reversal** of the forward pass, not merely a
    // negated y-progression. Forward, you veer into the lane as you set off and
    // hold it; reversed, you travel straight and the veer lands on the closing
    // beat. Getting this wrong is invisible at the endpoints — the exit pose is
    // identical either way — and only shows up mid-block, which is exactly where
    // Dosado's documented table caught it.
    const forward = params.direction === "forward";
    const dir = forward ? 1 : -1;

    // The lateral schedule. `centered` traces a symmetric S, so it is its own
    // time-reversal and does not vary with direction.
    const xs: readonly [number, number, number] =
      params.exit === "lane" ? (forward ? [0, lane, lane] : [0, 0, lane]) : [0, lane, 0];

    const ys: readonly [number, number, number] =
      params.exit === "lane" ? [0, dir * 0.4, dir * 0.8] : [0, dir * 0.5, dir * 1.0];

    const rows: readonly (readonly [number, number, number])[] = [
      [0, xs[0], ys[0]],
      [1, xs[1], ys[1]],
      [2, xs[2], ys[2]],
    ];

    const waypoints = rows.map(([beat, x, y]) => ({
      beat,
      x: round(x),
      y: round(y),
      facing: PLUS_Y, // facing never changes during a pass
    }));

    const last = waypoints[waypoints.length - 1];
    /* v8 ignore next -- rows is a non-empty literal; this is a type narrowing only */
    if (last === undefined) throw new Error("pass: empty waypoints");

    return {
      beats: BEATS,
      waypoints,
      entry: { position: { x: 0, y: 0 }, facing: PLUS_Y }, // dancer-centred frame
      exit: { position: { x: last.x, y: last.y }, facing: PLUS_Y },
      momentum: {
        rotation: 0,
        roll: null, // no turning motion — CALLERLAB lists Pass Thru as cannot-roll
        bodyFlow: params.direction === "forward" ? PLUS_Y : PLUS_Y - 180,
        lastHand: "none",
      },
    };
  },
} as const;
