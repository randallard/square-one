/**
 * 🧪 **Facing couples** — two couples facing each other, the formation of four (planning
 * ADR-0011's S2), and **Right and Left Thru**, the first call danced from it (2026-10-28).
 *
 * Spec: `docs/spec/formations/facing-couples.md`, `docs/spec/calls/right-and-left-thru.md`.
 * Exploratory: no ADR yet. townage solved the arms of this call for four bodies on hand-written
 * paths first (its journals 2026-10-27-8 to 2026-10-28-4), and this is where those paths come
 * from now.
 *
 * ## What is new about four
 *
 * Everything before this was two dancers, and a two-dancer formation has exactly one other
 * dancer in it — so a grip never had to say whose hand. In a set of four it does: a Pull By's
 * right hand is the **opposite**'s, a Courtesy Turn's left is the **partner**'s. Blocks say
 * which in the formation's words (`Relation`); {@link applyCallToFacingCouples} resolves that to
 * a dancer's key, because only the set knows who is standing where.
 *
 * ## Kept apart from `CALLS`
 *
 * `CALLS` is the two-dancer catalog, and the properties asserted over it — every call applies
 * to a pair *and* to a couple, every call is sized by a `FigureShape` — are true of two dancers.
 * A call for four answers to a different shape, so it has its own catalog,
 * {@link FACING_COUPLES_CALLS}, rather than a member of `CALLS` that half its properties skip.
 */

import type { CatalogCall } from "./blocks/index.js";
import { PAIR_SEPARATION, PASS_CLEARANCE } from "./blocks/index.js";
import { compose } from "./compose.js";
import { partnerUp, positionOf, type Couple, type CouplePosition } from "./couple.js";
import { PLUS_Y, atLeast, normaliseDeg, round, type Degrees } from "./geometry.js";
import type { FigureShape } from "./shape.js";
import { reformCouple } from "./sequence.js";
import type { GripSpan, Motion, Relation } from "./types.js";

/** Two couples facing each other: `first` and `second` are symmetric, and named only so a set
 *  has an order to report in. */
export interface FacingCouples {
  readonly first: Couple;
  readonly second: Couple;
  /**
   * How far apart a dancer of one couple and a dancer of the other must be to **pass each
   * other** — the set's own clearance, beside each couple's.
   *
   * Not either couple's `clearance`, which is the room **partners** need, side by side. Dancers of
   * two couples passing in a Pull By have their arms between them as well: townage measures four
   * Ryans' shoulders standing 46 cm out past 30 cm torsos, and the gents stepped 38 cm wide of a
   * bodies-only lane (its journal 2026-10-27-8). And a Courtesy Turn closes in to the partners'
   * room, so the two numbers pull opposite ways and one field could not hold both (2026-10-28:
   * given the passing room, the couples never closed and his right arm crossed her forearm).
   *
   * Defaults to the wider couple's clearance.
   */
  readonly clearance: number;
}

/** How far a couple may stand off the line through the other's centre, or off facing it
 *  exactly, and still be facing it. Generous, because a consumer's floor is measured. */
export const FACING_POSITION_TOLERANCE = 0.05;
export const FACING_DEGREE_TOLERANCE: Degrees = 2;

const angleBetween = (a: Degrees, b: Degrees) => {
  const d = Math.abs(normaliseDeg(a - b));
  return Math.min(d, 360 - d);
};

/**
 * Two couples, checked to be **facing couples**: facing opposite ways, each straight in front of
 * the other. Throws otherwise rather than dancing a call from a formation it is not defined from.
 */
export function faceCouples(first: Couple, second: Couple, clearance?: number): FacingCouples {
  if (angleBetween(first.facing, second.facing + 180) > FACING_DEGREE_TOLERANCE) {
    throw new Error("faceCouples: the two couples are not facing opposite ways");
  }
  const a = (first.facing * Math.PI) / 180;
  const dx = second.center.x - first.center.x;
  const dy = second.center.y - first.center.y;
  const ahead = dx * Math.cos(a) + dy * Math.sin(a);
  const aside = -dx * Math.sin(a) + dy * Math.cos(a);
  if (!(ahead > 0)) throw new Error("faceCouples: the second couple is not in front of the first");
  if (Math.abs(aside) > FACING_POSITION_TOLERANCE) {
    throw new Error("faceCouples: the two couples are not on one line");
  }
  const passing = clearance ?? Math.max(first.clearance, second.clearance);
  if (!(passing > 0)) throw new Error("faceCouples: clearance must be positive");
  return { first, second, clearance: round(passing) };
}

