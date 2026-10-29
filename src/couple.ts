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
import { COUPLE_WIDTH, DEFAULT_SHAPE, type FigureShape } from "./shape.js";
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
 * The measurements a couple is sized against.
 *
 * 🔴 **Moved to `shape.ts` and renamed `FigureShape`** (ADR-0020). It was `CoupleShape`
 * here because the couple exchange was the only figure that read any of it; every call in
 * the catalog reads it now, including the ones a facing pair dances, and a facing pair is
 * not a couple. {@link COUPLE_WIDTH} went with it — a handhold span is a body measurement,
 * which is what that module is.
 */

/**
 * A couple: who stands where, which way the pair of them face, and how big they are.
 *
 * **A couple is a {@link FigureShape} plus a place to stand.** The four length fields come
 * from there, and the split is load-bearing rather than tidy: the shape is everything a
 * chain may read, and `center`/`facing` are exactly what it may not. A `Couple` is handed
 * straight to `chainsAt`, which declares the narrower type and therefore cannot reach the
 * floor even though the object it is given knows where the floor is.
 */
export interface Couple extends FigureShape {
  /** Centre-to-centre distance between the two dancers. */
  readonly width: number;
  /**
   * How far apart the two dancers must be to **pass each other** without touching.
   *
   * The second body-derived number a couple carries, and it exists for the same reason
   * {@link width} does: the engine models dancers as points, so its own collision invariant is
   * "no shared coordinate" and two points a hair apart satisfy it. A consumer that knows how
   * wide anybody is knows better, and a figure whose dancers pass — a Trade — has to be built
   * from that number rather than from a proportion (ADR-0015).
   *
   * Defaults to `width / 2`, the couple's own radius, which is what a Partner Trade's arc gives
   * for free — so the body-agnostic engine asks for no extra room and behaves exactly as it did
   * before this existed. townage passes its cast's real clearance, and the beau's arc bows out
   * to meet it (ADR-0016).
   */
  readonly clearance: number;
  /**
   * How far apart the two dancers must be to pass each other **under a raised arch** — with a
   * joined hand up between their two heads.
   *
   * A third body-derived number, and it exists because the arch changes what is passing. With
   * hands free the two dancers have to clear each other; with hands joined and raised there is a
   * **hand in the gap as well**, at head height, and it belongs to neither of them. So the room
   * a Twirl's pass needs is strictly more than the room a Trade's does, out of the same bodies.
   *
   * Measured in townage on the shipped cast: bodies want 0.520, heads want 0.710, and heads
   * with a hand between them want **1.084** — against a couple who stand 1.140 apart. An arch
   * very nearly forbids the pair to approach each other at all (ADR-0018).
   *
   * Defaults to {@link clearance}, so a consumer who does not know about arches gets exactly the
   * behaviour they had before this existed.
   */
  readonly archClearance: number;
  /**
   * How far from a joined forearm the couple's dancers stand — the **arm** measurement, and
   * the fourth and last body-derived number a couple carries (ADR-0020).
   *
   * A couple has arms as surely as a facing pair does, and the calls that grip them are on the
   * way: Star Thru's arch, an Allemande from a couple, the whole Trade family beyond this one.
   * Carried here so a couple is a complete {@link FigureShape} and any call in the catalog can
   * be sized to it, rather than the couple calls being sized and the rest falling back to the
   * body-agnostic default halfway through a sequence — which is exactly the bug ADR-0019 fixed
   * one field over.
   *
   * Defaults to `arm-turn`'s own `ORBIT_RADIUS`, so a consumer who has not measured arms gets
   * the behaviour they had before this existed.
   */
  readonly gripRadius: number;
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
 *
 * ## The measurements, two ways
 *
 * `shape` takes either a **width** — the original signature, and what every existing caller
 * passes — or a **{@link FigureShape} with any subset of its fields**, which is the readable
 * form once there are four of them. Passing an object *and* the trailing positionals throws
 * rather than picking a winner: a caller who does both has two different intentions and the
 * engine should not guess which one survived.
 *
 * Anything unmeasured falls back the way it always has: clearance to the couple's own radius,
 * the arch clearance to the clearance, and the grip radius to `arm-turn`'s (ADR-0020).
 */
export function partnerUp(
  beau: string,
  belle: string,
  center: { x: number; y: number } = { x: 0, y: 0 },
  facing: Degrees = PLUS_Y,
  shape: number | Partial<FigureShape> = COUPLE_WIDTH,
  clearance?: number,
  archClearance?: number,
  gripRadius?: number,
): Couple {
  if (typeof shape !== "number") {
    if (clearance !== undefined || archClearance !== undefined || gripRadius !== undefined) {
      throw new Error(
        "partnerUp: pass the measurements in the shape object or positionally, not both",
      );
    }
  }
  // One normalised bag either way, so the fallbacks below are written once. They chain:
  // an unmeasured arch clearance is the hands-free one, which is itself the couple's own
  // radius when nobody measured that either (ADR-0016, ADR-0018).
  const given: Partial<FigureShape> =
    typeof shape === "number"
      ? {
          width: shape,
          ...(clearance === undefined ? {} : { clearance }),
          ...(archClearance === undefined ? {} : { archClearance }),
          ...(gripRadius === undefined ? {} : { gripRadius }),
        }
      : shape;
  const width = given.width ?? COUPLE_WIDTH;
  const measured: FigureShape = {
    width,
    clearance: given.clearance ?? width / 2,
    archClearance: given.archClearance ?? given.clearance ?? width / 2,
    gripRadius: given.gripRadius ?? DEFAULT_SHAPE.gripRadius,
    ...(given.forward === undefined ? {} : { forward: given.forward }),
  };
  for (const [key, value] of Object.entries(measured)) {
    if (key === "forward" ? !(value >= 0) : !(value > 0)) throw new Error(`partnerUp: ${key} must be positive`);
  }
  return {
    width: round(measured.width),
    clearance: round(measured.clearance),
    archClearance: round(measured.archClearance),
    gripRadius: round(measured.gripRadius),
    ...(measured.forward === undefined ? {} : { forward: round(measured.forward) }),
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
