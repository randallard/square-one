/**
 * The call catalog — plain data (ADR-0008).
 *
 * A call carries no geometry of its own: it is a chain of block invocations, which
 * is exactly the structure the custom-move workshop emits and the social layer will
 * share. Two of the three starter calls are a single block.
 *
 * The pair frame (established in `docs/spec/calls/dosado.md` for all 2-dancer
 * calls): a local frame centred on the pair's midpoint, dancer A at `(0, −0.5)`
 * facing `+y`, dancer B at `(0, +0.5)` facing `−y`. B's path is always A's rotated
 * 180° about the origin.
 */

import type { CatalogCall } from "./blocks/index.js";
import { LANE_OFFSET } from "./blocks/pass.js";
import { COUPLE_WIDTH, positionOf, type Couple, type CouplePosition } from "./couple.js";
import { compose, ORIGIN } from "./compose.js";
import { PLUS_Y, normaliseDeg, round, type Degrees } from "./geometry.js";
import type { Motion, Pose } from "./types.js";

export interface CallDef {
  readonly name: string;
  /** Beats from the CALLERLAB timing chart, from point of contact. The composed
   *  chain must sum to this — `beats sum to the chart's N ✓` in the specs. */
  readonly chartBeats: number;
  readonly chain: readonly CatalogCall[];
  /**
   * Whether the call reads differently for the two sides of a couple —
   * **beau and belle**, never boy and girl (ADR-0012).
   *
   * Renamed from `roleDependent`, which was mis-named rather than merely unused: what
   * differs between the two dancers of an asymmetric call is their side of the couple,
   * and a field named for roles invites the gendered branch ADR-0012 rules out. None of
   * the starter three are asymmetric; Star Thru is the first that will be.
   */
  readonly positionDependent: boolean;
  /**
   * The chain each side of a couple walks, when they differ.
   *
   * Present only on position-dependent calls. `chain` stays the beau's, so
   * {@link applyCall} keeps meaning something for every call in the catalog.
   */
  readonly chains?: Readonly<Record<CouplePosition, readonly CatalogCall[]>>;
}

/** How far off their standing radius a Trade's dancers step to pass right shoulders. */
export const TRADE_LANE = LANE_OFFSET;
/** The outside dancer's arc radius, and the inside dancer's. */
export const TRADE_RADIUS_OUT = COUPLE_WIDTH / 2 + TRADE_LANE;
export const TRADE_RADIUS_IN = COUPLE_WIDTH / 2 - TRADE_LANE;

/**
 * One side of a Partner Trade: step onto your lane, walk the half circle, step off it.
 *
 * The two sides have the **same shape** and differ only in the orbit's direction and
 * radius, which is a check on the reading — a Trade really is one figure danced two
 * ways round. Both slide `left` then `right`, because each dancer's own left is the
 * way onto their lane and their own right is the way off it once they have turned
 * around.
 */
function tradeChain(turn: "left" | "right", radius: number): readonly CatalogCall[] {
  return [
    { block: "slide", params: { side: "left", distance: TRADE_LANE } },
    { block: "orbit", params: { turn, fraction: 0.5, radius } },
    { block: "slide", params: { side: "right", distance: TRADE_LANE } },
  ];
}

/** The beau passes outside, the belle inside — see the spec's correction 3. */
const BEAU_TRADE = tradeChain("right", TRADE_RADIUS_OUT);
const BELLE_TRADE = tradeChain("left", TRADE_RADIUS_IN);

export const partnerTrade: CallDef = {
  name: "Partner Trade",
  chartBeats: 6,
  positionDependent: true,
  chain: BEAU_TRADE,
  chains: { beau: BEAU_TRADE, belle: BELLE_TRADE },
};

/** Where dancer A stands in the pair frame. */
export const PAIR_A: Pose = { position: { x: 0, y: -0.5 }, facing: PLUS_Y };
/** Dancer B is always A rotated 180° about the pair centre. */
export const PAIR_B: Pose = { position: { x: 0, y: 0.5 }, facing: PLUS_Y + 180 };

export const dosado: CallDef = {
  name: "Dosado",
  chartBeats: 6,
  positionDependent: false,
  chain: [
    { block: "pass", params: { direction: "forward", shoulder: "right", exit: "lane" } },
    { block: "slide", params: { side: "right" } },
    // The return mirrors the outbound from the other lane: back straight, then
    // blend diagonally onto home — CALLERLAB's "slide slightly to the left to
    // return", walked as part of the "smooth circular path" (render feedback
    // 2026-07-26; a straight retreat with a sidestep correction read wrong).
    { block: "pass", params: { direction: "backward", shoulder: "left", exit: "close" } },
  ],
};

export const passThru: CallDef = {
  name: "Pass Thru",
  chartBeats: 2,
  positionDependent: false,
  chain: [
    { block: "pass", params: { direction: "forward", shoulder: "right", exit: "centered" } },
  ],
};

