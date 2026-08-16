/** The block catalog. Blocks are referenced by name in serialised moves, so these
 *  strings are part of the data format (ADR-0005: sharing is versioned plain data). */

import type { Motion } from "../types.js";
import { armTurn, type ArmTurnParams } from "./arm-turn.js";
import { orbit, type OrbitParams } from "./orbit.js";
import { pass, type PassParams } from "./pass.js";
import { slide, type SlideParams } from "./slide.js";

export { armTurn, orbit, pass, slide };
export type { ArmTurnParams, OrbitParams, PassParams, SlideParams };
export * from "./types.js";

/** Discriminated union of every block invocation the catalog understands. Adding a
 *  block here is what makes it available to calls *and* to the custom-move
 *  workshop — the identical mechanism ADR-0005 promised. */
export type CatalogCall =
  | { readonly block: "pass"; readonly params: PassParams }
  | { readonly block: "slide"; readonly params: SlideParams }
  | { readonly block: "arm-turn"; readonly params: ArmTurnParams }
  | { readonly block: "orbit"; readonly params: OrbitParams };

export const BLOCK_NAMES = ["pass", "slide", "arm-turn", "orbit"] as const;
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
  }
}
