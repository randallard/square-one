/**
 * Blocks are first-class (ADR-0005): a call is a checkable chain of parameterised
 * blocks, and a player's custom move uses the identical mechanism.
 *
 * A block is a **generator**, not a table (ADR-0008). The specs in
 * `docs/spec/blocks/` show worked instantiations — `pass` documents 2 of its 8
 * parameter combinations — with the rest covered by prose rules that live here as
 * code. The documented tables are conformance fixtures, not the source.
 */

import type { GripStyle, Motion, Pose } from "../types.js";

/**
 * A hand held for the whole of a block — the parameter that turns a walk into a
 * *joined* walk.
 *
 * Blocks that travel are written hands-free, because that is what most figures do and
 * because "both hands are available" is a positive fact F2 reads. A hold is the
 * exception stated explicitly: the figure keeps this hand engaged from the first beat
 * to the last, and the block emits the single {@link GripSpan} that says so.
 *
 * 🔴 **Held for the whole block, and there is no partial span.** No call in the catalog
 * joins hands part-way through a block, and a `from`/`to` pair here would be a second
 * timeline running inside a block's own — which is what chaining two blocks already is.
 * A figure that joins hands half way through chains a free block and a held one.
 */
export interface Hold {
  /** Which of this dancer's hands. Never `"none"` — an absent {@link Hold} is that. */
  readonly hand: "right" | "left";
  /** How it is held, and therefore how it is drawn. */
  readonly grip: GripStyle;
}

/** Every block emits its path in a local frame where the dancer enters at the
 *  origin facing `+y`. Composition rotates and translates that frame onto the
 *  previous block's exit. */
export interface BlockDef<P> {
  readonly name: string;
  readonly beats: (params: P) => number;
  readonly generate: (params: P) => Motion;
}

/** A block plus the arguments it was invoked with — the serialisable unit. A call
 *  is a list of these, and so is a custom move (ADR-0005). */
export interface BlockCall<P = unknown> {
  readonly block: string;
  readonly params: P;
}

/** Why a chain is invalid. The entry contract of block *k+1* has to be satisfied
 *  by the exit pose of block *k*; that's the first validity gate for custom moves. */
export interface ChainDefect {
  readonly index: number;
  readonly block: string;
  readonly reason: string;
}

export type { GripStyle, Motion, Pose };
