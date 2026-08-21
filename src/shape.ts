/**
 * The measurements a figure is sized against — every length a call may legitimately
 * depend on, and nothing about who or where anybody is.
 *
 * ## Why this is its own module now
 *
 * Three of these four measurements were `CoupleShape` in `couple.ts`, because the couple
 * exchange was the only figure that read any of them (ADR-0015, ADR-0016, ADR-0018). It is
 * no longer: **every call in the catalog is sized to the bodies dancing it** (ADR-0020), and
 * a Dosado is danced by a facing pair which is not a couple at all. So the type moved out
 * from under the formation that happened to need it first.
 *
 * ## The four measurements are the four things a body varies by
 *
 * | Field | What varies | Who reads it |
 * | --- | --- | --- |
 * | {@link FigureShape.width} | the **handhold** — how far apart two people can stand holding hands | the couple exchange |
 * | {@link FigureShape.clearance} | the **body** (and the head, which is what makes a body widest) | every figure whose dancers pass |
 * | {@link FigureShape.archClearance} | the **head with a joined hand between two of them** | figures danced under an arch |
 * | {@link FigureShape.gripRadius} | the **arm** — how far a joined forearm holds you off the pivot | the arm-turn family |
 *
 * ## Bodies widen a figure; they never narrow it
 *
 * 🔴 [ADR-0021](../docs/adr/0021-a-body-widens-a-figure-and-never-narrows-it.md) — the rule
 * every consumer of this type follows, and the reason a shape can be passed anywhere without a
 * caller having to check whether it is safe. A figure's shape comes from
 * the source — CALLERLAB describes a Dosado's lane, a Trade's arc, an Allemande's turn — and
 * a body is only ever the *floor* under it. So a measurement smaller than the figure's own is
 * ignored rather than applied: `laneForClearance` has returned `0` for one since ADR-0016,
 * and the blocks do the same with `atLeast` (`geometry.ts`).
 *
 * Without it, a consumer with small dancers would find its figures quietly collapsing —
 * a Dosado's lane shrinking to nothing because two children can pass in less room than the
 * call is drawn with. The room a call needs and the room two bodies need are different
 * claims, and the figure is the larger of them.
 */

import { PASS_CLEARANCE } from "./blocks/pass.js";
import { ORBIT_RADIUS } from "./blocks/arm-turn.js";

/**
 * How far apart the two dancers of a couple stand, centre to centre.
 *
 * **A third of a facing pair's separation, because a couple is holding hands.** Ryan,
 * 2026-08-15: *"they should hold hands — we say touch hands — beau right palm up and
 * belle's left palm down … so the characters need to be a bit closer together when
 * partnered up."*
 *
 * It was `1` — the same as a facing pair — and that was wrong by more than "a bit".
 * Measured against townage's default cast at its derived frame scale of 2.60, a
 * unit-wide couple stands **2.60 world units** apart while their inside hands meet at
 * **0.82**: over three times too far, with the bodies not even close to touching at
 * 0.52. A third puts them within a hair of hand contact for that cast.
 *
 * 🔴 **The exact touching distance is a property of bodies, and this constant cannot
 * know them** — it depends on each dancer's shoulder offset, which runs 0.2 to 0.46
 * across the shipped cast. A consumer with real bodies should compute it and pass it to
 * `partnerUp`; a third is the engine's body-agnostic default and the ratio a caller
 * would recognise, not a fitted number.
 *
 * 🔴 **And on 2026-08-16 a consumer did, which is worth recording as the seam working
 * rather than as this constant being wrong.** townage measured its own cast and passes
 * **0.438** — a third put the couple 0.868 world units apart while one dancer's
 * shoulders alone are 0.920 across, so each inside shoulder sat *over* the joined hands
 * and both arms hung dead vertical. "Within a hair of hand contact", above, was true and
 * insufficient: hands can meet and still have nothing that reads as a handhold. Nothing
 * here changes — a third remains the right body-agnostic answer, and the fix belonged on
 * the side that owns shoulders.
 */
export const COUPLE_WIDTH = 1 / 3;

/**
 * Everything about the dancers that has a length — what a call's chains are sized against.
 *
 * A chain may depend on these and on nothing else. A chain that could see a centre or a
 * facing would be a chain that could bake the floor into the figure, which is the
 * distinction `CallDef.chainsAt` and `CallDef.chainAt` exist to enforce.
 *
 * 🔴 **Renamed from `CoupleShape`** when the catalog's pair calls started reading it too
 * (ADR-0020). Same three fields it had, plus {@link gripRadius}.
 */