/** One couple of a set to be stood up: who is beau, who is belle, and their measurements, as
 *  `partnerUp` takes them. */
export interface CoupleSpec {
  readonly beau: string;
  readonly belle: string;
  readonly shape?: number | Partial<FigureShape>;
}

/**
 * How far apart two couples must stand, centre to centre, to dance with each other: **a
 * clearance and half of each couple's width.**
 *
 * The courtesy turn is where it binds. Two couples turning back to back each swing one dancer
 * along the line between them, so mid-turn a beau and the other couple's belle are the
 * separation less both radii apart; that has to be a clearance. townage's hand-written Right and
 * Left Thru stood its couples exactly this far apart (`W + lane`, its journal 2026-10-27-8),
 * and the property test found the engine's own sets too close without it (0.95 for 0.955).
 *
 * The clearance is the set's ({@link FacingCouples.clearance}, by default the wider couple's), and
 * never less than a Pass Thru's (ADR-0021).
 */
export function roomToFace(first: FigureShape, second: FigureShape, passing?: number): number {
  const clearance = atLeast(PASS_CLEARANCE, passing ?? Math.max(first.clearance, second.clearance));
  return round(clearance + (first.width + second.width) / 2);
}

/**
 * Stand two couples up facing each other, `separation` apart centre to centre, about `center`;
 * `first` faces `facing`. `clearance` is the set's own, between dancers of the two couples
 * ({@link FacingCouples.clearance}).
 *
 * The separation is never less than {@link roomToFace}: asked for less, the couples stand that
 * far apart instead, the way a dancer steps back to make room. Unasked, it is the pair frame's
 * unit or that room, whichever is more — so a body-agnostic set is a facing pair's frame with a
 * couple at each end.
 */
export function setFacingCouples(
  first: CoupleSpec,
  second: CoupleSpec,
  separation: number = PAIR_SEPARATION,
  center: { x: number; y: number } = { x: 0, y: 0 },
  facing: Degrees = PLUS_Y,
  clearance?: number,
): FacingCouples {
  if (!(separation > 0)) throw new Error("setFacingCouples: separation must be positive");
  // Measured first, so the room is the couples' own.
  const a1 = partnerUp(first.beau, first.belle, { x: 0, y: 0 }, facing, first.shape);
  const a2 = partnerUp(second.beau, second.belle, { x: 0, y: 0 }, facing, second.shape);
  separation = Math.max(separation, roomToFace(a1, a2, clearance));
  const a = (facing * Math.PI) / 180;
  const off = { x: (Math.cos(a) * separation) / 2, y: (Math.sin(a) * separation) / 2 };
  return faceCouples(
    partnerUp(first.beau, first.belle, { x: center.x - off.x, y: center.y - off.y }, facing, first.shape),
    partnerUp(second.beau, second.belle, { x: center.x + off.x, y: center.y + off.y }, facing + 180, second.shape),
    clearance,
  );
}

/** Centre to centre, the two couples. */
export function separationOf(set: FacingCouples): number {
  return Math.hypot(set.second.center.x - set.first.center.x, set.second.center.y - set.first.center.y);
}

/** Which couple of the set, and which side of it. */
export interface Place {
  readonly couple: "first" | "second";
  readonly position: CouplePosition;
}

/** Every dancer of a set, keyed, with where they stand in it. */
export function placesOf(set: FacingCouples): Record<string, Place> {
  return {
    [set.first.beau]: { couple: "first", position: "beau" },
    [set.first.belle]: { couple: "first", position: "belle" },
    [set.second.beau]: { couple: "second", position: "beau" },
    [set.second.belle]: { couple: "second", position: "belle" },
  };
}

/**
 * The dancer a relation names, from `key`'s point of view: their **partner**, the other side of
 * their own couple; or their **opposite**, the dancer of the other couple straight across — the
 * other couple's *other* side, because a couple facing you has its beau on your right.
 */
export function relative(set: FacingCouples, key: string, relation: Relation): string {
  const place = placesOf(set)[key];
  if (place === undefined) throw new Error(`relative: ${key} is not in this set`);
  const own = set[place.couple];
  const other = set[place.couple === "first" ? "second" : "first"];
  if (relation === "partner") return place.position === "beau" ? own.belle : own.beau;
  return place.position === "beau" ? other.belle : other.beau;
}

