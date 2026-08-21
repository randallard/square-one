import { describe, expect, it } from "vitest";
import {
  COUPLE_POSITIONS,
  belleDirection,
  coupleSet,
  opposite,
  insideHands,
  partnerUp,
  positionIn,
  positionOf,
} from "../src/couple.js";
import { MINUS_X, MINUS_Y, PLUS_X, PLUS_Y, normaliseDeg } from "../src/geometry.js";
import { COUPLE_WIDTH } from "../src/shape.js";
import { resolveHome } from "../src/sequence.js";

describe("partnering up", () => {
  // Planning ADR-0011's S1. The couple is the formation every asymmetric call turns
  // on, and before this the engine had no way to say which side a dancer stands on.

  it("takes the arrangement rather than inferring it from anybody's role", () => {
    // ADR-0012's whole point. Two dancers of the same role can partner up, and
    // nothing complains — because calls key off position, not role.
    const c = partnerUp("girl-1", "girl-2");
    expect(c.beau).toBe("girl-1");
    expect(c.belle).toBe("girl-2");
    expect(positionIn(c, "girl-1")).toBe("beau");
    expect(positionIn(c, "girl-2")).toBe("belle");
  });

  it("says who is not in it", () => {
    expect(positionIn(partnerUp("a", "b"), "c")).toBeNull();
  });

  it("puts the belle on the dancers' own right, not the viewer's", () => {
    // Facing +y, the dancers' right is +x. The distinction is invisible on a
    // symmetric call and wrong on every asymmetric one.
    const c = partnerUp("a", "b", { x: 0, y: 0 }, PLUS_Y);
    // 5 places, not 9: `COUPLE_WIDTH` is a third, which is not representable, and
    // `geometry.round` quantises to 1e-6. Asserting tighter than the engine's own
    // granularity asserts the absence of a rounding scheme it chose on purpose.
    expect(positionOf(c, "belle").position.x).toBeCloseTo(COUPLE_WIDTH / 2, 5);
    expect(positionOf(c, "beau").position.x).toBeCloseTo(-COUPLE_WIDTH / 2, 5);
  });

  it("carries left and right around with the couple as it turns", () => {
    // The same two dancers, same sides, four facings. Nobody has moved relative to
    // anybody, and world coordinates say something different each time.
    const expected: Record<number, { x: number; y: number }> = {
      [PLUS_Y]: { x: 1, y: 0 },
      [PLUS_X]: { x: 0, y: -1 },
      [MINUS_Y]: { x: -1, y: 0 },
      [MINUS_X]: { x: 0, y: 1 },
    };
    for (const [facing, dir] of Object.entries(expected)) {
      const d = belleDirection(Number(facing));
      expect(d.x).toBeCloseTo(dir.x, 9);
      expect(d.y).toBeCloseTo(dir.y, 9);
    }
  });

  it("keeps the pair exactly one apart, whatever way they face", () => {
    // Same unit the facing-pair frame uses, so a call that turns one formation into
    // the other cannot silently rescale the set.
    //
    // Asserted to 5 places, not 6. `geometry.round` quantises to 1e-6, and both
    // coordinates are rounded before the distance is taken, so two roundings can put
    // the answer up to ~1e-6 out. Tightening past the engine's own granularity would
    // be asserting the absence of a rounding scheme this package chose on purpose.
    for (let facing = 0; facing < 360; facing += 17) {
      const c = partnerUp("a", "b", { x: 3, y: -2 }, facing);
      const beau = positionOf(c, "beau").position;
      const belle = positionOf(c, "belle").position;
      expect(Math.hypot(belle.x - beau.x, belle.y - beau.y)).toBeCloseTo(COUPLE_WIDTH, 5);
    }
  });

  it("stands both dancers on the couple's own facing", () => {
    const c = partnerUp("a", "b", { x: 0, y: 0 }, 210);
    expect(positionOf(c, "beau").facing).toBeCloseTo(210, 9);
    expect(positionOf(c, "belle").facing).toBeCloseTo(210, 9);
  });

  it("centres the couple on the point it was given", () => {
    const c = partnerUp("a", "b", { x: 4, y: 7 }, 33);
    const beau = positionOf(c, "beau").position;
    const belle = positionOf(c, "belle").position;
    // 5 places for `round`'s 1e-6 quantisation, as above.
    expect((beau.x + belle.x) / 2).toBeCloseTo(4, 5);
    expect((beau.y + belle.y) / 2).toBeCloseTo(7, 5);
  });

  it("normalises the facing it is handed", () => {
    expect(partnerUp("a", "b", { x: 0, y: 0 }, 450).facing).toBeCloseTo(normaliseDeg(450), 9);
  });

  it("has exactly two positions, and they are each other's opposite", () => {
    expect(COUPLE_POSITIONS).toHaveLength(2);
    for (const p of COUPLE_POSITIONS) expect(opposite(opposite(p))).toBe(p);
    expect(opposite("beau")).toBe("belle");
  });
});

