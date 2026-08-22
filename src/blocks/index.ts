/** The block catalog. Blocks are referenced by name in serialised moves, so these
 *  strings are part of the data format (ADR-0005: sharing is versioned plain data). */

import type { Motion } from "../types.js";
import { armTurn, type ArmTurnParams } from "./arm-turn.js";
import { orbit, type OrbitParams } from "./orbit.js";
import { pass, type PassParams } from "./pass.js";
import { slide, type SlideParams } from "./slide.js";
import { stepPivot, type StepPivotParams } from "./step-pivot.js";

export { armTurn, orbit, pass, slide, stepPivot };

/**
 * The body-agnostic constants a block is drawn with — **the floors a consumer's own
 * measurements are compared against**, and therefore public (ADR-0020).
 *
 * 🔴 They were module-private, and a consumer that needed one copied it: townage's
 * `ENGINE_LANE_OFFSET = 0.15` carries the comment *"mirrors `LANE_OFFSET` in the engine's
 * `pass` block"*, which is a constant kept in step by hand across two repositories. Now that
 * a body measurement can be handed to a block, the number it has to beat is part of the
 * contract rather than an implementation detail.
 *
 * `BEATS_PER_TURN` is deliberately not among them: four blocks define it, all as 8, and a
 * single exported name would have to pick one of the four to be the real one.
 */
export {
  ENTRY_RADIUS,
  ORBIT_RADIUS,
  STEP_OUT_FRACTION,
  STEP_OUT_RADIUS,
} from "./arm-turn.js";
export { LANE_OFFSET, PASS_CLEARANCE } from "./pass.js";
export { SLIDE_DISTANCE } from "./slide.js";
export type {
  ArmTurnParams,
  OrbitParams,
  PassParams,
  SlideParams,
  StepPivotParams,
};
export * from "./types.js";

/** Discriminated union of every block invocation the catalog understands. Adding a
 *  block here is what makes it available to calls *and* to the custom-move
 *  workshop — the identical mechanism ADR-0005 promised. */
export type CatalogCall =
  | { readonly block: "pass"; readonly params: PassParams }
  | { readonly block: "slide"; readonly params: SlideParams }
  | { readonly block: "arm-turn"; readonly params: ArmTurnParams }
  | { readonly block: "orbit"; readonly params: OrbitParams }
  | { readonly block: "step-pivot"; readonly params: StepPivotParams };

export const BLOCK_NAMES = [
  "pass",
  "slide",
  "arm-turn",
  "orbit",
  "step-pivot",
] as const;
export type BlockName = (typeof BLOCK_NAMES)[number];

export function generateBlock(call: CatalogCall): Motion {
  switch (call.block) {
    case "pass":
      return pass.generate(call.params);
    case "slide":
      return slide.generate(call.params);
    case "arm-turn":
      return armTurn.generate(call.params);
    case "orbit":
      return orbit.generate(call.params);
    case "step-pivot":
      return stepPivot.generate(call.params);
  }
}

export function blockBeats(call: CatalogCall): number {
  switch (call.block) {
    case "pass":
      return pass.beats(call.params);
    case "slide":
      return slide.beats();
    case "arm-turn":
      return armTurn.beats(call.params);
    case "orbit":
      return orbit.beats(call.params);
    case "step-pivot":
      return stepPivot.beats(call.params);
  }
}
