import { describe, expect, it } from "vitest";
import {
  HOME_FACING_TOLERANCE,
  HOME_POSITION_TOLERANCE,
  danceSequence,
  isZero,
  resolveHome,
} from "../src/sequence.js";
import { CALLS, PAIR_A, PAIR_B } from "../src/calls.js";
import { STEP_OUT_RADIUS } from "../src/blocks/arm-turn.js";
import { PLUS_Y } from "../src/geometry.js";

describe("are we home", () => {
  // Planning ADR-0011's S1. ADR-0004 named home resolution as a starter-set
  // capability and it was never built — before this suite the only occurrence of
  // "home" in the package was a comment inside Dosado's chain.

  it("is a property of the set, not of a dancer", () => {
    // The distinction that makes a zero mean anything. After Pass Thru each dancer
    // is standing exactly where *the other one* started, so "everybody is on a
    // starting position" is true and the set is emphatically not home. A per-dancer
    // check would pass this.
    const seq = danceSequence(["pass-thru"]);
    expect(seq.end.a?.position.y).toBeCloseTo(PAIR_B.position.y, 6);
    expect(seq.end.b?.position.y).toBeCloseTo(PAIR_A.position.y, 6);
    expect(resolveHome(seq.start, seq.end).home).toBe(false);
  });

  it("reports how far off, not just whether", () => {
    // "Not home" is a number a spec can be wrong by. Pass Thru exchanges places in a
    // frame where the pair start one unit apart, so the miss is exactly one.
    const r = isZero(["pass-thru"]);
    expect(r.worstDistance).toBeCloseTo(1, 6);
    expect(r.worstFacing).toBeCloseTo(0, 6);
    expect(r.offsets).toHaveLength(2);
  });

  it("treats a missing dancer as not home rather than skipping them", () => {
    const one = { a: PAIR_A };
    const two = { a: PAIR_A, b: PAIR_B };
    expect(resolveHome(two, one).home).toBe(false);
    expect(resolveHome(one, two).home).toBe(false);
  });

  it("is exact when nothing moved", () => {
    const set = { a: PAIR_A, b: PAIR_B };
    const r = resolveHome(set, set);
    expect(r.home).toBe(true);
    expect(r.worstDistance).toBe(0);
    expect(r.worstFacing).toBe(0);
  });

  it("measures facing on the short arc, so 359° off is one degree off", () => {
    const set = { a: PAIR_A };
    const nudged = { a: { position: PAIR_A.position, facing: PLUS_Y - 1 } };
    expect(resolveHome(set, nudged).worstFacing).toBeCloseTo(1, 6);
    expect(resolveHome(set, nudged).home).toBe(true);
  });

  it("refuses a dancer left facing a quarter turn wrong", () => {
    // The failure the facing tolerance exists to catch: right spot, wrong way round.
    const set = { a: PAIR_A };
    const turned = { a: { position: PAIR_A.position, facing: PLUS_Y + 90 } };
    const r = resolveHome(set, turned);
    expect(r.worstDistance).toBe(0);
    expect(r.worstFacing).toBeCloseTo(90, 6);
    expect(r.home).toBe(false);
  });

  it("has tolerances tight enough to be worth something", () => {
    // A guard on the guards. A position tolerance approaching the pair's own
    // separation, or a facing tolerance approaching a quarter turn, would make
    // `home` true of things that are not.
    expect(HOME_POSITION_TOLERANCE).toBeLessThan(0.1);
    expect(HOME_FACING_TOLERANCE).toBeLessThan(45);
  });
});

