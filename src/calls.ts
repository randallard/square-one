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
import { ORBIT_RADIUS, PASS_CLEARANCE, SLIDE_DISTANCE } from "./blocks/index.js";
import { positionOf, type Couple, type CouplePosition } from "./couple.js";
import {
  COUPLE_WIDTH,
  DEFAULT_PAIR_SHAPE,
  DEFAULT_SHAPE,
  type FigureShape,
} from "./shape.js";
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
    couple: FigureShape,
  ) => Readonly<Record<CouplePosition, readonly CatalogCall[]>>;
  /**
   * The chain for dancers of a given shape, when both sides walk the same one — the
   * position-independent counterpart of {@link chainsAt} (ADR-0020).
   *
   * Present on every call whose geometry depends on a body, which since ADR-0020 is every
   * call in the catalog: a Dosado's lane and a Pass Thru's lane are the room two people
   * need to pass, and an Allemande Left's circle is the radius two joined forearms hold
   * them at. Absent would mean a figure no body can change, and there are none left.
   *
   * 🔴 **A call has this or {@link chainsAt}, never both.** They answer the same question
   * at different granularities, and a call that offered both would be a call whose two
   * answers could disagree. `applyCallToCouple` reads `chainsAt` first and falls back to
   * this one applied to both sides, which is what lets a *couple* dance a Pass Thru sized
   * to their own bodies rather than to the body-agnostic default.
   */
  readonly chainAt?: (shape: FigureShape) => readonly CatalogCall[];
}

/**
 * The separation the pass gets **on a body-agnostic couple** — the arc's own radius,
 * `COUPLE_WIDTH / 2`.
 *
 * The beau walks the circle the couple is already standing on and the belle steps straight
 * across its diameter, so at the middle of the call he is at the top of the arc and she is at
 * the centre: a whole radius apart, with nothing tuned to make it so (ADR-0014).
 *
 * 🔴 **It stopped being the whole story on 2026-08-18.** ADR-0014 said this radius "is not a
 * parameter", and pinned in the same breath that it does not clear the *heads* on real bodies.
 * It is now the **floor** rather than the answer: a couple carries the clearance its bodies
 * need, and the beau's arc bows out to meet it when the radius is not enough (ADR-0016,
 * ADR-0018). This constant is what a couple who ask for nothing get, and it is what every
 * spec fixture is still written against.
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
function beauHalf(couple: FigureShape, hold?: Hold): readonly CatalogCall[] {
  const radius = couple.width / 2;
  // Which clearance the figure has to make is decided by **what is passing**: two bodies, or
  // two bodies with a joined hand up between their heads (ADR-0018). The `hold` already says
  // which, so nothing has to be told twice.
  const wanted = hold?.grip === "arch" ? couple.archClearance : couple.clearance;
  const lane = laneForClearance(couple.width, wanted);
  return [
    {
      block: "orbit",
      params: {
        turn: "right",
        fraction: 0.5,
        radius,
        ...(lane > 0 ? { lane } : {}),
        ...(hold === undefined ? {} : { hold }),
      },
    },
  ];
}

/**
 * The bow that gives this figure `wanted` room at its **closest moment**.
 *
 * 🔴 **Not `wanted − radius`, and the difference is the whole reason this is a function.** That
 * is the arithmetic for the separation *at the pass*, and the pass stops being the closest
 * moment as soon as the bow is large. `orbit`'s lane is `sin²`, widest at the middle; the belle
 * crosses the diameter at a constant rate. Bow him far enough out and the two of them are
 * nearest each other on the **way** to the pass rather than at it — measured at townage's arch
 * clearance, the closest approach came out 3% under the number the arithmetic promised, and 3%
 * is a hand inside a head.
 *
 * So it is solved rather than computed: the smallest bow whose *minimum* separation over the
 * whole call is at least `wanted`. Bisection, because the separation is monotonic in the bow —
 * the belle never leaves the disc the beau walks around, so pushing his arc outward moves him
 * further from her at every instant — and monotonic is all bisection needs.
 *
 * 🔴 **This measures the arc, and it is `orbit`'s job to emit a path that is one**
 * (ADR-0022). `sampleMotion` walks straight lines between waypoints, so what the dancers
 * actually follow is a polyline — and at the 45° spacing `orbit` used until 2026-08-21 the
 * chords sagged `r(1 − cos 22.5°)` inside the curve, about 7.6% of the radius. On townage's
 * cast a Trade solved to exactly the 0.710 its heads want **delivered 0.670**. The fix is the
 * sampling, not this function: compensating here would bow the beau wider to hide a chord, and
 * would have put a bow on the body-agnostic couple, who need none.
 *
 * Zero when the figure already has the room, which is every body-agnostic couple: the arc's own
 * radius is the default clearance, so nothing here fires until a consumer with bodies says
 * otherwise (ADR-0016).
 */