export interface FigureShape {
  /**
   * How far apart the two dancers of a **couple** stand, centre to centre — the span
   * of their joined inside hands. See {@link COUPLE_WIDTH}.
   *
   * 🔴 **A facing pair's separation is deliberately not this field, or any field.** Two
   * dancers standing a unit apart facing each other are a unit apart because that is the
   * frame the specs are written in (`calls.ts`, the pair frame) — a fact about the floor,
   * which a consumer varies by scaling the floor. A handhold span is a fact about two sets
   * of shoulders, and it is here because nothing but the bodies can supply it.
   */
  readonly width: number;
  /**
   * How far apart two dancers must be to **pass each other** without touching, hands free.
   *
   * The engine models dancers as points, so its own collision invariant is "no shared
   * coordinate" and two points a hair apart satisfy it. A consumer that knows how wide
   * anybody is knows better, and any figure whose dancers pass — a Dosado, a Pass Thru, a
   * Trade — has to be built from that number rather than from a proportion (ADR-0015,
   * ADR-0020).
   *
   * **Heads are in here**, not in `archClearance`: a head at its widest is usually what
   * decides how much room two bodies need side by side, and townage measures it that way
   * (`lateralClearance` runs over torsos *and* heads). `archClearance` is what the same two
   * bodies need with something extra between them.
   */
  readonly clearance: number;
  /**
   * How far apart two dancers must be to pass each other **under a raised arch** — with a
   * joined hand up between their two heads.
   *
   * It exists because the arch changes what is passing. With hands free the two dancers
   * have to clear each other; with hands joined and raised there is a **hand in the gap as
   * well**, at head height, and it belongs to neither of them. So the room a Twirl's pass
   * needs is strictly more than the room a Trade's does, out of the same bodies.
   *
   * Measured in townage on the shipped cast: bodies want 0.520, heads want 0.710, and heads
   * with a hand between them want **1.084** — against a couple who stand 1.140 apart. An
   * arch very nearly forbids the pair to approach each other at all (ADR-0018).
   */
  readonly archClearance: number;
  /**
   * How far from the shared pivot a dancer stands once **forearms are joined** — an arm
   * measurement, and the catalog's only one.
   *
   * Two dancers gripping each other's forearms stand at a distance their arms decide: long
   * arms hold you further off the pivot than short ones, and the Allemande Left they walk is
   * a wider circle for it. `arm-turn`'s {@link ORBIT_RADIUS} is the body-agnostic answer and
   * the default here.
   *
   * 🔴 **Not floored the way the clearances are** — ADR-0021's exception. A clearance is
   * room a figure must *find*, so a small one changes nothing; a grip radius is where two
   * people's arms actually put them, and short arms genuinely dance a tighter turn. Nothing
   * collapses: the block guards it positive, and the standoff a dancer steps in *from* is a
   * frame fact rather than this one.
   */
  readonly gripRadius: number;
}

/**
 * The body-agnostic defaults — what a figure gets from a consumer who says nothing about
 * bodies, and what every spec fixture in this repo is written against.
 *
 * Each is the figure's own number rather than a measurement: a third of a unit apart, passing
 * at the arc's own radius, gripping where `arm-turn` has always gripped. So a shape-aware
 * call danced at this shape emits the chain it emitted before it was shape-aware, which is
 * the property the catalog's `chain`/`chains` fields rest on and the one the tests pin.
 */
export const DEFAULT_SHAPE: FigureShape = {
  width: COUPLE_WIDTH,
  clearance: COUPLE_WIDTH / 2,
  archClearance: COUPLE_WIDTH / 2,
  gripRadius: ORBIT_RADIUS,
};

/**
 * The shape a **facing pair** gets by default.
 *
 * Differs from {@link DEFAULT_SHAPE} in `clearance` alone, and the difference is the two
 * formations' own geometry rather than a preference: a couple's default clearance is the
 * radius of the arc its exchange walks (`width / 2`, ADR-0014), and a facing pair's is the
 * lane a `pass` is drawn with ({@link PASS_CLEARANCE}, and the two dancers get half of it
 * each). Neither is a body. `width` is carried unchanged and unread — a facing pair has no
 * handhold to have a span.
 */
export const DEFAULT_PAIR_SHAPE: FigureShape = {
  ...DEFAULT_SHAPE,
  clearance: PASS_CLEARANCE,
};

/**
 * A shape with any subset of its measurements replaced — the readable way to say
 * "these bodies, defaults for the rest".
 *
 * Consumers acquire these measurements one at a time, as they build the thing that can take
 * them: townage had a width for two days before it had an arch clearance, and has neither a
 * hands-free clearance nor a grip radius yet. A partial is what that looks like at the seam.
 */
export function shapeOf(
  overrides: Partial<FigureShape> = {},
  base: FigureShape = DEFAULT_SHAPE,
): FigureShape {
  const shape: FigureShape = { ...base, ...overrides };
  for (const [key, value] of Object.entries(shape)) {
    if (!(value > 0)) throw new Error(`shapeOf: ${key} must be positive`);
  }
  // 🔴 Deliberately **not** rounded, unlike everything a block emits. A shape is an input —
  // somebody's measurement of somebody's body — and rounding it here would mean
  // `shapeOf(DEFAULT_SHAPE)` did not equal `DEFAULT_SHAPE`, since a third of a unit is not
  // a six-decimal number. The geometry that comes out the far end is rounded where it is
  // generated, which is the only place a rounding belongs.
  return shape;
}
