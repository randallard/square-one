import { describe, expect, it } from "vitest";
import { applyCallToCouple, californiaTwirl, partnerTrade } from "../src/calls.js";
import { COUPLE_WIDTH, partnerUp } from "../src/couple.js";
import { danceCoupleSequence, isCoupleZero, resolveHome } from "../src/sequence.js";
import { MINUS_Y, PLUS_Y } from "../src/geometry.js";

const couple = partnerUp("beau", "belle");
const twirl = () => applyCallToCouple("california-twirl", couple);

describe("California Twirl", () => {
  it("swaps the two dancers and reverses the couple", () => {
    // The corrected ending. `moves.md` said "facing the same direction"; Ryan:
    // "California twirl does change direction facing" — turning a couple around is
    // what the call is for.
    const m = twirl();
    expect(m["beau"]?.entry.position.x).toBeCloseTo(-COUPLE_WIDTH / 2, 6);
    expect(m["beau"]?.exit.position.x).toBeCloseTo(COUPLE_WIDTH / 2, 6);
    expect(m["belle"]?.exit.position.x).toBeCloseTo(-COUPLE_WIDTH / 2, 6);
    for (const key of ["beau", "belle"] as const) {
      expect(m[key]?.entry.facing).toBeCloseTo(PLUS_Y, 6);
      expect(m[key]?.exit.facing).toBeCloseTo(MINUS_Y, 6);
    }
  });

  it("🔴 turns one dancer under and not the other — the whole difference", () => {
    // Both finish alike, so the arch shows up only in accumulated rotation. A full
    // turn cancels in the end facing, which is exactly why this is the place to look.
    const m = twirl();
    expect(m["beau"]?.momentum.rotation).toBeCloseTo(-180, 6);
    expect(m["belle"]?.momentum.rotation).toBeCloseTo(-540, 6);
    // ...and the extra is exactly one turn, not an accident of sampling.
    const extra = (m["belle"]?.momentum.rotation ?? 0) - (m["beau"]?.momentum.rotation ?? 0);
    expect(Math.abs(extra)).toBeCloseTo(360, 6);
  });

  it("keeps the hands joined the whole way", () => {
    // Unlike a Trade, which leaves both hands free. The grip is what makes the arch.
    const m = twirl();
    for (const key of ["beau", "belle"] as const) {
      expect(m[key]?.grips).toHaveLength(1);
      expect(m[key]?.grips[0]?.from).toBeCloseTo(0, 6);
      expect(m[key]?.grips[0]?.to).toBeCloseTo(californiaTwirl.chartBeats, 6);
    }
    expect(m["beau"]?.grips[0]?.hand).toBe("right");
    expect(m["belle"]?.grips[0]?.hand).toBe("left");
  });

  it("needs no lane — the two stay opposite across the joined hands", () => {
    // The property that makes it cheaper than a Trade. Sampled at every shared beat.
    const m = twirl();
    for (const a of m["beau"]?.waypoints ?? []) {
      const b = m["belle"]?.waypoints.find((w) => Math.abs(w.beat - a.beat) < 1e-9);
      if (b === undefined) continue;
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeCloseTo(COUPLE_WIDTH, 5);
    }
  });

  it("is position-dependent, and the two chains really differ", () => {
    expect(californiaTwirl.positionDependent).toBe(true);
    expect(californiaTwirl.chains?.beau).not.toEqual(californiaTwirl.chains?.belle);
  });
});

describe("California Twirl as a zero", () => {
  it("one twirl is a reversal, not a zero", () => {
    const r = isCoupleZero(["california-twirl"], couple);
    expect(r.home).toBe(false);
    expect(r.worstDistance).toBeCloseTo(COUPLE_WIDTH, 5);
  });

  it("🔴 two twirls bring the couple home — Ryan's second S1 zero, checked", () => {
    const r = isCoupleZero(["california-twirl", "california-twirl"], couple);
    expect(r.home).toBe(true);
    expect(r.worstDistance).toBeLessThan(0.01);
    expect(r.worstFacing).toBeLessThan(1);
  });

  it("takes 8 beats for the pair of them", () => {
    const seq = danceCoupleSequence(["california-twirl", "california-twirl"], couple);
    expect(seq.beats).toBeCloseTo(2 * californiaTwirl.chartBeats, 6);
  });
});

describe("the suspected equivalence with Partner Trade", () => {
  // Recorded in both specs as a question for the engine rather than a claim. ADR-0004's
  // starter scope already calls for an equivalence suite; this is its first member.

  it("🔴 lands the couple in exactly the same place", () => {
    const trade = danceCoupleSequence(["partner-trade"], couple);
    const twirled = danceCoupleSequence(["california-twirl"], couple);
    const r = resolveHome(trade.end, twirled.end);
    expect(r.home).toBe(true);
    expect(r.worstDistance).toBeLessThan(0.01);
  });

  it("but is a different figure, and the numbers say how", () => {
    // Equivalence is about where you end up. These two differ in three measurable
    // ways, which is why they are equivalent calls rather than the same call.
    const trade = applyCallToCouple("partner-trade", couple);
    const twirled = twirl();

    // 1. Hands: a Trade leaves both free, a Twirl keeps one joined throughout.
    expect(trade["beau"]?.grips).toHaveLength(0);
    expect(twirled["beau"]?.grips).toHaveLength(1);

    // 2. Rotation, and this is the sharpest of the three — it also corrected the
    //    comment that used to be here. A Trade's dancers walk forward in **opposite**
    //    senses: equal magnitude, opposite sign. A Twirl's rotate the **same** way as a
    //    pair, and differ in magnitude by the turn one of them takes under the arch.
    const tradeBeau = trade["beau"]?.momentum.rotation ?? NaN;
    const tradeBelle = trade["belle"]?.momentum.rotation ?? NaN;
    expect(tradeBeau).toBeCloseTo(-tradeBelle, 6);
    expect(Math.abs(tradeBeau)).toBeCloseTo(Math.abs(tradeBelle), 6);

    const twirlBeau = twirled["beau"]?.momentum.rotation ?? NaN;
    const twirlBelle = twirled["belle"]?.momentum.rotation ?? NaN;
    expect(Math.sign(twirlBeau)).toBe(Math.sign(twirlBelle));
    expect(Math.abs(twirlBelle)).toBeGreaterThan(Math.abs(twirlBeau));

    // 3. Timing: the Trade pays two beats for its lane.
    expect(partnerTrade.chartBeats).toBe(californiaTwirl.chartBeats + 2);
  });

  it("so either can follow the other and still come home", () => {
    // The practical form of an equivalence: a caller can substitute one for the other.
    expect(isCoupleZero(["partner-trade", "california-twirl"], couple).home).toBe(true);
    expect(isCoupleZero(["california-twirl", "partner-trade"], couple).home).toBe(true);
  });
});
