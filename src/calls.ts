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

import type { CatalogCall, Hold } from "./blocks/index.js";
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
   *
   * **Instantiated at {@link COUPLE_WIDTH}**, the engine's body-agnostic default. It is the
   * serialisable form — what the workshop shows and what the spec fixtures check — and it is
   * *not* what a couple of some other width dances. See {@link chainsAt}.
   */
  readonly chains?: Readonly<Record<CouplePosition, readonly CatalogCall[]>>;
  /**
   * The chains for a couple standing `width` apart — the same figure, sized to the pair
   * actually dancing it.
   *
   * 🔴 **Needed because a couple's width is a parameter and these chains contain
   * distances.** `COUPLE_WIDTH`'s own documentation has said since 2026-08-15 that it is a
   * body-agnostic default and *"a consumer with real bodies should compute it and pass it to
   * `partnerUp`"* — and townage does, passing 0.438. But the chains were written against the
   * constant, so every couple call was danced at one third of a unit however far apart the
   * pair were standing. At townage's width a Partner Trade landed both dancers at ±0.114
   * instead of ±0.219: the couple **narrowed by half on every call**, and two Trades still
   * came home only because both sides were wrong by the same amount (ADR-0015).
   *
   * Present on the couple calls whose geometry is width-dependent, which is all of them so
   * far. Absent means the chain is the same at any width, and `chains`/`chain` stand.
   */
  readonly chainsAt?: (
    width: number,
  ) => Readonly<Record<CouplePosition, readonly CatalogCall[]>>;
}

/**
 * How far each dancer is from the couple's centre at the pass — the separation the
 * right-shoulder pass actually gets, now the two dancers walk different figures.
 *
 * **It is `COUPLE_WIDTH / 2` and it is not a parameter.** The beau walks the circle the
 * couple is already standing on and the belle steps straight across its diameter, so at
 * the middle of the call he is at the top of the arc and she is at the centre — a whole
 * radius apart, with nothing tuned to make it so (ADR-0014).
 *
 * 🔴 The three constants that used to live here — `TRADE_LANE`, `TRADE_RADIUS_OUT`,
 * `TRADE_RADIUS_IN` — are gone with the lane they described. They separated the two arcs
 * by `2 × COUPLE_WIDTH × LANE_OFFSET`, which is **0.3 × the couple's width**; this is
 * 0.5 of it, from the shape of the figure rather than from a proportion borrowed off a
 * facing pair. `orbit`'s `lane` survives as a block capability for the wider Trade family
 * (Boys Trade, Ends Trade), whose dancers are a full unit apart and for whom the
 * symmetric reading of the figure is the right one.
 */
export const TRADE_PASS_SEPARATION = COUPLE_WIDTH / 2;

/**
 * The **beau's** half of a couple's 180° exchange: one forward semicircle, all the way
 * round the belle, on the circle the couple is already standing on.
 *
 * No lane. He needs no bow because she is not coming the other way round the same circle —
 * she is crossing its diameter, and the arc clears her by its own radius.
 *
 * `hold` is what makes this a California Twirl rather than a Partner Trade, and it is the
 * *only* thing (ADR-0017): the arc is the same arc, walked with the inside hands joined and
 * raised into an arch.
 */
function beauHalf(width: number, hold?: Hold): readonly CatalogCall[] {
  return [
    {
      block: "orbit",
      params: {
        turn: "right",
        fraction: 0.5,
        radius: width / 2,
        ...(hold === undefined ? {} : { hold }),
      },
    },
  ];
}

/**
 * The **belle's** half: a step to her left and a 180° pivot to the left, going nowhere
 * forward.
 *
 * Ryan, 2026-08-18, watching a Trade: *"really the belle should not move forward hardly at
 * all in this, since that makes the beau have to move even farther out to get around — for
 * the belle this is really a step left and pivot 180."* ADR-0014. And, later the same day,
 * watching a Twirl: *"belle's path might be the same as partner trade too — but she needs
 * to start the turn to the left, ccw, and make it only a 180 degree turn."* ADR-0017.
 *
 * She steps the couple's whole width, which is the distance between the two standing spots,
 * turning left through the step so that by its middle she is facing the way she is going.
 *
 * `hold` is again the whole difference between the two calls. Held, the step across *is*
 * the duck under the arch: she walks the diameter, and her own joined hand is over it.
 */
