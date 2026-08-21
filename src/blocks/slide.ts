/**
 * `slide` — sidestep laterally without turning.
 *
 * Spec: `docs/spec/blocks/slide.md`. Dosado's crossing steps; later the
 * Dodge family and adjustments.
 */

import { PLUS_Y, atLeast, round } from "../geometry.js";
import type { Motion } from "../types.js";
import { LANE_OFFSET } from "./pass.js";

export interface SlideParams {
  readonly side: "right" | "left";
  /**
   * How far to step, when the bodies want more than the figure gives — **a body
   * measurement**, and the resurrection of a parameter this block has had before.
   *
   * A Dosado's slide is a full lane change: the dancer crosses from their own lane into
   * the other, which is exactly the room the two of them needed to pass. So when a
   * consumer widens that pass it widens this step by the same number, and `dosado` hands
   * both of them the pair's own clearance (ADR-0020).
   *
   * 🔴 **This is not the parameter ADR-0013 removed, and the difference is the floor.**
   * That one let Partner Trade ask for a *sixth* of a Dosado's distance while still
   * paying a flat beat for it, and the render watch caught the step crawling. This one
   * cannot ask for less than {@link SLIDE_DISTANCE} (ADR-0021): it only ever lengthens the stride
   * inside the same beat, which is what a bigger dancer covering more ground looks like.
   * The standing instruction that ADR-0013 left — *"design the parameter **and its
   * timing** together"* — is answered by that asymmetry rather than ignored: a longer
   * step in a beat is a longer step, and a shorter one in a beat is a crawl.
   */
  readonly distance?: number;
}

/** A full lane change: across both lanes, so twice the `pass` offset — and therefore
 *  exactly the room `pass` gives two dancers to pass in (`PASS_CLEARANCE`). */
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
    const dx = (params.side === "right" ? 1 : -1) * atLeast(SLIDE_DISTANCE, params.distance);

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