describe("Dosado is the starter set's zero", () => {
  // ADR-0004 calls Dosado "(geometric identity)" and the spec calls it a zero. Until
  // now that was prose. This is the claim, checked.

  it("returns the pair to exactly where they started", () => {
    const r = isZero(["dosado"]);
    expect(r.home).toBe(true);
    expect(r.worstDistance).toBeCloseTo(0, 6);
    expect(r.worstFacing).toBeCloseTo(0, 6);
  });

  it("stays a zero when danced twice — chaining preserves it", () => {
    // The property that makes a zero useful: it composes. A sequence built out of
    // zeros is a zero, which is the whole of the module system's arithmetic.
    expect(isZero(["dosado", "dosado"]).home).toBe(true);
    expect(isZero(["dosado", "dosado", "dosado"]).home).toBe(true);
  });

  it("does not drift as the chain grows", () => {
    // Rounding accumulates at every `embed`. If it accumulated *meaningfully* the
    // tolerance would be hiding a defect rather than absorbing noise, so assert the
    // miss stays far below it however long the chain.
    const long = Array.from({ length: 12 }, () => "dosado" as const);
    expect(isZero(long).worstDistance).toBeLessThan(HOME_POSITION_TOLERANCE / 10);
  });
});

describe("the get-out is not a zero, and misses by a specced amount", () => {
  it("Allemande Left leaves the pair off their spots by exactly the step-out", () => {
    // 🔴 The number worth pinning. `arm-turn`'s `step-out` exit finishes at
    // `STEP_OUT_RADIUS` where the dancer entered at the pair's own radius of 0.5, so
    // a full turn returns them to their starting *angle* and not their starting
    // *spot*. That difference is the whole of the miss — which makes this a check on
    // the spec rather than a restatement of the implementation.
    const entryRadius = Math.abs(PAIR_A.position.y);
    const r = isZero(["allemande-left"]);
    expect(r.home).toBe(false);
    expect(r.worstDistance).toBeCloseTo(entryRadius - STEP_OUT_RADIUS, 6);
  });

  it("and leaves them facing their departure, a quarter off", () => {
    expect(isZero(["allemande-left"]).worstFacing).toBeCloseTo(90, 6);
  });
});

describe("a danced sequence accounts for its beats", () => {
  it("sums the chart beats of its calls", () => {
    const seq = danceSequence(["dosado", "pass-thru"]);
    expect(seq.beats).toBeCloseTo(CALLS.dosado.chartBeats + CALLS["pass-thru"].chartBeats, 6);
  });

  it("lays the calls end to end with no gap and no overlap", () => {
    const seq = danceSequence(["dosado", "pass-thru", "dosado"]);
    let expected = 0;
    for (const step of seq.steps) {
      expect(step.startBeat).toBeCloseTo(expected, 6);
      expected += step.beats;
    }
    expect(seq.beats).toBeCloseTo(expected, 6);
  });

  it("hands every call the pose the previous one finished in", () => {
    // A sequence is the calls in order with nothing between them. If a step began
    // anywhere other than the last step's exit there would be a teleport, and the
    // waypoints would still look plausible in isolation.
    const seq = danceSequence(["dosado", "pass-thru", "dosado"]);
    for (let i = 1; i < seq.steps.length; i++) {
      for (const key of ["a", "b"] as const) {
        const prev = seq.steps[i - 1]?.motions[key];
        const next = seq.steps[i]?.motions[key];
        expect(next?.entry.position.x).toBeCloseTo(prev?.exit.position.x ?? NaN, 6);
        expect(next?.entry.position.y).toBeCloseTo(prev?.exit.position.y ?? NaN, 6);
        expect(next?.entry.facing).toBeCloseTo(prev?.exit.facing ?? NaN, 6);
      }
    }
  });

  it("an empty sequence is trivially home and takes no time", () => {
    const seq = danceSequence([]);
    expect(seq.beats).toBe(0);
    expect(seq.steps).toHaveLength(0);
    expect(resolveHome(seq.start, seq.end).home).toBe(true);
  });

  it("starts both dancers in the pair frame", () => {
    const seq = danceSequence(["dosado"]);
    expect(seq.start.a).toEqual(PAIR_A);
    expect(seq.start.b).toEqual(PAIR_B);
  });
});