export const allemandeLeft: CallDef = {
  name: "Allemande Left",
  chartBeats: 8,
  positionDependent: false,
  chain: [{ block: "arm-turn", params: { hand: "left", fraction: 1, exit: "step-out" } }],
};

/**
 * California Twirl — the couple turns around under a raised arch.
 *
 * The **same net effect** as a Partner Trade (positions swapped, facings reversed) by a
 * different route: hands stay joined, the pair rotates as a unit about them, and the
 * belle takes a full turn under the arch on the way. That difference lives in
 * `momentum.rotation` rather than in the end pose, which is why the two calls are
 * candidates for an equivalence rather than duplicates.
 *
 * No lane is needed. The dancers stay diametrically opposite across the joined hands
 * for the whole rotation, so unlike Partner Trade there is nothing to separate — which
 * is a nice illustration that the lane is a property of the *figure*, not of exchanging
 * places.
 *
 * 🔴 The intermediate path is **provisional until rendered**, the same marker
 * `dosado.md` carried before its own watch. `moves.md`'s description says the beau
 * "stays in place or steps through", which is loose, and the rigid-rotation reading here
 * is the one consistent with the end state and with the hands staying joined.
 */
export const californiaTwirl: CallDef = {
  name: "California Twirl",
  chartBeats: 4,
  positionDependent: true,
  chain: [
    { block: "turn-under", params: { pivot: "right", turn: "right", fraction: 0.5, radius: COUPLE_WIDTH / 2, hand: "right", spin: 0 } },
  ],
  chains: {
    // The beau makes the arch: no spin, joined right hand, hands on his right.
    beau: [
      { block: "turn-under", params: { pivot: "right", turn: "right", fraction: 0.5, radius: COUPLE_WIDTH / 2, hand: "right", spin: 0 } },
    ],
    // The belle passes under it: one full turn, joined left hand, hands on her left.
    belle: [
      { block: "turn-under", params: { pivot: "left", turn: "right", fraction: 0.5, radius: COUPLE_WIDTH / 2, hand: "left", spin: 1 } },
    ],
  },
};

export const CALLS = {
  dosado,
  "pass-thru": passThru,
  "allemande-left": allemandeLeft,
  "partner-trade": partnerTrade,
  "california-twirl": californiaTwirl,
} as const;

export type CallName = keyof typeof CALLS;

/** Apply a call in the block-local frame (dancer enters at the origin facing `+y`). */
export function applyCall(name: CallName, start: Pose = ORIGIN): Motion {
  return compose(CALLS[name].chain, start);
}

/** Rotate a pose 180° about the pair centre — how dancer B is derived from A. */
export function counterpart(pose: Pose): Pose {
  return {
    position: { x: round(-pose.position.x), y: round(-pose.position.y) },
    facing: round(normaliseDeg(pose.facing + 180)),
  };
}

/**
 * Both dancers of a facing pair performing a call, in the shared pair frame.
 *
 * B's motion is A's rotated 180°, which is the pair symmetry the specs rely on —
 * so it is derived here rather than generated twice.
 */
export function applyCallToPair(name: CallName): { a: Motion; b: Motion } {
  const a = compose(CALLS[name].chain, PAIR_A);
  const b: Motion = {
    ...a,
    waypoints: a.waypoints.map((w) => ({
      beat: w.beat,
      x: round(-w.x),
      y: round(-w.y),
      facing: round(normaliseDeg(w.facing + 180)),
    })),
    entry: counterpart(a.entry),
    exit: counterpart(a.exit),
    momentum: {
      ...a.momentum,
      bodyFlow:
        a.momentum.bodyFlow === null ? null : rotateBearing(a.momentum.bodyFlow, 180),
    },
  };
  return { a, b };
}

function rotateBearing(b: Degrees, by: Degrees): Degrees {
  return round(normaliseDeg(b + by));
}

/**
 * A couple performing a call, keyed by dancer.
 *
 * The counterpart of {@link applyCallToPair} for the other two-dancer formation, and
 * deliberately **not** built on it. A facing pair points opposite ways and its symmetry
 * is a 180° rotation; a couple points the same way and its symmetry is a reflection —
 * and a position-dependent call has neither, because its two dancers walk different
 * figures. So each side is composed from its own chain rather than derived, which is
 * the only thing that works for all three cases.
 */
export function applyCallToCouple(
  name: CallName,
  couple: Couple,
): Record<string, Motion> {
  const def = CALLS[name];
  const out: Record<string, Motion> = {};
  for (const position of ["beau", "belle"] as const) {
    const chain = def.chains?.[position] ?? def.chain;
    const key = position === "beau" ? couple.beau : couple.belle;
    out[key] = compose(chain, positionOf(couple, position));
  }
  return out;
}