/**
 * A call for facing couples: its chart timing, and the chain each dancer walks — from their own
 * place, the other couple's shape, and how far apart the couples stand.
 */
export interface FacingCouplesCallDef {
  readonly name: string;
  readonly chartBeats: number;
  readonly chainFor: (set: FacingCouples, place: Place) => readonly CatalogCall[];
}

/**
 * The gap two dancers walking straight past each other must have **as they draw level**, for
 * their closest moment to be `wanted` — solved, not assumed.
 *
 * They close `separation` between them over the walk while the sideways gap opens from `start`
 * to the answer on the pull-by's `sin²` profile. With a lane small beside the walk the closest
 * moment is the crossing and the answer is `wanted`; with a wide one they are nearest a little
 * **before** it, and a gap of exactly `wanted` there delivers less — `laneForClearance`'s finding
 * for the Trade's bow, here again (2026-10-28, the property test: 0.507 for 0.518).
 *
 * Bisection: the gap at every instant grows with the gap at the crossing, so the closest moment
 * does too.
 */
function gapAtCrossing(start: number, separation: number, wanted: number): number {
  const closest = (gap: number): number => {
    let worst = Infinity;
    for (let i = 0; i <= GAP_SAMPLES; i++) {
      const t = i / GAP_SAMPLES;
      const x = start + (gap - start) * Math.sin(Math.PI * t) ** 2;
      worst = Math.min(worst, Math.hypot(x, separation * (1 - 2 * t)));
    }
    return worst;
  };
  if (closest(wanted) >= wanted) return wanted;
  let lo = wanted;
  let hi = 2 * wanted;
  // Doubled until it is enough: with a clearance near the length of the walk the answer can be
  // several clearances (0.794 to pass over a walk of 1 wants 2.5 at the crossing).
  while (closest(hi) < wanted) [lo, hi] = [hi, 2 * hi];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (closest(mid) < wanted) lo = mid;
    else hi = mid;
  }
  return hi;
}

const GAP_SAMPLES = 256;

/** One dancer's pull-by: the gap they and the opposite walk at, and their drift on top. */
interface PullByLateral {
  readonly gap: number;
  readonly drift: number;
}

/**
 * Where all four dancers are, sideways, as they draw level in a Right Pull By — and so what each
 * one's `pull-by` is asked for.
 *
 * Worked in the first couple's frame (`x` to their right). Three pairs pass: each beau and the
 * opposite belle, right shoulders, about the middle of their two lines; and the two belles, side
 * by side in the middle of the set, each moved inward by her own pair's lane. Each gets a
 * clearance — the set's, since these are dancers of different couples, and never less than a
 * Pass Thru's (ADR-0021) — at
 * its closest moment ({@link gapAtCrossing}). The belles' is bought by **spreading** both
 * couples outward by the same amount, which keeps each crossing pair's own gap.
 */
function pullByLaterals(set: FacingCouples): Record<"first" | "second", Record<CouplePosition, PullByLateral>> {
  const w1 = set.first.width;
  const w2 = set.second.width;
  const sep = separationOf(set);
  const clearance = atLeast(PASS_CLEARANCE, set.clearance);
  // Sideways gaps at the start: the first beau to the second belle, the first belle to the
  // second beau, and the two belles.
  const gapA = gapAtCrossing((w1 - w2) / 2, sep, clearance);
  const gapB = gapAtCrossing((w2 - w1) / 2, sep, clearance);
  const gapBelles = gapAtCrossing((w1 + w2) / 2, sep, clearance);
  const midA = -(w1 + w2) / 4;
  const midB = (w1 + w2) / 4;
  const spread = Math.max(0, (gapBelles + (gapA + gapB) / 2 - (w1 + w2) / 2) / 2);
  // At the crossing, and where each started, in the first couple's frame.
  const at = {
    first: { beau: [midA - gapA / 2 - spread, -w1 / 2, gapA], belle: [midB - gapB / 2 + spread, w1 / 2, gapB] },
    second: { beau: [midB + gapB / 2 + spread, w2 / 2, gapB], belle: [midA + gapA / 2 - spread, -w2 / 2, gapA] },
  } as const;
  const lateral = (couple: "first" | "second", [mid, start, gap]: readonly [number, number, number]): PullByLateral => {
    // To the dancer's own right; the second couple faces the other way.
    const right = (couple === "first" ? 1 : -1) * (mid - start);
    // A Right Pull By's lane is already half the gap to the dancer's left.
    return { gap, drift: right + gap / 2 };
  };
  return {
    first: { beau: lateral("first", at.first.beau), belle: lateral("first", at.first.belle) },
    second: { beau: lateral("second", at.second.beau), belle: lateral("second", at.second.belle) },
  };
}

