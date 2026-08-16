import { describe, expect, it } from "vitest";
import {
  TRADE_LANE,
  TRADE_RADIUS_IN,
  TRADE_RADIUS_OUT,
  applyCallToCouple,
  partnerTrade,
} from "../src/calls.js";
import { COUPLE_WIDTH, coupleSet, partnerUp, positionOf } from "../src/couple.js";
import { danceCoupleSequence, isCoupleZero, reformCouple, resolveHome } from "../src/sequence.js";
import { MINUS_Y, PLUS_Y } from "../src/geometry.js";

const couple = partnerUp("beau", "belle");

function trade() {
  return applyCallToCouple("partner-trade", couple);
}

describe("Partner Trade", () => {
  it("starts and ends on the couple's own standing spots", () => {
    // The reason the slides are there at all. A single constant-radius arc cannot do
    // this and separate the dancers — see the spec's correction.
    const m = trade();
    expect(m["beau"]?.entry.position.x).toBeCloseTo(-COUPLE_WIDTH / 2, 6);
    expect(m["beau"]?.exit.position.x).toBeCloseTo(COUPLE_WIDTH / 2, 6);
    expect(m["belle"]?.entry.position.x).toBeCloseTo(COUPLE_WIDTH / 2, 6);
    expect(m["belle"]?.exit.position.x).toBeCloseTo(-COUPLE_WIDTH / 2, 6);
  });

  it("leaves both dancers facing the way the couple was not", () => {
    const m = trade();
    for (const key of ["beau", "belle"] as const) {
      expect(m[key]?.entry.facing).toBeCloseTo(PLUS_Y, 6);
      expect(m[key]?.exit.facing).toBeCloseTo(MINUS_Y, 6);
    }
  });

  it("🔴 never puts the two dancers on the same spot", () => {
    // The engine models dancers as points, so its collision-freedom invariant is "no
    // shared coordinate". Both arcs pass through the front of the couple, and the
    // right-shoulder lane is the only thing keeping them apart — which is exactly why
    // this call is position-dependent. Sampled at every beat both dancers emit.
    const m = trade();
    const beau = m["beau"];
    const belle = m["belle"];
    expect(beau).toBeDefined();
    expect(belle).toBeDefined();
    for (const a of beau?.waypoints ?? []) {
      const b = belle?.waypoints.find((w) => Math.abs(w.beat - a.beat) < 1e-9);
      if (b === undefined) continue;
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(2 * TRADE_LANE - 1e-9);
    }
  });

  it("passes right shoulders — the belle inside, the beau outside", () => {
    // The asymmetry that makes it position-dependent, asserted rather than described.
    const m = trade();
    const mid = (key: string) => m[key]?.waypoints.find((w) => Math.abs(w.beat - 3) < 1e-9);
    const beau = mid("beau");
    const belle = mid("belle");
    expect(Math.hypot(beau?.x ?? 0, beau?.y ?? 0)).toBeCloseTo(TRADE_RADIUS_OUT, 5);
    expect(Math.hypot(belle?.x ?? 0, belle?.y ?? 0)).toBeCloseTo(TRADE_RADIUS_IN, 5);
  });

  it("is declared position-dependent, and really is", () => {
    // ADR-0012's field, doing work for the first time. The two chains must differ, or
    // the flag is decoration.
    expect(partnerTrade.positionDependent).toBe(true);
    expect(partnerTrade.chains).toBeDefined();
    expect(partnerTrade.chains?.beau).not.toEqual(partnerTrade.chains?.belle);
  });

  it("gives both sides the same shape, one figure danced two ways round", () => {
    const beau = partnerTrade.chains?.beau ?? [];
    const belle = partnerTrade.chains?.belle ?? [];
    expect(beau.map((c) => c.block)).toEqual(belle.map((c) => c.block));
  });

  it("sums to its chart beats", () => {
    const m = trade();
    expect(m["beau"]?.beats).toBeCloseTo(partnerTrade.chartBeats, 6);
    expect(m["belle"]?.beats).toBeCloseTo(partnerTrade.chartBeats, 6);
  });

  it("leaves both hands free throughout", () => {
    // No grip anywhere in the chain — the F2 fact that lets a Trade flow into anything.
    const m = trade();
    for (const key of ["beau", "belle"] as const) expect(m[key]?.grips).toEqual([]);
  });
});

describe("Partner Trade as a zero", () => {
  it("one trade is not home — it is a reversal", () => {
    const r = isCoupleZero(["partner-trade"], couple);
    expect(r.home).toBe(false);
    expect(r.worstDistance).toBeCloseTo(COUPLE_WIDTH, 5);
    expect(r.worstFacing).toBeCloseTo(180, 5);
  });

  it("🔴 two trades bring the couple home — Ryan's first S1 zero, checked", () => {
    const r = isCoupleZero(["partner-trade", "partner-trade"], couple);
    expect(r.home).toBe(true);
    expect(r.worstDistance).toBeLessThan(0.01);
    expect(r.worstFacing).toBeLessThan(1);
  });

  it("and four trades are still home, so it composes", () => {
    expect(isCoupleZero(Array(4).fill("partner-trade"), couple).home).toBe(true);
  });

  it("lays two trades end to end with no gap", () => {
    const seq = danceCoupleSequence(["partner-trade", "partner-trade"], couple);
    expect(seq.beats).toBeCloseTo(2 * partnerTrade.chartBeats, 6);
    expect(seq.steps[1]?.startBeat).toBeCloseTo(partnerTrade.chartBeats, 6);
  });
});

describe("reforming the couple between calls", () => {
  it("puts the rebuilt couple exactly where the dancers actually finished", () => {
    // The guard on `reformCouple`'s assumption. It trusts that the call ended as a
    // couple rather than recognising the formation — that is S2's job — so this is
    // what would catch a call that ended in something else.
    const m = trade();
    const next = reformCouple(couple, m);
    for (const [position, key] of [["beau", "beau"], ["belle", "belle"]] as const) {
      const p = positionOf(next, position);
      expect(p.position.x).toBeCloseTo(m[key]?.exit.position.x ?? NaN, 5);
      expect(p.position.y).toBeCloseTo(m[key]?.exit.position.y ?? NaN, 5);
      expect(p.facing).toBeCloseTo(m[key]?.exit.facing ?? NaN, 5);
    }
  });

  it("keeps the beau the beau — the couple turned around, it did not reshuffle", () => {
    const next = reformCouple(couple, trade());
    expect(next.beau).toBe("beau");
    expect(next.belle).toBe("belle");
    expect(resolveHome(coupleSet(couple), coupleSet(next)).home).toBe(false);
  });
});
