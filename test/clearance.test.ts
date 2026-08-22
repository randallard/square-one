/**
 * The bow — a couple's exchange sized to the room its bodies need at the pass.
 *
 * The engine models dancers as points, so its own collision invariant is "no shared
 * coordinate" and two points a hair apart satisfy it. A consumer with bodies knows better, and
 * `Couple.clearance` has carried that number since 2026-08-16 with **nothing reading it**. This
 * is the suite for the thing that finally does (ADR-0018).
 */

import { describe, expect, it } from "vitest";
import { TRADE_PASS_SEPARATION, applyCallToCouple, californiaTwirl } from "../src/calls.js";
import { partnerUp } from "../src/couple.js";
import { COUPLE_WIDTH } from "../src/shape.js";
import {
  danceCoupleSequence,
  isCoupleZero,
  reformCouple,
  resolveHome,
} from "../src/sequence.js";
import { sampleMotion } from "../src/stepper.js";
import type { Motion, Waypoint } from "../src/types.js";

const W = COUPLE_WIDTH;

/** How close the two dancers get, over the whole call. */
function closest(m: Record<string, { waypoints: readonly Waypoint[] }>): number {
  let worst = Infinity;
  for (const a of m["beau"]?.waypoints ?? []) {
    const b = m["belle"]?.waypoints.find((w) => Math.abs(w.beat - a.beat) < 1e-9);
    if (b === undefined) continue;
    worst = Math.min(worst, Math.hypot(a.x - b.x, a.y - b.y));
  }
  return worst;
}

/** How far the beau is from the couple's centre at a given beat. */
function beauRadius(
  m: Record<string, { waypoints: readonly Waypoint[] }>,
  beat: number,
): number {
  const w = m["beau"]?.waypoints.find((p) => Math.abs(p.beat - beat) < 1e-9);
  return Math.hypot(w?.x ?? 0, w?.y ?? 0);
}

describe("a couple who ask for nothing dance exactly what they danced before", () => {
  it("🔴 puts no lane in either call at the default clearance", () => {
    // The whole compatibility claim, and the reason every spec fixture is untouched: the
    // default clearance *is* the arc's own radius, so the bow is zero and the chains are
    // identical to the ones ADR-0014 and ADR-0017 landed.
    const plain = partnerUp("beau", "belle");
    for (const call of ["partner-trade", "california-twirl"] as const) {
      const m = applyCallToCouple(call, plain);
      expect(closest(m)).toBeCloseTo(TRADE_PASS_SEPARATION, 5);
    }
  });
});

describe("the room is delivered to the dancers, not just to the waypoints", () => {
  // 🔴 ADR-0022's guard, and the one instrument here that measures what a **consumer** gets.
  // Every other check in this file pairs the two dancers up at their shared waypoint beats;
  // `sampleMotion` is what the stepper actually runs, and between two marks it walks a
  // straight line. While `orbit` sampled every 45° those two answers differed by 5.6% — the
  // solver hit 0.710 on the curve and the dancers got 0.670 — and nothing in this file could
  // see it, because the sag lives *between* the marks that both checks were built from.
  const HEADS = (0.71 / 1.14) * W;
  const ARCH = (1.084 / 1.14) * W;

  /** The closest the two get along the path the **stepper** walks, sampled far finer than it. */
  function closestWalked(motions: Record<string, Motion>): number {
    const beau = motions["beau"];
    const belle = motions["belle"];
    if (beau === undefined || belle === undefined) return NaN;
    let worst = Infinity;
    for (let i = 0; i <= 4000; i++) {
      const beat = (beau.beats * i) / 4000;
      const a = sampleMotion(beau, beat).position;
      const b = sampleMotion(belle, beat).position;
      worst = Math.min(worst, Math.hypot(a.x - b.x, a.y - b.y));
    }
    return worst;
  }

  it("🔴 walks a Partner Trade at the clearance it was solved for", () => {
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    const walked = closestWalked(applyCallToCouple("partner-trade", couple));
    // Not `toBeGreaterThan(HEADS)`: a polyline through an arc is inside it by *something*, and
    // a check that pretended otherwise would be a check tuned to today's sampling. What is
    // asserted is that the something is negligible — at 7.5° the chord sags 3.4e-4 of the
    // radius, and this bounds the whole figure's shortfall at a fifth of a percent.
    expect(walked).toBeGreaterThan(HEADS * 0.998);
    // And that it is not merely close by accident: the 45° sampling this replaced was 5.6% low,
    // which is more than twenty times the bound above.
    expect(walked).toBeGreaterThan(HEADS * 0.95);
  });

  it("🔴 walks a California Twirl at its own, larger one", () => {
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    const walked = closestWalked(applyCallToCouple("california-twirl", couple));
    expect(walked).toBeGreaterThan(ARCH * 0.998);
  });

  it("🔴 leaves a couple who ask for nothing on their own radius", () => {
    // The compatibility claim, measured the same way. A body-agnostic couple gets no bow, so
    // what the dancers walk is the plain arc — and the sag is what separates the two answers.
    const walked = closestWalked(applyCallToCouple("partner-trade", partnerUp("beau", "belle")));
    expect(walked).toBeGreaterThan(TRADE_PASS_SEPARATION * 0.998);
    expect(walked).toBeLessThan(TRADE_PASS_SEPARATION * 1.0001);
  });
});