/**
 * Right and Left Thru — *"Right Pull By; Courtesy Turn"* (CALLERLAB Basic §22), 6 beats from
 * facing couples.
 *
 * **The Pull By.** Each dancer walks straight across to the other couple's line, passing the
 * opposite right shoulders with right hands joined, let go before they are level. Two lanes:
 * - each crossing pair (a beau and the opposite belle) steps apart by the room they need,
 *   about the middle of their two starting lines, so couples of different widths still pass
 *   straight;
 * - and both couples **spread** by whatever more the two belles need, because they pass each
 *   other in the middle of the set, side by side, each moved inward by her own pair's lane.
 *
 * **The Courtesy Turn.** Each couple turns half way round, to the left, about the point halfway
 * between them: the belle walks forward round it and the beau backs round it (`orbit`'s
 * `direction`), his left in her left and his right in the small of her back. They turn close —
 * the circle bows in from their standing width to **their own** clearance (the couple's, not the
 * set's), as near as the two
 * bodies can be side by side with his arm round her, and back out by the end, so they finish
 * at their own width. townage found the closing by solving it (its journal 2026-10-27-8): at a
 * standing width the hand on her back could not reach.
 *
 * Ends in facing couples, each couple on the other's line, beau and belle as they were.
 */
export const rightAndLeftThru: FacingCouplesCallDef = {
  name: "Right and Left Thru",
  chartBeats: 6,
  chainFor(set, place) {
    const own = set[place.couple];
    const r = pullByLaterals(set)[place.couple][place.position];
    const radius = own.width / 2;
    const close = Math.max(0, radius - Math.min(own.width, own.clearance) / 2);
    const turn: CatalogCall = {
      block: "orbit",
      params: {
        turn: "left",
        fraction: 0.5,
        radius,
        // As a unit: square to the line between them while the circle bows in and out.
        unit: true,
        ...(close > 0 ? { lane: round(-close) } : {}),
        ...(place.position === "beau"
          ? {
              direction: "backward" as const,
              hold: [
                { hand: "left", grip: "palm", relation: "partner" },
                { hand: "right", grip: "back", relation: "partner" },
              ] as const,
            }
          : { hold: { hand: "left", grip: "palm", relation: "partner" } as const }),
      },
    };
    return [
      {
        block: "pull-by",
        params: {
          hand: "right",
          distance: round(separationOf(set)),
          clearance: round(r.gap),
          ...(Math.abs(r.drift) < 1e-9 ? {} : { drift: round(r.drift) }),
        },
      },
      turn,
    ];
  },
};

export const FACING_COUPLES_CALLS = {
  "right-and-left-thru": rightAndLeftThru,
} as const;

export type FacingCouplesCallName = keyof typeof FACING_COUPLES_CALLS;

/**
 * Every dancer of a facing-couples set performing a call, keyed by dancer — each grip told who
 * it is held with (`GripSpan.with`).
 */
export function applyCallToFacingCouples(
  name: FacingCouplesCallName,
  set: FacingCouples,
): Record<string, Motion> {
  const def = FACING_COUPLES_CALLS[name];
  const out: Record<string, Motion> = {};
  for (const [key, place] of Object.entries(placesOf(set))) {
    const motion = compose(def.chainFor(set, place), positionOf(set[place.couple], place.position));
    out[key] = {
      ...motion,
      grips: motion.grips.map(
        (g): GripSpan => (g.relation === undefined ? g : { ...g, with: relative(set, key, g.relation) }),
      ),
    };
  }
  return out;
}

/**
 * The set a call left: each couple rebuilt from where its dancers finished (`reformCouple`), and
 * checked to be facing couples again — which is the ending formation Right and Left Thru is
 * defined to have, asserted rather than assumed.
 */
export function reformFacingCouples(set: FacingCouples, motions: Record<string, Motion>): FacingCouples {
  return faceCouples(reformCouple(set.first, motions), reformCouple(set.second, motions), set.clearance);
}