describe("a couple is a set the sequence layer can dance", () => {
  it("hands over poses keyed by dancer", () => {
    // The join between formation vocabulary and motion machinery: a formation says
    // who stands where, a sequence moves them, `resolveHome` asks if they got back.
    const c = partnerUp("ryan", "myco");
    const set = coupleSet(c);
    expect(Object.keys(set).sort()).toEqual(["myco", "ryan"]);
    expect(set["ryan"]).toEqual(positionOf(c, "beau"));
    expect(set["myco"]).toEqual(positionOf(c, "belle"));
  });

  it("resolves home against itself", () => {
    const set = coupleSet(partnerUp("a", "b", { x: 1, y: 1 }, 120));
    expect(resolveHome(set, set).home).toBe(true);
  });

  it("is not home when the two swap sides — the couple is reversed, not restored", () => {
    // The check Partner Trade and California Twirl will both lean on: exchanging
    // places is emphatically not getting home, even though both dancers end up
    // standing on a spot a dancer started on.
    const before = coupleSet(partnerUp("a", "b"));
    const after = coupleSet(partnerUp("b", "a"));
    const r = resolveHome(before, after);
    expect(r.home).toBe(false);
    expect(r.worstDistance).toBeCloseTo(COUPLE_WIDTH, 6);
  });
});

describe("touch hands — the couple stands hand in hand", () => {
  // Ryan, 2026-08-15: "they should hold hands — we say touch hands — beau right palm up
  // and belle's left palm down … the characters need to be a bit closer together when
  // partnered up."

  it("stands a third of a facing pair's separation apart", () => {
    // It was a full unit, and that was wrong by more than "a bit": measured against
    // townage's default cast at its derived frame scale of 2.60, a unit-wide couple
    // stood 2.60 world units apart while their inside hands meet at 0.82.
    expect(COUPLE_WIDTH).toBeCloseTo(1 / 3, 9);
    expect(COUPLE_WIDTH).toBeLessThan(0.5);
  });

  it("names the joined hands, and they are the inside ones", () => {
    const hands = insideHands(partnerUp("a", "b"));
    expect(hands.beauHand).toBe("right");
    expect(hands.belleHand).toBe("left");
  });

  it("joins them at the point between the two dancers", () => {
    const c = partnerUp("a", "b", { x: 2, y: -3 }, 40);
    const hands = insideHands(c);
    const beau = positionOf(c, "beau").position;
    const belle = positionOf(c, "belle").position;
    expect(hands.point.x).toBeCloseTo((beau.x + belle.x) / 2, 5);
    expect(hands.point.y).toBeCloseTo((beau.y + belle.y) / 2, 5);
  });

  it("lets a consumer with real bodies say how close, since the engine cannot know", () => {
    // Shoulder offsets run 0.2 to 0.46 across townage's cast, so the touching distance
    // is a property of bodies. A third is the engine's body-agnostic default.
    const wide = partnerUp("a", "b", { x: 0, y: 0 }, PLUS_Y, 0.8);
    expect(wide.width).toBeCloseTo(0.8, 6);
    expect(positionOf(wide, "belle").position.x).toBeCloseTo(0.4, 5);
  });

  it("refuses a couple with no width rather than collapsing one", () => {
    expect(() => partnerUp("a", "b", { x: 0, y: 0 }, PLUS_Y, 0)).toThrow(/width/);
  });
});
