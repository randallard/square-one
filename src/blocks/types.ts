/**
 * Blocks are first-class (ADR-0005): a call is a checkable chain of parameterised
 * blocks, and a player's custom move uses the identical mechanism.
 *
 * A block is a **generator**, not a table (ADR-0008). The specs in
 * `docs/spec/blocks/` show worked instantiations — `pass` documents 2 of its 8
 * parameter combinations — with the rest covered by prose rules that live here as
 * code. The documented tables are conformance fixtures, not the source.
 */

import type { Motion, Pose } from "../types.js";

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

export type { Motion, Pose };
