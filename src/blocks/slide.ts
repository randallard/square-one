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

const BEATS = 1;

export const slide = {
  name: "slide",
  beats: (): number => BEATS,

  generate(params: SlideParams): Motion {
    const dx = (params.side === "right" ? 1 : -1) * SLIDE_DISTANCE;

    return {
      beats: BEATS,
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
