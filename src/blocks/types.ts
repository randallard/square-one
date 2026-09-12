/**
 * Blocks are first-class (ADR-0005): a call is a checkable chain of parameterised
 * blocks, and a player's custom move uses the identical mechanism.
 *
 * A block is a **generator**, not a table (ADR-0008). The specs in
 * `docs/spec/blocks/` show worked instantiations — `pass` documents 2 of its 8
 * parameter combinations — with the rest covered by prose rules that live here as
 * code. The documented tables are conformance fixtures, not the source.
 */

import { round } from "../geometry.js";
import type { GripSpan, GripStyle, Motion, Pose } from "../types.js";

/**
 * A hand held through a block — the parameter that turns a walk into a *joined* walk.
 *
 * Blocks that travel are written hands-free, because that is what most figures do and
 * because "both hands are available" is a positive fact F2 reads. A hold is the
 * exception stated explicitly: the figure keeps this hand engaged while it travels, and
 * the block emits the single {@link GripSpan} that says so — see {@link holdSpans} for
 * where that span ends, which is **not** the block's last beat.
 *
 * 🔴 **Joined for the whole block, and there is no partial span.** No call in the catalog
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

/**
 * How long before the **dance** ends that a {@link Hold} lets go, in beats — the window the
 * hands have to come down to the waiting position.
 *
 * The same half beat `arm-turn`'s `step-out` releases on, so the catalog has one release
 * duration rather than two.
 *
 * 🔴 **Not applied by the blocks, and that is the decision** (ADR-0026). A block holds for
 * its whole length, because a block cannot know whether another call follows it — see
 * {@link holdSpans}. `flattenSequence` applies this, because it can. The constant lives beside
 * `Hold` because it is the hold's own timing, and is public for the reason ADR-0020 makes the
 * other block constants public: a consumer that draws the release has to know how long it has,
 * and a copy of `0.5` maintained by hand in another repository is the thing that rule exists
 * to stop.
 */
export const HOLD_RELEASE_BEATS = 0.5;

/**
 * The grip channel a held travelling block emits — **one span, covering the whole block.**
 *
 * Shared by `orbit` and `step-pivot` so the two halves of a couple cannot drift apart on
 * this: they are the same hold seen from two bodies, and a difference between them would be
 * the pair disagreeing about when they are holding hands.
 *
 * 🔴 **A block holds to its last beat, and the release is not decided here** (ADR-0026).
 * Ryan, 2026-09-12: *"hands don't always go down in the middle of a sequence … we need a way
 * to distinguish between the sequence ending and dancers waiting, or the sequence continuing
 * and the hands position blending into the next move rather than going to the waiting
 * position."* A block cannot make that distinction — it has no idea whether another call
 * follows it — so a block that trimmed its own span dropped the hands between two California
 * Twirls, which is not what a couple dancing two of them does. That was the first attempt at
 * this and the dip was the tell. `flattenSequence` applies {@link HOLD_RELEASE_BEATS} at the
 * end of the **dance**, where the answer is known.
 *
 * The one release that *is* a block's own business is `arm-turn`'s `exit: "step-out"`: an
 * Allemande Left lets go to step out because that is what the figure does, whatever follows
 * it, and its `exit: "hold"` is how a composite call says otherwise.
 */
export function holdSpans(hold: Hold | undefined, beats: number): readonly GripSpan[] {
  if (hold === undefined) return [];
  return [{ hand: hold.hand, grip: hold.grip, from: 0, to: round(beats) }];
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

export type { GripSpan, GripStyle, Motion, Pose };