function belleHalf(width: number, hold?: Hold): readonly CatalogCall[] {
  return [
    {
      block: "step-pivot",
      params: {
        side: "left",
        distance: width,
        turn: "left",
        fraction: 0.5,
        ...(hold === undefined ? {} : { hold }),
      },
    },
  ];
}

/**
 * The couple's exchange at a given width, with or without the hands joined — **one figure,
 * and the hold is the parameter** (ADR-0017).
 *
 * Both couple calls in the catalog are instantiations of this. That is not a tidy-up: it is
 * the finding. Partner Trade and California Twirl were built as separate figures and
 * declared *equivalent* because they landed in the same place; they are the same paths, and
 * what distinguishes them is whether the dancers let go.
 */
const EXCHANGE_CHAINS_AT = (
  hold?: { readonly beau: Hold; readonly belle: Hold },
) => (width: number): Readonly<Record<CouplePosition, readonly CatalogCall[]>> => ({
  beau: beauHalf(width, hold?.beau),
  belle: belleHalf(width, hold?.belle),
});

/**
 * The arch a California Twirl is danced under: the couple's **inside** hands — the beau's
 * right and the belle's left, exactly the pair {@link insideHands} names — joined and
 * raised clear of the head for the whole call.
 *
 * Which hands is a fact about the formation and comes from there rather than being restated
 * per call; how high, and what it looks like, belongs to whoever draws it.
 */
const TWIRL_ARCH = {
  beau: { hand: "right", grip: "arch" },
  belle: { hand: "left", grip: "arch" },
} as const satisfies Readonly<Record<CouplePosition, Hold>>;

const TRADE_CHAINS_AT = EXCHANGE_CHAINS_AT();
const TWIRL_CHAINS_AT = EXCHANGE_CHAINS_AT(TWIRL_ARCH);

export const partnerTrade: CallDef = {
  name: "Partner Trade",
  // 4, per CALLERLAB's Basic Program Definitions §35.b and the 2023 timing chart —
  // and it is the whole call, because a couple is already at the point of contact the
  // chart measures from. It was 6 while the lane cost a beat at each end (ADR-0013).
  chartBeats: 4,
  positionDependent: true,
  chain: TRADE_CHAINS_AT(COUPLE_WIDTH).beau,
  chains: TRADE_CHAINS_AT(COUPLE_WIDTH),
  chainsAt: TRADE_CHAINS_AT,
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
 * California Twirl — the couple's 180° exchange, danced **holding on**, under a raised arch.
 *
 * 🔴 **The same two paths as a {@link partnerTrade}, and the joined hands are the
 * whole difference** (ADR-0017). Ryan, 2026-08-18, watching both: *"partner trade looks
 * good — california twirl beau might be same path but raise arm and have belle duck under
 * the two held hands."* So the beau walks his forward semicircle round the belle and the
 * belle steps across the diameter pivoting 180° to her left — and because his hand is over
 * the middle of that diameter, her step across **is** the duck under.
 *
 * This replaced a rigid rotation of the pair about the joined hands, in which the belle took
 * a full extra turn under a fixed arch and accumulated 540° clockwise. Ryan, of that: *"the
 * way it's running now the belle is doing 540 degree turn cw."* She turns 180° CCW, like any
 * belle exchanging places.
 *
 * The two calls therefore differ in exactly one measurable: **F2's hands**. A Trade leaves
 * both free, which is what lets it flow into anything; a Twirl finishes with the inside hand
 * the last one used, which is what a following call has to work around. That is a smaller
 * difference than the catalog used to claim and a real one — and it is why the pair are
 * still two calls rather than one with an alias.
 */
export const californiaTwirl: CallDef = {
  name: "California Twirl",
  chartBeats: 4,
  positionDependent: true,
  chain: TWIRL_CHAINS_AT(COUPLE_WIDTH).beau,
  chains: TWIRL_CHAINS_AT(COUPLE_WIDTH),
  chainsAt: TWIRL_CHAINS_AT,
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
  // Sized to **this** couple, not to `COUPLE_WIDTH` (ADR-0015). The static `chains` are the
  // default-width instantiation and are what the workshop and the spec fixtures read; what
  // gets danced is the figure at the width the pair are actually standing at.
  const chains = def.chainsAt?.(couple.width) ?? def.chains;
  for (const position of ["beau", "belle"] as const) {
    const chain = chains?.[position] ?? def.chain;
    const key = position === "beau" ? couple.beau : couple.belle;
    out[key] = compose(chain, positionOf(couple, position));
  }
  return out;
}
