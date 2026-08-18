/**
 * Core engine types.
 *
 * Two-couple-safe by construction: nothing here assumes eight dancers. The starter
 * calls are all two-dancer actions, and the arc reaches four dancers before it
 * reaches eight (`call-model.md`, planning arc chunk 2).
 */

import type { Degrees, Turn, Vec2 } from "./geometry.js";

/** Canonical roles, per ADR-0003. Presentation labels (Lark/Robin, …) are aliases
 *  applied at the edge and never reach the engine. */
export type Role = "boy" | "girl";

/** Which hand an action engages. `none` is a value, not an absence: the specs track
 *  "hands stay free" as a positive fact, because F2 asks whether the hand a call
 *  needs is *available*. */
export type Hand = "right" | "left" | "none";

/** A dancer's identity within the square. Couple numbers run 1–4 in a full square;
 *  a two-couple set uses 1–2. */
export interface DancerId {
  readonly couple: number;
  readonly role: Role;
}

/** Where a dancer is and which way they point. */
export interface Pose {
  readonly position: Vec2;
  readonly facing: Degrees;
}

/** One sampled instant of a dancer's path. Beats are relative to the start of the
 *  action that produced them. */
export interface Waypoint {
  readonly beat: number;
  readonly x: number;
  readonly y: number;
  readonly facing: Degrees;
}

/**
 * Layer-1 momentum state after an action — everything the flow rules and the
 * "…and Roll" / "…and Sweep" family need, and nothing they don't.
 */
export interface Momentum {
  /** Signed facing rotation accumulated, CCW-positive. Unbounded: F4 measures
   *  same-direction accumulation *across* transitions, so it must not wrap. */
  readonly rotation: Degrees;
  /** Direction of that rotation, or `null` when there was none. Dosado and Pass
   *  Thru are both explicitly cannot-roll calls, and this is why. */
  readonly roll: Turn;
  /** Direction of travel at the end, as a bearing. `null` when the dancer finishes
   *  effectively at rest (Dosado backs into its own spot). */
  readonly bodyFlow: Degrees | null;
  /** The hand that finished the action and was released. F2 reads this to decide
   *  whether the next call's hand is available. */
  readonly lastHand: Hand;
}

/**
 * How a joined hand is held — the shape a renderer has to draw, named by the engine
 * because the engine is what knows which figure is being danced.
 *
 * - `forearm` — the arm-turn family. Two **horizontal, antiparallel** forearms along
 *   the line between the pair, each hand at the other's elbow, pinned to the shared
 *   pivot and rotating with it while the bodies move around it. A consumer should
 *   **place** the named forearm into the grip, not aim it at the grip point: townage
 *   tried aiming first and the arms came out pointing sideways at each other, because
 *   in an arm turn the gripping shoulder is already nearly over the pivot. See
 *   the-lot's `src/dance/arm-pose.ts`.
 * - `arch` — the arch family. Palms joined and **raised clear of the head**, high
 *   enough that a dancer can walk beneath the join. California Twirl is the first;
 *   Star Thru and Box the Gnat are the same hold.
 *
 * 🔴 A plain side-by-side handhold — a couple simply standing hand in hand — is
 * deliberately **not** in this union. It is not something a call engages: it is what
 * being a couple *is*, and a consumer that knows where two bodies are can see it
 * (the-lot infers it from the live placements, `touchingSide`). A grip span is for a
 * hold the **figure** imposes, which the placements cannot reveal — and an arch is
 * exactly that, because two dancers with their hands over their heads are standing
 * where two dancers with their hands down would be. Palm grips for Right and Left
 * Grand arrive when that call does.
 */
export type GripStyle = "forearm" | "arch";

/**
 * A span of beats during which one of this dancer's hands is engaged in a grip.
 *
 * This is F2's per-beat data: `Momentum.lastHand` says what *finished* engaged;
 * grips say what is engaged *now*. `grip` is the style — see {@link GripStyle}.
 */
export interface GripSpan {
  readonly hand: Hand;
  readonly grip: GripStyle;
  readonly from: number;
  readonly to: number;
}

/** What applying a block or a call yields. */
export interface Motion {
  readonly beats: number;
  readonly waypoints: readonly Waypoint[];
  /** Hand engagements over this motion's beat axis; empty means hands stay
   *  free throughout — a positive fact (F2), not an omission. */
  readonly grips: readonly GripSpan[];
  /**
   * The dancer's pose at beat 0 **in this motion's own local frame**.
   *
   * Not always the origin: block-local frames are not uniform, and that is a
   * property of the specs rather than an accident. `pass` and `slide` are written
   * dancer-centred (enter at the origin facing `+y`), but `arm-turn` is written
   * **grip-centred** — the shared pivot is the origin and the dancer enters at
   * `(0, −0.5)` — because the grip is what the two dancers have in common.
   * Composition aligns on `entry`, not on the origin.
   */
  readonly entry: Pose;
  readonly exit: Pose;
  readonly momentum: Momentum;
}

export type { Degrees, Turn, Vec2 };