describe("the beau's arc bows out to the clearance the bodies need", () => {
  // townage's numbers, in engine units at COUPLE_WIDTH: bodies want 0.520/1.140 of the width,
  // heads 0.710/1.140, and heads with a joined hand between them 1.084/1.140.
  const HEADS = (0.71 / 1.14) * W;
  const ARCH = (1.084 / 1.14) * W;

  it("🔴 gives a Partner Trade the room its heads need, which the radius did not", () => {
    // The 🔴 ADR-0014 pinned and could not fix from inside the figure: half the couple's width
    // is 0.5 of it, and the heads want 0.62 of it on the shipped cast. The arc leaves the
    // circle the couple stands on — the "even farther out" Ryan pushed back on for a
    // hands-free Trade, and accepted for an arch.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS);
    const m = applyCallToCouple("partner-trade", couple);
    expect(closest(m)).toBeGreaterThan(HEADS - 1e-5);
    // And the radius alone would not have.
    expect(TRADE_PASS_SEPARATION).toBeLessThan(HEADS);
  });

  it("🔴 gives a California Twirl more room than a Trade, out of the same bodies", () => {
    // The finding this ADR is for. With hands free the two dancers have to clear each other;
    // with hands joined and raised there is a **hand in the gap as well**, at head height,
    // belonging to neither of them. Same pair, same figure, strictly more room.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    const trade = closest(applyCallToCouple("partner-trade", couple));
    const twirl = closest(applyCallToCouple("california-twirl", couple));
    expect(twirl).toBeGreaterThan(trade);
    expect(twirl).toBeGreaterThan(ARCH - 1e-5);
    expect(trade).toBeCloseTo(HEADS, 5);
  });

  it("🔴 leaves the belle's path alone — she still crosses the diameter", () => {
    // The bow is the *beau's*. Ryan chose it over holding the couple's width precisely so she
    // keeps going nowhere forward and keeps passing through the middle, which is what makes
    // the figure a duck-under rather than a pair rotating.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    for (const call of ["partner-trade", "california-twirl"] as const) {
      const m = applyCallToCouple(call, couple);
      for (const w of m["belle"]?.waypoints ?? []) expect(w.y).toBeCloseTo(0, 9);
    }
  });

  it("spends the bow in the middle, and nothing on getting there", () => {
    // ADR-0013's property, still true and now load-bearing for a much bigger bow: the arc is
    // on the couple's own radius at both ends, so the call still costs 4 beats and a dancer
    // still starts and finishes on their standing spot.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    const m = applyCallToCouple("california-twirl", couple);
    expect(beauRadius(m, 0)).toBeCloseTo(W / 2, 5);
    expect(beauRadius(m, 4)).toBeCloseTo(W / 2, 5);
    expect(beauRadius(m, 2)).toBeGreaterThan(ARCH - 1e-5);
  });

  it("still comes home, both calls, and either after the other", () => {
    // The bow is zero at both ends, so nothing it does can survive the call.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    expect(isCoupleZero(["partner-trade", "partner-trade"], couple).home).toBe(true);
    expect(isCoupleZero(["california-twirl", "california-twirl"], couple).home).toBe(true);
    expect(isCoupleZero(["partner-trade", "california-twirl"], couple).home).toBe(true);
  });

  it("🔴 solves the bow rather than computing it, because the pass is not the closest moment", () => {
    // The subtlety that cost a first, wrong implementation. `wanted − radius` is exactly right
    // for the separation **at the pass** — he is at the top of the arc, she is at its centre.
    // But the bow is `sin²` and she crosses at a constant rate, so once the bow is large the
    // two of them are nearest each other on the *way* to the pass rather than at it.
    //
    // Measured here: the naive bow leaves the closest approach about 3% under what was asked
    // for, and 3% is a hand inside a head. Asserted as a comparison so it cannot regress
    // quietly to arithmetic.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    const m = applyCallToCouple("california-twirl", couple);
    expect(closest(m)).toBeGreaterThan(ARCH - 1e-5);
    // The closest moment is genuinely *not* the pass, at this bow.
    const passSeparation = beauRadius(m, californiaTwirl.chartBeats / 2);
    expect(passSeparation).toBeGreaterThan(closest(m) + 1e-4);
  });

  it("🔴 stops the two calls being the same paths, and that is the point", () => {
    // ADR-0017 found the Twirl was a Trade holding on, waypoint for waypoint. It still is the
    // same *figure* — same blocks, same belle, same beats — but the arch needs more room, so
    // the beau's arc is wider. "Identical paths" becomes "same figure, sized to what it
    // carries", and the test that asserted the identity is scoped to a couple who ask for
    // nothing.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    const trade = applyCallToCouple("partner-trade", couple);
    const twirl = applyCallToCouple("california-twirl", couple);
    expect(beauRadius(twirl, 2)).toBeGreaterThan(beauRadius(trade, 2));
    // The belle's half is untouched by any of it.
    expect(twirl["belle"]?.waypoints).toEqual(trade["belle"]?.waypoints);
  });
});

