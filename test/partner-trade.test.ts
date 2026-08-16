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

/** The pass: the middle of the call, which is also the top of the bow. */
function midpoint(m: ReturnType<typeof trade>, key: string) {
  const beat = partnerTrade.chartBeats / 2;
  return m[key]?.waypoints.find((w) => Math.abs(w.beat - beat) < 1e-9);
}

describe("Partner Trade", () => {
  it("starts and ends on the couple's own standing spots", () => {
    // A single *constant-radius* arc cannot do this and separate the dancers, which is
    // why the first build reached for slides. A bowed one can, and does (ADR-0013).
    const m = trade();
    // 5 places for `round`'s 1e-6 quantisation over a non-representable third.
    expect(m["beau"]?.entry.position.x).toBeCloseTo(-COUPLE_WIDTH / 2, 5);
    expect(m["beau"]?.exit.position.x).toBeCloseTo(COUPLE_WIDTH / 2, 5);
    expect(m["belle"]?.entry.position.x).toBeCloseTo(COUPLE_WIDTH / 2, 5);
    expect(m["belle"]?.exit.position.x).toBeCloseTo(-COUPLE_WIDTH / 2, 5);
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
    // Beat 2 is the middle of the 4, which is both where they meet and where the bow
    // peaks — the two coincide by construction (ADR-0013).
    const m = trade();
    const beau = midpoint(m, "beau");
    const belle = midpoint(m, "belle");
    expect(Math.hypot(beau?.x ?? 0, beau?.y ?? 0)).toBeCloseTo(TRADE_RADIUS_OUT, 5);
    expect(Math.hypot(belle?.x ?? 0, belle?.y ?? 0)).toBeCloseTo(TRADE_RADIUS_IN, 5);
  });

  it("🔴 never travels sideways — every step has a forward component", () => {
    // The invariant the render watch was really asking for, and the one the slide
    // decomposition broke: `slide` moved a dancer at exactly 90° to their facing, so
    // at each call boundary the couple translated laterally for two beats without
    // turning or advancing. On screen that is a standing couple swaying.
    //
    // Stated as a sign rather than a threshold: the dot product of each step with the
    // facing at both ends of it must be positive. An arc's chord sits half the sampled
    // arc off the tangent and stays comfortably inside that; pure lateral motion is
    // exactly zero, so the defect could not squeak past.
    const m = trade();
    for (const key of ["beau", "belle"] as const) {
      const wps = m[key]?.waypoints ?? [];
      expect(wps.length).toBeGreaterThan(1);
      for (let i = 0; i + 1 < wps.length; i += 1) {
        const from = wps[i];
        const to = wps[i + 1];
        if (from === undefined || to === undefined) continue;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        expect(Math.hypot(dx, dy)).toBeGreaterThan(1e-9);
        for (const facing of [from.facing, to.facing]) {
          const a = (facing * Math.PI) / 180;
          expect(dx * Math.cos(a) + dy * Math.sin(a)).toBeGreaterThan(0);
        }
      }
    }
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

describe("the Trade lane follows the couple's width", () => {
  it("🔴 stays a proportion of it, not an absolute", () => {
    // It was `LANE_OFFSET` flat, which was invisible while a couple was a full unit
    // wide and degenerate the moment it stopped being: at a third-unit couple the
    // inside dancer's radius came out at 0.017 — a dancer spinning on the spot.
    // `LANE_OFFSET` is calibrated against a *facing pair's* one-unit separation.
    expect(TRADE_LANE).toBeLessThan(COUPLE_WIDTH / 2);
    expect(TRADE_RADIUS_IN).toBeGreaterThan(COUPLE_WIDTH / 4);
    expect(TRADE_RADIUS_OUT).toBeGreaterThan(TRADE_RADIUS_IN);
  });

  it("keeps the two arcs a whole lane apart however wide the couple", () => {
    expect(TRADE_RADIUS_OUT - TRADE_RADIUS_IN).toBeCloseTo(2 * TRADE_LANE, 9);
  });

  it("still separates the dancers at the crossing", () => {
    // The property the lane exists for, re-checked at the new width — the collision
    // this call would otherwise have.
    const m = applyCallToCouple("partner-trade", couple);
    const a = midpoint(m, "beau");
    const b = midpoint(m, "belle");
    expect(Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0)))
      .toBeCloseTo(2 * TRADE_LANE, 5);
  });

  it("🔴 spends the lane only where it is needed, and nothing on getting there", () => {
    // What ADR-0013 actually changed. The lane used to be the arc's radius for the
    // whole half circle, reached and left by a sidestep; it is now a bow that is zero
    // at both ends and widest at the pass. The distinguishing measurement is the
    // *ends*: a dancer who is on their standing radius at beat 0 and beat 4 paid no
    // beats to get onto a lane, because they were never on one.
    const m = applyCallToCouple("partner-trade", couple);
    for (const key of ["beau", "belle"] as const) {
      const wps = m[key]?.waypoints ?? [];
      const first = wps[0];
      const last = wps[wps.length - 1];
      expect(Math.hypot(first?.x ?? 0, first?.y ?? 0)).toBeCloseTo(COUPLE_WIDTH / 2, 5);
      expect(Math.hypot(last?.x ?? 0, last?.y ?? 0)).toBeCloseTo(COUPLE_WIDTH / 2, 5);
    }
  });
});
