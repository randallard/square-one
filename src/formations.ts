/**
 * 🧪 The named formations a call is danced from (2026-10-30). Exploratory, no ADR.
 *
 * Spec: `docs/spec/standard-applications.md`. A formation here is a **name**, not geometry: the
 * shape, facing directions and handedness CALLERLAB means when it writes "Eight Chain Thru" or
 * "Right-Hand Parallel Waves" in its Standard Applications ([call-model.md](../docs/spec/call-model.md),
 * Layer 2). Recognising one from dancers' positions is still S2's job and isn't done here.
 *
 * Handedness is part of the id ("rh-parallel-waves", "lh-parallel-waves") because a call that is
 * standard from one hand is not from the other (Swing Thru vs Left Swing Thru), and an ending
 * formation has one hand.
 *
 * **Units.** CALLERLAB also names the smallest group a call needs ("Any Facing Couples", "Any
 * Normal Couple"). Those are formations here too, and each says which whole-set formations hold
 * one, so a call standard from "any facing couples" is legal from Eight Chain Thru.
 */

export const FORMATIONS = {
  // The square and its circles
  "squared-set": { name: "Static Square", dancers: 8 },
  circle: { name: "Circle of Eight", dancers: 8 },
  "rlg-circle": { name: "Right and Left Grand Circle", dancers: 8 },
  promenade: { name: "Couples Promenade", dancers: 8 },
  "wrong-way-promenade": { name: "Wrong Way Promenade", dancers: 8 },
  "single-file-promenade": { name: "Single File Promenade", dancers: 8 },
  "inverted-square": { name: "Inverted Square (two couples facing out)", dancers: 8 },
  "out-facing-square": { name: "Out-Facing Square", dancers: 8 },
  "rh-center-star": { name: "4-Dancer Right-Hand Star in the center", dancers: 8 },
  "lh-center-star": { name: "4-Dancer Left-Hand Star in the center", dancers: 8 },
  thar: { name: "Thar Star (right hands in center)", dancers: 8 },
  "wrong-way-thar": { name: "Wrong Way Thar (left hands in center)", dancers: 8 },
  "alamo-ring": { name: "Alamo Style Ring", dancers: 8 },

  // 2x4s of couples
  "facing-lines": { name: "Facing Lines", dancers: 8 },
  "lines-facing-out": { name: "Lines Facing Out", dancers: 8 },
  "eight-chain-thru": { name: "Eight Chain Thru", dancers: 8 },
  "trade-by": { name: "Trade By", dancers: 8 },
  "double-pass-thru": { name: "Double Pass Thru", dancers: 8 },
  "completed-double-pass-thru": { name: "Completed Double Pass Thru", dancers: 8 },
  "inverted-lines-ends-in": { name: "Ends In Inverted Lines", dancers: 8 },
  "inverted-lines-ends-out": { name: "Ends Out Inverted Lines", dancers: 8 },

  // Waves, two-faced lines, columns, and their tidal and tag forms
  "rh-parallel-waves": { name: "Right-Hand Parallel Waves", dancers: 8, hand: "right" },
  "lh-parallel-waves": { name: "Left-Hand Parallel Waves", dancers: 8, hand: "left" },
  "rh-two-faced-lines": { name: "Right-Hand Parallel Two-Faced Lines", dancers: 8, hand: "right" },
  "lh-two-faced-lines": { name: "Left-Hand Parallel Two-Faced Lines", dancers: 8, hand: "left" },
  "rh-columns": { name: "Right-Hand Columns", dancers: 8, hand: "right" },
  "lh-columns": { name: "Left-Hand Columns", dancers: 8, hand: "left" },
  "rh-tidal-wave": { name: "Right-Hand Tidal Wave", dancers: 8, hand: "right" },
  "lh-tidal-wave": { name: "Left-Hand Tidal Wave", dancers: 8, hand: "left" },
  "rh-tidal-two-faced-line": { name: "Right-Hand Tidal Two-Faced Line", dancers: 8, hand: "right" },
  "lh-tidal-two-faced-line": { name: "Left-Hand Tidal Two-Faced Line", dancers: 8, hand: "left" },
  "tidal-line": { name: "Tidal Line", dancers: 8 },
  "rh-quarter-tag": { name: "Right-Hand 1/4 Tag", dancers: 8, hand: "right" },
  "lh-quarter-tag": { name: "Left-Hand 1/4 Tag", dancers: 8, hand: "left" },
  "rh-three-quarter-tag": { name: "Right-Hand 3/4 Tag", dancers: 8, hand: "right" },
  "lh-three-quarter-tag": { name: "Left-Hand 3/4 Tag", dancers: 8, hand: "left" },
  "rh-quarter-line": { name: "Right-Hand 1/4 Line (two-faced line in the center)", dancers: 8, hand: "right" },
  "rh-quarter-box": { name: "Right-Hand 1/4 Box (center box, couples facing in outside)", dancers: 8, hand: "right" },

  // Units: the smallest group a call needs, and the formations that hold one
  "facing-dancers": { name: "Any Two Facing Dancers", dancers: 2 },
  "facing-couples": { name: "Any Facing Couples", dancers: 4 },
  couple: { name: "Any Normal Couple", dancers: 2 },
  "couple-facing-out": { name: "Back-to-Back Couples, or a Couple Facing Out", dancers: 2 },
} as const satisfies Readonly<Record<string, Formation>>;

export interface Formation {
  /** CALLERLAB's wording, as the Standard Applications charts print it. */
  readonly name: string;
  readonly dancers: 2 | 4 | 8;
  readonly hand?: "right" | "left";
}

export type FormationId = keyof typeof FORMATIONS;

/**
 * Which whole-set formations hold each unit. A call standard from the unit is legal from these.
 * Only the formations where the whole unit is there for every dancer it names: Trade By has
 * facing couples only in the center, so it isn't listed for "facing-couples" (CALLERLAB lists
 * Trade By separately wherever it's standard, with "centers" as the active dancers).
 */
export const UNIT_IN: Readonly<Partial<Record<FormationId, readonly FormationId[]>>> = {
  "facing-dancers": ["facing-couples", "facing-lines", "eight-chain-thru", "squared-set", "rlg-circle"],
  "facing-couples": ["facing-lines", "eight-chain-thru", "squared-set"],
  couple: [
    "squared-set", "promenade", "facing-lines", "lines-facing-out", "eight-chain-thru", "trade-by",
    "double-pass-thru", "completed-double-pass-thru", "rh-two-faced-lines", "lh-two-faced-lines",
    "inverted-square", "out-facing-square", "facing-couples", "couple-facing-out",
  ],
  "couple-facing-out": ["lines-facing-out", "completed-double-pass-thru", "trade-by", "inverted-square", "out-facing-square"],
};

/** The formations a call standard from `unit` (or from a whole-set formation) can be danced in. */
export function formationsHolding(id: FormationId): readonly FormationId[] {
  return [id, ...(UNIT_IN[id] ?? [])];
}