function laneForClearance(width: number, wanted: number): number {
  const radius = width / 2;
  if (!(wanted > radius)) return 0;

  /** How far apart the two of them are, `t` through the call, for a bow of `lane`. */
  const separation = (lane: number, t: number): number => {
    const a = Math.PI * t;
    const r = radius + lane * Math.sin(a) ** 2;
    // He walks the half circle from `−x` through `+y`; she crosses the diameter at a
    // constant rate. Both in the couple's own frame, centred between their standing spots.
    return Math.hypot(r * Math.cos(a) + radius * (1 - 2 * t), r * Math.sin(a));
  };

  /** The closest they get, over a sampling fine enough that the minimum is not stepped over. */
  const closest = (lane: number): number => {
    let worst = Infinity;
    for (let i = 0; i <= SEPARATION_SAMPLES; i++) {
      worst = Math.min(worst, separation(lane, i / SEPARATION_SAMPLES));
    }
    return worst;
  };

  // The bracket: the difference is a lower bound (it is exactly right at the pass, and the
  // minimum is never above the pass), and twice it has always been enough.
  // 🔴 **The bow cannot separate two dancers who are standing on their spots.** At both ends of
  // the call the separation is exactly the couple's own width, whatever the bow does in
  // between, so the minimum only ever *approaches* that width — a clearance near it costs an
  // unbounded bow for a vanishing gain, and one at or above it cannot be met at all. Measured
  // before this was bounded: townage's arch clearance came out at 1.003 of the width and the
  // beau orbited at **73 times** it.
  //
  // So the bow is capped at the couple's own width. Past that he is not dancing round his
  // partner, he is running a lap — and the cap is the couple's, not a number anybody picked. A
  // pair who want more get the widest bow the figure has, and the standing hold answers for the
  // ends, which is where it was solved.
  const cap = width;
  let lo = Math.min(cap, wanted - radius);
  let hi = cap;
  if (closest(hi) < wanted) return round(hi);
  for (let i = 0; i < BISECTION_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (closest(mid) < wanted) lo = mid;
    else hi = mid;
  }
  return round(hi);
}

