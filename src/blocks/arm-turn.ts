/**
 * `arm-turn` — two dancers join forearms and walk forward around their common pivot.
 *
 * Spec: `docs/spec/blocks/arm-turn.md`. The catalog's first rotating block and its
 * first with hands engaged, so roll, F2 hand tracking and F3/F4 rotation accounting
 * all activate here.
 *
 * **Left = CCW.** The pivot is on your left as you walk forward. The spec records
 * the rotation delta as `fraction × ±360°`, "left: +/CCW, right: −/CW".
 */

import { PLUS_Y, normaliseDeg, polar, round, turnOf } from "../geometry.js";
import type { Motion, Waypoint } from "../types.js";

export interface ArmTurnParams {
  readonly hand: "right" | "left";
  /** Quarter multiples: 0.5, 0.75, 1, 1.5, … */
  readonly fraction: number;
  /** `step-out`: release and blend a departure step into the last beat (the call is
   *  over — Allemande Left). `hold`: keep the grip at orbit radius for composite
   *  calls that chain turns. */
  readonly exit: "step-out" | "hold";
}

/** Where the dancer stands before stepping in — one half-unit out, per the shared
 *  pair-frame convention. */
export const ENTRY_RADIUS = 0.5;
/** The radius they walk the turn at, once forearms are joined. */
export const ORBIT_RADIUS = 0.3;
/** `step-out` leaves them just outside the orbit, facing their departure. */
export const STEP_OUT_RADIUS = 0.42;

/** A full turn is 8 beats; the chart's fraction rows are linear in that. */
export const BEATS_PER_TURN = 8;
/** The beat at which forearms join and rotation starts. */
const CONTACT_BEAT = 1;

/** The dancer starts due south of the pivot, facing it. */
const START_ANGLE = 270;

export const armTurn = {
  name: "arm-turn",

  beats: (params: ArmTurnParams): number => params.fraction * BEATS_PER_TURN,

  generate(params: ArmTurnParams): Motion {
    const { hand, fraction, exit } = params;
    if (fraction <= 0) throw new Error("arm-turn: fraction must be positive");

    const dir = hand === "left" ? 1 : -1; // left = CCW = positive
    const beats = fraction * BEATS_PER_TURN;
    const rotation = dir * fraction * 360;

    // Facing is **tangential to the orbit**, which is what puts the pivot on the
    // named side — the spec's own definition of the `hand` parameter: "the pivot is
    // on your left as you walk forward". Tangent to a CCW orbit is the position
    // angle + 90°; for CW it is −90°. Facing therefore turns through the same
    // signed angle the body travels, so the rotation delta stays `fraction × ±360°`.
    const angleAt = (turns: number): number => START_ANGLE + dir * turns * 360;
    const facingAt = (turns: number): number => angleAt(turns) + dir * 90;

    const waypoints: Waypoint[] = [
      // Entry travel: standing off, facing the counterpart head-on.
      { beat: 0, x: 0, y: round(-ENTRY_RADIUS), facing: PLUS_Y },
      // Step in; forearms join. Facing settles from head-on into the tangent — a
      // 90° turn-in that belongs to the approach, which the timing chart counts
      // outside the block ("from point of contact"). Rotation proper starts here.
      { beat: CONTACT_BEAT, x: 0, y: round(-ORBIT_RADIUS), facing: round(normaliseDeg(facingAt(0))) },
    ];

    // A mark every quarter turn, then the final one. The last quarter is
    // compressed when it would overrun the block: the departure step is blended
    // into the closing beat rather than added to it.
    for (let turns = 0.25; turns < fraction - 1e-9; turns += 0.25) {
      const p = polar(ORBIT_RADIUS, angleAt(turns));
      waypoints.push({
        beat: CONTACT_BEAT + turns * BEATS_PER_TURN,
        x: round(p.x),
        y: round(p.y),
        facing: round(normaliseDeg(facingAt(turns))),
      });
    }

    const endRadius = exit === "step-out" ? STEP_OUT_RADIUS : ORBIT_RADIUS;
    const end = polar(endRadius, angleAt(fraction));
    const endFacing = round(normaliseDeg(facingAt(fraction)));
    waypoints.push({ beat: beats, x: round(end.x), y: round(end.y), facing: endFacing });

    return {
      beats,
      waypoints,
      // Grip-centred frame: the pivot is the origin and the dancer stands off it.
      entry: { position: { x: 0, y: round(-ENTRY_RADIUS) }, facing: PLUS_Y },
      exit: { position: { x: round(end.x), y: round(end.y) }, facing: endFacing },
      momentum: {
        rotation,
        roll: turnOf(rotation),
        bodyFlow: endFacing,
        // The named forearm — released at `step-out`, still gripped at `hold`.
        // Either way it is the hand that is *not* free, which is what makes the
        // Allemande Left → Right and Left Grand pairing F2-perfect.
        lastHand: hand,
      },
    };
  },
} as const;
