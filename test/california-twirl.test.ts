import { describe, expect, it } from "vitest";
import {
  TRADE_PASS_SEPARATION,
  applyCallToCouple,
  californiaTwirl,
  partnerTrade,
} from "../src/calls.js";
import { COUPLE_WIDTH, insideHands, partnerUp } from "../src/couple.js";
import { danceCoupleSequence, isCoupleZero, resolveHome } from "../src/sequence.js";
import { MINUS_Y, PLUS_Y } from "../src/geometry.js";

const couple = partnerUp("beau", "belle");
const twirl = () => applyCallToCouple("california-twirl", couple);
const trade = () => applyCallToCouple("partner-trade", couple);

describe("California Twirl", () => {
  it("swaps the two dancers and reverses the couple", () => {
    // The corrected ending. `moves.md` said "facing the same direction"; Ryan:
    // "California twirl does change direction facing" — turning a couple around is
    // what the call is for.
    const m = twirl();
    // 5 places for `round`'s 1e-6 quantisation over a non-representable third.
    expect(m["beau"]?.entry.position.x).toBeCloseTo(-COUPLE_WIDTH / 2, 5);
    expect(m["beau"]?.exit.position.x).toBeCloseTo(COUPLE_WIDTH / 2, 5);
    expect(m["belle"]?.exit.position.x).toBeCloseTo(-COUPLE_WIDTH / 2, 5);
    for (const key of ["beau", "belle"] as const) {
      expect(m[key]?.entry.facing).toBeCloseTo(PLUS_Y, 6);
      expect(m[key]?.exit.facing).toBeCloseTo(MINUS_Y, 6);
    }
  });

  it("🔴 turns the belle 180° CCW — not 540° CW", () => {
    // Ryan, 2026-08-18, watching it: *"the way it's running now the belle is doing 540
    // degree turn cw."* She was: the call was a rigid rotation of the pair about their
    // joined hands, and `turn-under`'s `spin: 1` gave her a whole extra turn beneath a
    // fixed arch on top of the pair's own −180°. ADR-0017 replaced the figure; she turns
    // once, to her left, like any belle exchanging places.
    //
    // Both signs are asserted, not just the magnitude. The defect was as much the
    // **direction** as the amount — a belle turning right winds her joined arm up rather
    // than unwinding it, and the number that made it visible was the one that came out
    // negative.
    const m = twirl();
    expect(m["belle"]?.momentum.rotation).toBeCloseTo(180, 6);
    expect(m["beau"]?.momentum.rotation).toBeCloseTo(-180, 6);
  });

  it("🔴 has both dancers turning half a turn, in opposite senses", () => {
    // The pair characterisation that replaces "same sense, different magnitude". Two
    // dancers exchanging places by walking forward turn opposite ways, and nobody takes
    // an extra turn — the arch is a **hold**, not a spin (ADR-0017).
    const m = twirl();
    const beau = m["beau"]?.momentum.rotation ?? NaN;
    const belle = m["belle"]?.momentum.rotation ?? NaN;
    expect(beau).toBeCloseTo(-belle, 6);
    expect(Math.abs(beau)).toBeCloseTo(180, 6);
  });

  it("keeps the inside hands joined the whole way, and raised into an arch", () => {
    // Unlike a Trade, which leaves both hands free. The grip is what makes the arch —
    // and after ADR-0017 it is the *only* thing that makes this call a Twirl.
    const m = twirl();
    for (const key of ["beau", "belle"] as const) {
      expect(m[key]?.grips).toHaveLength(1);
      expect(m[key]?.grips[0]?.from).toBeCloseTo(0, 6);
      expect(m[key]?.grips[0]?.to).toBeCloseTo(californiaTwirl.chartBeats, 6);
      // `arch`, not `forearm`: palms joined and raised clear of the head, high enough to
      // walk beneath. A renderer that drew the arm-turn grip here would draw an Allemande.
      expect(m[key]?.grips[0]?.grip).toBe("arch");
    }
    // The hands are the formation's own inside pair, taken from `insideHands` rather than
    // restated — a second copy is a thing that can disagree with the couple it describes.
    const inside = insideHands(couple);
    expect(m["beau"]?.grips[0]?.hand).toBe(inside.beauHand);
    expect(m["belle"]?.grips[0]?.hand).toBe(inside.belleHand);
  });

  it("🔴 keeps the belle off the front — her step across is the duck under", () => {
    // Ryan: *"raise arm and have belle duck under the two held hands."* She does not walk
    // round the arch and she does not spin beneath a fixed one: she steps the couple's
    // whole width along their own axis, and the joined hands are over the middle of it.
    const m = twirl();
    for (const w of m["belle"]?.waypoints ?? []) expect(w.y).toBeCloseTo(0, 9);
    const xs = (m["belle"]?.waypoints ?? []).map((w) => w.x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(COUPLE_WIDTH, 5);
  });

  it("🔴 clears the bodies by the couple's own radius, as a Trade does", () => {
    // This replaced "needs no lane — the two stay opposite across the joined hands",
    // which was true of the rigid rotation and is false of this figure: the pair are a
    // whole width apart at the ends and half of it in the middle, because he walks the
    // arc and she crosses its diameter. **That is not a regression, it is the clearance
    // arriving** — the old constant separation was a couple who never passed each other
    // at all, which is what made the arch have to be a spin.
    const m = twirl();
    for (const a of m["beau"]?.waypoints ?? []) {
      const b = m["belle"]?.waypoints.find((w) => Math.abs(w.beat - a.beat) < 1e-9);
      if (b === undefined) continue;
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(TRADE_PASS_SEPARATION - 1e-5);
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

describe("🔴 the equivalence with Partner Trade turned out to be an identity of paths", () => {
  // Recorded in both specs from 2026-08-15 as a question for the engine, then confirmed as
  // an equivalence: two different figures landing in the same place. ADR-0017 says the
  // stronger thing, and it came from Ryan looking at the two renders rather than from the
  // engine — *"california twirl beau might be same path … belle's path might be the same as
  // partner trade too."* They are. What is left is one measurable difference, and these
  // tests are the pair: the paths agree exactly, the hands do not.

  it("walks the identical path, waypoint for waypoint, on both sides", () => {
    // The claim in its strongest available form. Not "ends in the same place" — every
    // sampled instant, position and facing, for both dancers. An equivalence test compares
    // end states and would pass on two quite different figures; this one cannot.
    const t = trade();
    const c = twirl();
    for (const key of ["beau", "belle"] as const) {
      const a = t[key]?.waypoints ?? [];
      const b = c[key]?.waypoints ?? [];
      expect(b).toHaveLength(a.length);
      expect(a.length).toBeGreaterThan(1);
      a.forEach((w, i) => {
        expect(b[i]?.beat).toBeCloseTo(w.beat, 9);
        expect(b[i]?.x).toBeCloseTo(w.x, 9);
        expect(b[i]?.y).toBeCloseTo(w.y, 9);
        expect(b[i]?.facing).toBeCloseTo(w.facing, 9);
      });
      expect(c[key]?.momentum.rotation).toBeCloseTo(t[key]?.momentum.rotation ?? NaN, 9);
    }
    expect(partnerTrade.chartBeats).toBe(californiaTwirl.chartBeats);
  });

  it("🔴 and differs in exactly one thing — the hands", () => {
    // What is left of "they are different calls", and it is enough: F2 asks whether the
    // hand a following call needs is available, and these two answer differently. A Trade
    // finishes with both free, which is what lets it flow into anything; a Twirl finishes
    // holding the inside hand.
    const t = trade();
    const c = twirl();
    for (const key of ["beau", "belle"] as const) {
      expect(t[key]?.grips).toHaveLength(0);
      expect(t[key]?.momentum.lastHand).toBe("none");
      expect(c[key]?.grips).toHaveLength(1);
      expect(c[key]?.momentum.lastHand).toBe(c[key]?.grips[0]?.hand);
    }
  });

  it("lands the couple in exactly the same place", () => {
    const t = danceCoupleSequence(["partner-trade"], couple);
    const c = danceCoupleSequence(["california-twirl"], couple);
    const r = resolveHome(t.end, c.end);
    expect(r.home).toBe(true);
    expect(r.worstDistance).toBeLessThan(0.01);
  });

  it("so either can follow the other and still come home", () => {
    // The practical form of an equivalence: a caller can substitute one for the other.
    expect(isCoupleZero(["partner-trade", "california-twirl"], couple).home).toBe(true);
    expect(isCoupleZero(["california-twirl", "partner-trade"], couple).home).toBe(true);
  });
});
