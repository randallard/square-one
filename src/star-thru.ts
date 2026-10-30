/**
 * 🧪 **Star Thru** — a facing pair, man facing woman, becomes a couple (2026-10-29).
 *
 * Spec: `docs/spec/calls/star-thru.md`. Exploratory: no ADR yet. The first call in the catalog
 * that **changes formation**, and the first built the way a custom move will be: a block chain
 * per dancer, a hold, and nothing else (ADR-0005).
 *
 * ## The figure
 *
 * The man's right hand joins the woman's left in an arch. Each walks forward
 * `(separation + width) / 2` straight along their own facing while pivoting a quarter, she left,
 * under the arch, and he right. They **swap spots**: the pair's centre stays where it was, and the
 * couple finishes on the pair's own two spots, which is what lets Star Thru be called from Facing
 * Lines and Eight Chain Thru, where pairs stand one spot apart (CALLERLAB Standard Basic
 * Applications #24). Mid-call the arch sits off to the man's right (CALLERLAB styling); the path
 * says nothing about the hands, which belong to whoever draws them.
 *
 * ## A bow for the bodies, the arch for the arm
 *
 * They are level at `t = 0.75`. Ryan (10-29): the clearance is **vertical**, she goes under, and
 * that is the arm's: the man's right reaches over her to her left hand on her far side. The bodies
 * still pass right shoulders, and straight paths walked them through each other: the-lot's first
 * solve had to shove the beau 77 cm aside. So each bows to their own left by half the pair's
 * `clearance`, peaking where they're level and back on the line at both ends (`step-pivot`'s
 * `bow`): the passing room, without moving where the couple finishes.
 *
 * ## Kept apart from `CALLS`
 *
 * `CALLS` asserts properties of calls that apply to a pair *and* to a couple and leave the
 * formation as it was. This one consumes a pair and returns a couple, so it has its own entry
 * point, {@link applyStarThru}, as `facing-couples.ts` has its own catalog.
 */

import type { CatalogCall, Hold } from "./blocks/index.js";
import { compose } from "./compose.js";
import { partnerUp, type Couple, type CouplePosition } from "./couple.js";
import { normaliseDeg, round } from "./geometry.js";
import { PAIR_A, PAIR_B } from "./calls.js";
import { DEFAULT_PAIR_SHAPE, type FigureShape } from "./shape.js";
import type { PairKey } from "./sequence.js";
import type { Motion } from "./types.js";

/** CALLERLAB's timing chart: 4 beats, all of it one step-pivot each. */
export const STAR_THRU_BEATS = 4;

/** The pair frame's separation: A at `y = −0.5`, B at `+0.5`. */
const SEPARATION = 1;

/** The man's right and the woman's left, raised: the same arch a California Twirl holds. */
const STAR_THRU_ARCH = {
  beau: { hand: "right", grip: "arch" },
  belle: { hand: "left", grip: "arch" },
} as const satisfies Readonly<Record<CouplePosition, Hold>>;

/**
 * How far each dancer walks: from their half of the pair's separation to their half of the
 * couple's width, on the other side.
 */
export const starThruWalk = (shape: FigureShape): number => round((SEPARATION + shape.width) / 2);

/**
 * The two chains, keyed by the position each dancer finishes in: the man becomes the **beau**,
 * the woman the **belle** (CALLERLAB, and the salvaged `moves.md`: *"the gent is the beau"*).
 * Keyed by the resulting couple, never by role words in the engine (ADR-0012).
 */
export function starThruChains(
  shape: FigureShape = DEFAULT_PAIR_SHAPE,
): Readonly<Record<CouplePosition, readonly CatalogCall[]>> {
  const forward = starThruWalk(shape);
  // Each bows to their own left by half the pair's passing clearance, peaking where they're level
  // (`SEPARATION / 2` walked): right shoulders pass a clearance apart, the arch over her.
  const bow = round(shape.clearance / 2);
  const bowAt = round(SEPARATION / 2 / forward);
  const step = (turn: "right" | "left", hold: Hold): readonly CatalogCall[] => [
    {
      block: "step-pivot",
      params: { side: turn, distance: 0, turn, fraction: 0.25, forward, beats: STAR_THRU_BEATS, bow, bowAt, hold },
    },
  ];
  return {
    beau: step("right", STAR_THRU_ARCH.beau),
    belle: step("left", STAR_THRU_ARCH.belle),
  };
}

/** Star Thru, as plain data: what the workshop shows and a shared move travels as. */
export const starThru = {
  name: "Star Thru",
  chartBeats: STAR_THRU_BEATS,
  /** Where it starts: a facing pair, the man facing the woman. */
  from: "facing-pair",
  /** Where it ends. */
  to: "couple",
  /**
   * CALLERLAB's standard applications (Standard Basic Applications #24): the formations whose
   * facing pairs it is called on, opposite gender facing. Each is a placement of facing pairs;
   * the figure is the same in all of them.
   */
  standardFrom: [
    "static-square",
    "facing-lines",
    "eight-chain-thru",
    "double-pass-thru",
    "trade-by",
    "ends-in-inverted-lines",
    "right-and-left-grand",
    "circle",
  ],
  chains: starThruChains(),
  chainsAt: starThruChains,
} as const;

/**
 * A facing pair dancing a Star Thru, in the pair frame: both motions, and the couple they
 * become.
 *
 * `beau` names which of the pair is the man, who finishes as the beau. Either works: the man's
 * right and the woman's left are on the same side whichever of A and B he is. `shape` is the
 * couple they will be (its `width` is where they finish); it defaults to the facing pair's
 * body-agnostic one.
 */
export function applyStarThru(
  beau: PairKey,
  shape: FigureShape = DEFAULT_PAIR_SHAPE,
): { a: Motion; b: Motion; couple: Couple } {
  const chains = starThruChains(shape);
  const a = compose(beau === "a" ? chains.beau : chains.belle, PAIR_A);
  const b = compose(beau === "b" ? chains.beau : chains.belle, PAIR_B);
  const exitBeau = (beau === "a" ? a : b).exit;
  const exitBelle = (beau === "a" ? b : a).exit;
  const couple = partnerUp(
    beau,
    beau === "a" ? "b" : "a",
    {
      x: (exitBeau.position.x + exitBelle.position.x) / 2,
      y: (exitBeau.position.y + exitBelle.position.y) / 2,
    },
    normaliseDeg(exitBeau.facing),
    // The facing pair's default clearance is a `pass` lane, not a couple's; a couple from the
    // body-agnostic pair is the body-agnostic couple. Real bodies pass their own shape.
    shape === DEFAULT_PAIR_SHAPE ? { width: shape.width } : shape,
  );
  return { a, b, couple };
}