describe("🔴 the bow survives a call boundary", () => {
  // The bug the second California Twirl showed on screen: `reformCouple` rebuilt the couple
  // from the two exits and asked `partnerUp` for nothing else, so the clearances came back at
  // their body-agnostic defaults. The first call of a sequence bowed and every later one did
  // not — same figure, visibly different path, on a pair whose bodies had not changed.
  const HEADS = (0.71 / 1.14) * W;
  const ARCH = (1.084 / 1.14) * W;
  const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);

  it("gives every call of a sequence the same room, not just the first", () => {
    for (const call of ["partner-trade", "california-twirl"] as const) {
      const want = call === "california-twirl" ? ARCH : HEADS;
      const seq = danceCoupleSequence([call, call], couple);
      const room = seq.steps.map((step) => closest(step.motions));
      expect(room).toHaveLength(2);
      for (const r of room) expect(r).toBeGreaterThan(want - 1e-5);
      // And the two are the *same* figure, not merely both adequate.
      expect(room[1]).toBeCloseTo(room[0] as number, 6);
    }
  });

  it("carries the clearances rather than measuring them, because bodies do not change", () => {
    // Width is measured from the exits on purpose (ADR-0015); clearance is not measurable from
    // two poses at all. The rebuilt couple keeps both numbers it was handed.
    const m = applyCallToCouple("california-twirl", couple);
    const after = reformCouple(couple, m);
    expect(after.clearance).toBe(couple.clearance);
    expect(after.archClearance).toBe(couple.archClearance);
  });

  it("still lets a mixed sequence size each call to what it carries", () => {
    // A Trade then a Twirl by the same pair: the arch needs the wider bow, and the boundary
    // must not flatten either one to the other.
    const seq = danceCoupleSequence(["partner-trade", "california-twirl"], couple);
    const [trade, twirl] = seq.steps.map((step) => closest(step.motions));
    expect(trade).toBeCloseTo(HEADS, 5);
    expect(twirl).toBeGreaterThan(ARCH - 1e-5);
    expect(twirl).toBeGreaterThan(trade as number);
  });
});

describe("🔴 a clearance the couple's own width cannot deliver", () => {
  // At both ends of the call the two dancers are on their standing spots, so the separation
  // there is exactly the couple's width whatever the bow does in between. The minimum only
  // *approaches* that width, so a clearance near it costs an unbounded bow — and townage's arch
  // clearance came out at **1.003 of the width** on the shipped cast, which is not a
  // hypothetical. The bow is capped at the couple's own width.

  it("gives the widest bow the figure has, and stops", () => {
    for (const want of [W * 0.999, W * 1.05, W * 4]) {
      const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, W / 2, want);
      const m = applyCallToCouple("california-twirl", couple);
      // The cap: a bow of one whole width, so the arc peaks at 1.5 of it.
      expect(beauRadius(m, californiaTwirl.chartBeats / 2)).toBeCloseTo(W * 1.5, 5);
    }
  });

  it("is still a figure — same spots, same beats, still a zero", () => {
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, W / 2, W * 4);
    const m = applyCallToCouple("california-twirl", couple);
    expect(beauRadius(m, 0)).toBeCloseTo(W / 2, 5);
    expect(beauRadius(m, californiaTwirl.chartBeats)).toBeCloseTo(W / 2, 5);
    expect(m["beau"]?.beats).toBe(californiaTwirl.chartBeats);
    expect(isCoupleZero(["california-twirl", "california-twirl"], couple).home).toBe(true);
  });
});

