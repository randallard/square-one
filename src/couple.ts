/**
 * The couple: two dancers side by side, facing the same way, with a left and a right.
 *
 * Planning ADR-0011's S1, and the formation every asymmetric call turns on. Ryan's
 * framing: *"define 'partner up' aka 'find a partner', at which point the couple
 * determines who is on the right and who is on the left."*
 *
 * ## Position, not role
 *
 * [ADR-0012](../docs/adr/0012-calls-key-off-couple-position-not-role.md): the two
 * positions are **beau** (left) and **belle** (right), and asymmetric calls branch on
 * position and never on role. A role (boy/girl, ADR-0003) is who a dancer is; a
 * position is where they are standing right now. Star Thru's source prose says "the
 * gent turns 1/4 right while the lady turns 1/4 left"; what it means is *beau* and
 * *belle*, and translating it once at spec time is what makes the call danceable by
 * any two people.
 *
 * `partnerUp` therefore **takes** the arrangement rather than inferring it. Nothing
 * here looks at a role.
 *
 * ## Left of what
 *
 * Left and right are the **dancers' own**, not the viewer's. Facing is
 * counterclockwise-positive from `+x` (`geometry.ts`), so a couple facing `+y` has its
 * beau at `−x` and its belle at `+x` — and the same couple turned to face `−y` has
 * them the other way round in world coordinates while nobody has moved relative to
 * anybody. Getting this backwards is invisible on a symmetric call and wrong on every
 * asymmetric one, which is the whole reason it is stated here and asserted in tests.
 */

import { PLUS_Y, deg2rad, normaliseDeg, round, type Degrees } from "./geometry.js";
import type { Pose } from "./types.js";

/**
 * Which side of a couple a dancer stands on, from the couple's own point of view.
 *
 * The engine's asymmetric-call vocabulary (ADR-0012). Deliberately not "left"/"right",
 * which are ambiguous about whose left, and deliberately not tied to boy/girl.
 */
export type CouplePosition = "beau" | "belle";
export const COUPLE_POSITIONS: readonly CouplePosition[] = ["beau", "belle"];

/** The other side. */
export function opposite(position: CouplePosition): CouplePosition {
  return position === "beau" ? "belle" : "beau";
}

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
 * {@link partnerUp}; a third is the engine's body-agnostic default and the ratio a
 * caller would recognise, not a fitted number.
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

/** A couple: who stands where, and which way the pair of them face. */
export interface Couple {
  /** Centre-to-centre distance between the two dancers. */
  readonly width: number;
  /** Midpoint between the two dancers. */
  readonly center: { readonly x: number; readonly y: number };
  /** The direction both dancers face. */
  readonly facing: Degrees;
  /** Keys for the dancer standing in each position. */
  readonly beau: string;
  readonly belle: string;
}

/**
 * The unit vector pointing to a couple's **belle** side, given its facing.
 *
 * Facing is CCW-positive from `+x`, so the dancers' own right — the belle side — is
 * the facing rotated **−90°**. Written as one function used by everything else here,
 * because a sign error in this expression is the kind that produces a set which looks
 * fine until the first call that can tell left from right.
 */
export function belleDirection(facing: Degrees): { x: number; y: number } {
  const a = deg2rad(facing - 90);
  return { x: round(Math.cos(a)), y: round(Math.sin(a)) };
}

/**
 * Form a couple, saying explicitly who takes which side.
 *
 * **The arrangement is an input** (ADR-0012). A consumer wanting the traditional
 * boy-beau / girl-belle arrangement passes it; a consumer wanting two dancers of the
 * same role standing together gets it, and no call breaks — which is the entire point
 * of keying calls off position.
 *
 * `center` and `facing` describe the couple as a unit, so a caller who knows where a
 * couple should stand does not have to work out two poses to say so.
 */
export function partnerUp(
  beau: string,
  belle: string,
  center: { x: number; y: number } = { x: 0, y: 0 },
  facing: Degrees = PLUS_Y,
  width: number = COUPLE_WIDTH,
): Couple {
  if (width <= 0) throw new Error("partnerUp: width must be positive");
  return {
    width: round(width),
    center: { x: round(center.x), y: round(center.y) },
    facing: round(normaliseDeg(facing)),
    beau,
    belle,
  };
}

/**
 * The joined inside hands — what "touch hands" names.
 *
 * A couple stands hand in hand: the **beau's right** and the **belle's left**, meeting
 * at the point between them. Which hands is a fact about the formation and belongs
 * here; how they are held — palm up beneath, palm down above — is a rendering
 * convention and belongs to whoever draws them.
 *
 * Returned rather than stored on {@link Couple}, because it is derivable and a stored
 * copy is a thing that can disagree with the positions it was derived from.
 */
export function insideHands(couple: Couple): {
  readonly point: { x: number; y: number };
  readonly beauHand: "right";
  readonly belleHand: "left";
} {
  return {
    point: { x: couple.center.x, y: couple.center.y },
    beauHand: "right",
    belleHand: "left",
  };
}

/** Where one side of a couple is standing. */
export function positionOf(couple: Couple, position: CouplePosition): Pose {
  const dir = belleDirection(couple.facing);
  const half = (couple.width / 2) * (position === "belle" ? 1 : -1);
  return {
    position: {
      x: round(couple.center.x + dir.x * half),
      y: round(couple.center.y + dir.y * half),
    },
    facing: couple.facing,
  };
}

/** Which side of this couple a dancer is standing on, or `null` if they are not in it. */
export function positionIn(couple: Couple, key: string): CouplePosition | null {
  if (key === couple.beau) return "beau";
  if (key === couple.belle) return "belle";
  return null;
}

/**
 * The couple as a set of poses, keyed by dancer — the shape `sequence.ts` dances.
 *
 * This is the join between the formation vocabulary and the motion machinery: a
 * formation says who stands where, a sequence moves them, and `resolveHome` asks
 * whether they got back. Keeping them separate is what lets S2 add four-dancer
 * formations without touching a line of the sequence layer.
 */
export function coupleSet(couple: Couple): Record<string, Pose> {
  return {
    [couple.beau]: positionOf(couple, "beau"),
    [couple.belle]: positionOf(couple, "belle"),
  };
}