/** How finely the separation is sampled when solving for the bow. */
const SEPARATION_SAMPLES = 256;
/** Enough to land the bow inside `round`'s own 1e-6 from any bracket this takes. */
const BISECTION_STEPS = 40;

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
function belleHalf(couple: FigureShape, hold?: Hold): readonly CatalogCall[] {
  return [
    {
      block: "step-pivot",
      params: {
        side: "left",
        distance: couple.width,
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
) => (couple: FigureShape): Readonly<Record<CouplePosition, readonly CatalogCall[]>> => ({
  beau: beauHalf(couple, hold?.beau),
  belle: belleHalf(couple, hold?.belle),
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
  chain: TRADE_CHAINS_AT(DEFAULT_SHAPE).beau,
  chains: TRADE_CHAINS_AT(DEFAULT_SHAPE),
  chainsAt: TRADE_CHAINS_AT,
};

/** Where dancer A stands in the pair frame. */
export const PAIR_A: Pose = { position: { x: 0, y: -0.5 }, facing: PLUS_Y };
/** Dancer B is always A rotated 180° about the pair centre. */
export const PAIR_B: Pose = { position: { x: 0, y: 0.5 }, facing: PLUS_Y + 180 };

/**
 * A body measurement, included in a chain only when it asks for more than the figure gives.
 *
 * The chains are the **serialisable** form of a call — what the custom-move workshop shows,
 * what a shared move travels as, and what the spec fixtures are written against — so the
 * body-agnostic instantiation has to come out byte-for-byte as the hand-written chain it
 * replaced. Emitting `clearance: 0.3` where the block's own default is 0.3 would be a
 * different document saying the same thing, and every fixture would have to learn the
 * difference.
 *
 * The idiom is `beauHalf`'s, generalised: it has spread its lane in only when the bow is
 * non-zero since ADR-0016.
 */
function sized<K extends string>(
  key: K,
  figure: number,
  wanted: number,
): Partial<Record<K, number>> {
  // Cast (ADR-0027, docs/any-registry.md): the computed key widens to `{ [x: string]: number }`,
  // but `key` is a `K`, so this is exactly one `K` key holding a number.
  return wanted > figure ? ({ [key]: wanted } as Record<K, number>) : {};
}

/**
 * Dosado, sized to the pair dancing it — **out along your own lane, across, and back along
 * the other**, with the lane as wide as the two bodies need (ADR-0020).
 *
 * The clearance reaches all three blocks and it is the same number in each: both passes split
 * it into two lanes, half a lane each, and the crossing `slide` is a full lane change — which
 * is that whole clearance. A pair who need more room to pass get a wider Dosado, not a slower one —
 * the chart's 6 beats are untouched and the stride lengthens inside them.
 *
 * 🔴 **Before this, the only way to give real bodies room here was to make the floor bigger.**
 * townage derives its entire frame scale from `2 × ENGINE_LANE_OFFSET` — the engine's fixed
 * 0.3 — so one wide pair pushed the whole square apart, and its own doc calls that *"whole-square
 * breathing done coarsely … the neediest pair sets the spacing for everyone, even in moves that
 * don't involve them."* The figure can now hold the accommodation instead of the floor.
 */
const DOSADO_CHAIN_AT = (shape: FigureShape): readonly CatalogCall[] => [
  {
    block: "pass",
    params: {
      direction: "forward",
      shoulder: "right",
      exit: "lane",
      ...sized("clearance", PASS_CLEARANCE, shape.clearance),
    },
  },
  {
    block: "slide",
    params: { side: "right", ...sized("distance", SLIDE_DISTANCE, shape.clearance) },
  },
  // The return mirrors the outbound from the other lane: back straight, then
  // blend diagonally onto home — CALLERLAB's "slide slightly to the left to
  // return", walked as part of the "smooth circular path" (render feedback
  // 2026-07-26; a straight retreat with a sidestep correction read wrong).
  {
    block: "pass",
    params: {
      direction: "backward",
      shoulder: "left",
      exit: "close",
      ...sized("clearance", PASS_CLEARANCE, shape.clearance),
    },
  },
];

export const dosado: CallDef = {
  name: "Dosado",
  chartBeats: 6,
  positionDependent: false,
  chain: DOSADO_CHAIN_AT(DEFAULT_PAIR_SHAPE),
  chainAt: DOSADO_CHAIN_AT,
};

/**
 * Pass Thru, sized to the pair dancing it — the same lane a Dosado's outbound uses, traced
 * as an S back onto the centre line so the dancer finishes on the counterpart's spot.
 *
 * The shallowest use of a clearance in the catalog and the one most likely to be seen: two
 * dancers walking straight past each other is where a square is closest to a collision, and
 * townage's own frame comment says as much — *"real dancers brush shoulders on a Pass Thru,
 * so tight is right."* Tight is right; through is not.
 */
const PASS_THRU_CHAIN_AT = (shape: FigureShape): readonly CatalogCall[] => [
  {
    block: "pass",
    params: {
      direction: "forward",
      shoulder: "right",
      exit: "centered",
      ...sized("clearance", PASS_CLEARANCE, shape.clearance),
      // 🧪 Heads ahead of their bodies meet first (`FigureShape.forward`, 2026-10-28).
      ...(shape.forward !== undefined && shape.forward > 0 ? { forward: shape.forward } : {}),
    },
  },
];

export const passThru: CallDef = {
  name: "Pass Thru",
  chartBeats: 2,
  positionDependent: false,
  chain: PASS_THRU_CHAIN_AT(DEFAULT_PAIR_SHAPE),
  chainAt: PASS_THRU_CHAIN_AT,
};

/**
 * Allemande Left, sized to the **arms** turning it — the catalog's one figure whose body
 * measurement is not a clearance (ADR-0020).
 *
 * Nobody passes anybody in an arm turn: the two dancers grip and walk a circle, and what
 * decides its radius is how far a joined forearm holds them off the shared pivot. Long arms
 * dance a wide Allemande and short arms a tight one, and unlike a clearance this one is not
 * floored — it is where two people's arms actually put them rather than room a figure has to
 * find, so a small measurement is meant.
 *
 * The **standoff** — where they stand before stepping in — is deliberately not passed. That
 * is the pair frame's own half-unit, a fact about the floor rather than about anybody's arms,
 * and `shape.width` is a couple's handhold span which a facing pair does not have.
 */
const ALLEMANDE_CHAIN_AT = (shape: FigureShape): readonly CatalogCall[] => [
  {
    block: "arm-turn",
    params: {
      hand: "left",
      fraction: 1,
      exit: "step-out",
      ...(shape.gripRadius === ORBIT_RADIUS ? {} : { gripRadius: shape.gripRadius }),
    },
  },
];

export const allemandeLeft: CallDef = {
  name: "Allemande Left",
  chartBeats: 8,
  positionDependent: false,
  chain: ALLEMANDE_CHAIN_AT(DEFAULT_PAIR_SHAPE),
  chainAt: ALLEMANDE_CHAIN_AT,
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
  chain: TWIRL_CHAINS_AT(DEFAULT_SHAPE).beau,
  chains: TWIRL_CHAINS_AT(DEFAULT_SHAPE),
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

/**
 * Every call the catalog knows, as a list.
 *
 * Here rather than spelled `Object.keys(CALLS)` at each use because the properties that
 * hold **over the whole catalog** are the ones worth asserting — "every call is sized to
 * the bodies dancing it" (ADR-0020) is a claim about the set, and a claim about a set has
 * to be able to name it. A call added without the property fails the assertion, which is
 * the difference between a rule and a habit.
 */
// Cast (any-registry): `Object.keys` returns `string[]`; CALLS is a const object, so its keys are exactly `CallName`.
export const ALL_CALL_NAMES = Object.keys(CALLS) as readonly CallName[];

/**
 * The chain a call is danced with at a given shape — the one place the fallback order is
 * written down (ADR-0020).
 *
 * `chainAt` first, because a shape-aware call knows how to size itself; `chain` after,
 * because a call that is not shape-aware is the same figure at every size and its static
 * chain is the whole truth. Both are correct answers, and which one applies is a property
 * of the call rather than of the caller.
 */
export function chainFor(def: CallDef, shape: FigureShape): readonly CatalogCall[] {
  return def.chainAt?.(shape) ?? def.chain;
}

/**
 * Apply a call in the block-local frame (dancer enters at the origin facing `+y`).
 *
 * `shape` is the bodies dancing it, defaulting to the facing pair's body-agnostic one —
 * so an existing caller gets exactly the motion they got before shapes existed, and a
 * caller with real dancers gets the figure sized to them (ADR-0020).
 */
export function applyCall(
  name: CallName,
  start: Pose = ORIGIN,
  shape: FigureShape = DEFAULT_PAIR_SHAPE,
): Motion {
  return compose(chainFor(CALLS[name], shape), start);
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
export function applyCallToPair(
  name: CallName,
  shape: FigureShape = DEFAULT_PAIR_SHAPE,
): { a: Motion; b: Motion } {
  const a = compose(chainFor(CALLS[name], shape), PAIR_A);
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
  //
  // A couple is a `FigureShape`, so a **position-independent** call sizes itself here too:
  // a couple dancing a Pass Thru passes at their own clearance rather than at the
  // body-agnostic lane, which is ADR-0020's half of the seam ADR-0015 opened. `chainsAt`
  // wins where a call has one, because only it can say what the two sides do differently.
  const chains = def.chainsAt?.(couple) ?? def.chains;
  for (const position of ["beau", "belle"] as const) {
    const chain = chains?.[position] ?? chainFor(def, couple);
    const key = position === "beau" ? couple.beau : couple.belle;
    out[key] = compose(chain, positionOf(couple, position));
  }
  return out;
}