describe("a clearance smaller than the arc's own radius asks for nothing", () => {
  it("never bows inward", () => {
    // A pair whose bodies need less room than the figure already gives them get the figure.
    // The bow is only ever outward, so a small clearance is not a licence to narrow.
    const tight = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, W / 10);
    expect(closest(applyCallToCouple("partner-trade", tight))).toBeCloseTo(W / 2, 5);
  });

  it("defaults `archClearance` to `clearance`, so an unaware consumer sees no change", () => {
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, W * 0.62);
    expect(couple.archClearance).toBeCloseTo(couple.clearance, 9);
    const trade = closest(applyCallToCouple("partner-trade", couple));
    const twirl = closest(applyCallToCouple("california-twirl", couple));
    expect(twirl).toBeCloseTo(trade, 6);
  });

  it("refuses a non-positive clearance of either kind", () => {
    expect(() => partnerUp("a", "b", { x: 0, y: 0 }, 90, W, 0)).toThrow(/clearance/);
    expect(() => partnerUp("a", "b", { x: 0, y: 0 }, 90, W, W / 2, 0)).toThrow(/archClearance/);
  });
});

describe("the chart is unmoved by any of it", () => {
  it("keeps both calls at 4 beats however far the beau bows", () => {
    // ADR-0013's rule, tested at a bow three times the one it was written for: the lane rides
    // *inside* the arc, so a wider pass costs speed and not beats.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, W, W * 3);
    const m = applyCallToCouple("california-twirl", couple);
    expect(m["beau"]?.beats).toBe(californiaTwirl.chartBeats);
    expect(m["belle"]?.beats).toBe(californiaTwirl.chartBeats);
  });
});

describe("a sequence can size each call to what that call drew (ADR-0025)", () => {
  const HEADS = (0.71 / 1.14) * W;
  const ARCH = (1.084 / 1.14) * W;

  it("🔴 gives two executions of one call two different figures", () => {
    // The property the whole override exists for. townage draws an accommodation per execution —
    // the pair reshape, or they reach and let go — and the two want **different room**. Before
    // this the engine could only be told one number for a whole sequence, so the figure was
    // sized to the worse of the two and the beau bowed for a break he had not drawn.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    const seq = danceCoupleSequence(["california-twirl", "california-twirl"], couple, (i) =>
      i === 0 ? { archClearance: HEADS } : undefined,
    );
    const bow = (step: number): number =>
      Math.max(
        ...(seq.steps[step]?.motions["beau"]?.waypoints ?? []).map((w) => Math.hypot(w.x, w.y)),
      );
    expect(bow(0)).toBeLessThan(bow(1));
  });

  it("🔴 does not let the override outlive the call it was for", () => {
    // An accommodation is a fact about **one execution**. If it leaked into the couple that comes
    // out, a pair who reshaped once would dance every later call as if they had — which is the
    // shape of the bug ADR-0019 fixed for clearance, one field over again.
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    const plain = danceCoupleSequence(["california-twirl", "california-twirl"], couple);
    const overridden = danceCoupleSequence(
      ["california-twirl", "california-twirl"],
      couple,
      (i) => (i === 0 ? { archClearance: HEADS } : undefined),
    );
    const second = (seq: typeof plain): readonly Waypoint[] =>
      seq.steps[1]?.motions["beau"]?.waypoints ?? [];
    expect(second(overridden)).toEqual(second(plain));
  });

  it("🔴 still comes home, whatever each call was sized to", () => {
    const couple = partnerUp("beau", "belle", { x: 0, y: 0 }, 90, W, HEADS, ARCH);
    const seq = danceCoupleSequence(["california-twirl", "california-twirl"], couple, (i) =>
      i === 0 ? { archClearance: HEADS } : undefined,
    );
    const home = resolveHome(seq.start, seq.end);
    expect(home.home, `off by ${String(home.worstDistance)}`).toBe(true);
  });
});
