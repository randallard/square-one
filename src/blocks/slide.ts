/**
 * `slide` — sidestep laterally without turning.
 *
 * Spec: `docs/spec/blocks/slide.md`. Dosado's crossing steps; later the
 * Dodge family and adjustments.
 */

import { PLUS_Y, round } from "../geometry.js";
import type { Motion } from "../types.js";
import { LANE_OFFSET } from "./pass.js";

export interface SlideParams {
  readonly side: "right" | "left";
}

/** A full lane change: across both lanes, so twice the `pass` offset. */
export const SLIDE_DISTANCE = 2 * LANE_OFFSET;

/**
 * One beat, whatever the distance — which is only honest while there *is* only one
 * distance.
 *
 * 🔴 A `distance` parameter lived here briefly (2026-08-15) so Partner Trade could
 * sidestep a half lane onto its passing lane. It was removed by
 * [ADR-0013](../../docs/adr/0013-the-trade-lane-rides-inside-the-arc.md): charging a
 * flat beat for a sixth of the distance made the Trade's sidestep crawl at a sixth of
 * a Dosado's, which is what the render watch caught. This block's own spec had already
 * rejected the same idea once — a `span: half` variant was proposed and dropped on
 * 2026-07-26 because CALLERLAB blends the closing lateral into the walk — and the
 * Trade re-introduced it without noticing. If the Dodge family needs partial slides,
 * design the parameter *and its timing* together.
 */
const BEATS = 1;

export const slide = {
  name: "slide",
  beats: (): number => BEATS,

  generate(params: SlideParams): Motion {
    const dx = (params.side === "right" ? 1 : -1) * SLIDE_DISTANCE;

    return {
      beats: BEATS,
      grips: [], // hands stay free
      waypoints: [
        { beat: 0, x: 0, y: 0, facing: PLUS_Y },
        { beat: 1, x: round(dx), y: 0, facing: PLUS_Y },
      ],
      entry: { position: { x: 0, y: 0 }, facing: PLUS_Y }, // dancer-centred frame
      exit: { position: { x: round(dx), y: 0 }, facing: PLUS_Y },
      momentum: {
        rotation: 0,
        roll: null,
        // Lateral exit vector — exactly the condition F6 watches: a block following
        // `slide(right)` that moves leftward is a statically catchable flow defect.
        bodyFlow: params.side === "right" ? 0 : 180,
        lastHand: "none",
      },
    };
  },
} as const;
