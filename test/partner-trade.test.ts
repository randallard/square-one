import { describe, expect, it } from "vitest";
import {
  TRADE_PASS_SEPARATION,
  applyCallToCouple,
  partnerTrade,
} from "../src/calls.js";
import { coupleSet, partnerUp, positionOf } from "../src/couple.js";
import { COUPLE_WIDTH } from "../src/shape.js";
import { danceCoupleSequence, isCoupleZero, reformCouple, resolveHome } from "../src/sequence.js";
import { MINUS_Y, PLUS_Y, deltaDeg } from "../src/geometry.js";
import type { Waypoint } from "../src/types.js";

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
    // shared coordinate". Sampled at every beat both dancers emit.
    //
    // 🔴 The floor is a **whole radius** now, not a lane. It was `2 × TRADE_LANE` — 0.3 of
    // the couple's width — because both dancers walked the same circle in opposite senses
    // and a bow was the only thing between them. The belle crosses the diameter instead,
    // so the arc clears her by its own radius: 0.5 of the width, from the shape of the
    // figure rather than from a tuned proportion (ADR-0014). Rendered at townage's default
    // cast that is the difference between 0.34 world units and 0.57, against two bodies
    // needing 0.52 — which is to say between a collision and a clearance.
    const m = trade();
    const beau = m["beau"];
    const belle = m["belle"];
    expect(beau).toBeDefined();
    expect(belle).toBeDefined();
    for (const a of beau?.waypoints ?? []) {
      const b = belle?.waypoints.find((w) => Math.abs(w.beat - a.beat) < 1e-9);
      if (b === undefined) continue;
      // 1e-5, not 1e-9: waypoints are quantised to `round`'s 1e-6 over a couple width that
      // is a non-representable third, exactly as the standing-spot test above notes.
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(TRADE_PASS_SEPARATION - 1e-5);
    }
  });

  it("🔴 keeps the belle off the front entirely — she steps across, she does not walk round", () => {
    // Ryan, 2026-08-18: *"really the belle should not move forward hardly at all in this,
    // since that makes the beau have to move even farther out to get around — for the belle
    // this is really a step left and pivot 180."* Asserted as **zero** rather than "hardly
    // any", because the step is along the couple's own axis and there is nothing to put a
    // forward component in it. Her old arc took her `COUPLE_WIDTH / 2 − TRADE_LANE` forward
    // at the middle, which is what pushed the beau's arc out to meet her.
    const m = trade();
    for (const w of m["belle"]?.waypoints ?? []) expect(w.y).toBeCloseTo(0, 9);
    // ...and she travels the whole distance between the two standing spots.
    const xs = (m["belle"]?.waypoints ?? []).map((w) => w.x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(COUPLE_WIDTH, 5);
  });

  it("🔴 passes right shoulders, asserted as shoulders rather than as radii", () => {
    // The asymmetry that makes it position-dependent. **Stated as the thing the source
    // actually says** — each dancer has the other on their own right at the pass — rather
    // than as the two radii that used to implement it. The old assertion could only be
    // satisfied by the old mechanism; this one is satisfied by any figure that passes
    // correctly, which is why the rewrite (ADR-0014) could be checked against it.
    const m = trade();
    const beau = midpoint(m, "beau");
    const belle = midpoint(m, "belle");
    expect(beau).toBeDefined();
    expect(belle).toBeDefined();
    /** How far `other` lies to `w`'s own right — positive is on the right. */
    const toTheRightOf = (w: Waypoint, other: Waypoint): number => {
      const r = ((w.facing - 90) * Math.PI) / 180;
      return (other.x - w.x) * Math.cos(r) + (other.y - w.y) * Math.sin(r);
    };
    expect(toTheRightOf(beau as Waypoint, belle as Waypoint)).toBeGreaterThan(0);
    expect(toTheRightOf(belle as Waypoint, beau as Waypoint)).toBeGreaterThan(0);

    // And the shape of it: at the pass he is at the top of the arc, she is at the couple's
    // own centre. A whole radius, with nothing tuned to make it so.
    expect(Math.hypot(beau?.x ?? 0, beau?.y ?? 0)).toBeCloseTo(TRADE_PASS_SEPARATION, 5);
    expect(Math.hypot(belle?.x ?? 0, belle?.y ?? 0)).toBeCloseTo(0, 5);
  });

  it("🔴 never sways — a step with no forward component comes with a turn", () => {
    // The invariant the 2026-08-16 render watch produced, **restated** by ADR-0014.
    //
    // It said *every step has a forward component*, and that was the right cure for the
    // wrong reason. What reads as sway on screen is lateral travel with the facing
    // **constant** — the couple sliding bodily sideways for two beats. It is the absence of
    // turning that makes it sway, not the presence of sideways travel: the belle's step
    // across is entirely lateral at the instant it starts and is a pivot, not a sway,
    // because she is rotating through the whole of it.
    //
    // So the test now says the thing the watch was really about. Every step either goes
    // forward or turns, and none of them stands still.
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
        const forward = [from.facing, to.facing].every((facing) => {
          const a = (facing * Math.PI) / 180;
          return dx * Math.cos(a) + dy * Math.sin(a) > 0;
        });
        const turning = Math.abs(deltaDeg(from.facing, to.facing)) > 1e-9;
        expect(forward || turning).toBe(true);
      }
    }
  });

  it("keeps the beau walking forward for every step of it", () => {
    // The original invariant, kept in full where it still applies. He walks an arc; his
    // facing is tangent to it; every chord of it points where he is going. The belle is the
    // dancer the restatement above is for, and confining the strong form to the beau is
    // what stops the restatement from being a licence.
    const wps = trade()["beau"]?.waypoints ?? [];
    for (let i = 0; i + 1 < wps.length; i += 1) {
      const from = wps[i];
      const to = wps[i + 1];
      if (from === undefined || to === undefined) continue;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      for (const facing of [from.facing, to.facing]) {
        const a = (facing * Math.PI) / 180;
        expect(dx * Math.cos(a) + dy * Math.sin(a)).toBeGreaterThan(0);
      }
    }
  });

  it("turns the belle steadily through her step, so the pivot is the whole 180°", () => {
    // Not a step then a turn, and not a turn then a step: the two run together, which is
    // what puts her facing along her travel by the middle of the call and what makes the
    // right-shoulder pass come out without anything being placed to make it.
    const wps = trade()["belle"]?.waypoints ?? [];
    expect(wps.length).toBeGreaterThan(2);
    const first = wps[0];
    const last = wps[wps.length - 1];
    expect(Math.abs(deltaDeg(first?.facing ?? 0, last?.facing ?? 0))).toBeCloseTo(180, 5);
    // Steady: equal turn between equally spaced waypoints.
    const steps = wps.slice(1).map((w, i) => Math.abs(deltaDeg(wps[i]?.facing ?? 0, w.facing)));
    for (const t of steps) expect(t).toBeCloseTo(steps[0] ?? 0, 5);
  });

  it("is declared position-dependent, and really is", () => {
    // ADR-0012's field, doing work for the first time. The two chains must differ, or
    // the flag is decoration.
    expect(partnerTrade.positionDependent).toBe(true);
    expect(partnerTrade.chains).toBeDefined();
    expect(partnerTrade.chains?.beau).not.toEqual(partnerTrade.chains?.belle);
  });

  it("🔴 gives the two sides genuinely different figures", () => {
    // This asserted the **opposite** until 2026-08-18: *"gives both sides the same shape,
    // one figure danced two ways round"*, which was the pleasing check on the old reading
    // and is exactly what was wrong with it. A Partner Trade danced by a couple is two
    // different actions — he walks a semicircle, she steps across and pivots — and the
    // symmetry the old test was admiring is what put them in each other's way (ADR-0014).
    const beau = partnerTrade.chains?.beau ?? [];
    const belle = partnerTrade.chains?.belle ?? [];
    expect(beau.map((c) => c.block)).toEqual(["orbit"]);
    expect(belle.map((c) => c.block)).toEqual(["step-pivot"]);
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

describe("🔴 a Trade is danced at the couple's own width", () => {
  // ADR-0015. `COUPLE_WIDTH` has documented itself as a body-agnostic default since
  // 2026-08-15 — *"a consumer with real bodies should compute it and pass it to
  // partnerUp"* — and townage does, passing 0.438. The chains were written against the
  // constant, so every couple call was danced at a third of a unit however far apart the
  // pair were standing. Nothing caught it because every test here used the default.
  const WIDE = 0.4385;
  const wide = partnerUp("beau", "belle", { x: 0, y: 0 }, PLUS_Y, WIDE);

  it("lands each dancer on the other's standing spot, at any width", () => {
    // The property that was broken. At `WIDE` both used to finish at ±0.114 instead of
    // ±0.219 — the couple **halving** on every call.
    for (const couple of [partnerUp("beau", "belle"), wide]) {
      const m = applyCallToCouple("partner-trade", couple);
      for (const [position, other] of [["beau", "belle"], ["belle", "beau"]] as const) {
        const want = positionOf(couple, other).position;
        expect(m[position]?.exit.position.x).toBeCloseTo(want.x, 5);
        expect(m[position]?.exit.position.y).toBeCloseTo(want.y, 5);
      }
    }
  });

  it("keeps the couple the same width it started, call after call", () => {
    // The visible symptom, stated as the invariant it violates. Four Trades at a
    // non-default width: under the bug the pair ended a sixteenth as far apart.
    let couple = wide;
    for (let i = 0; i < 4; i++) {
      couple = reformCouple(couple, applyCallToCouple("partner-trade", couple));
      expect(couple.width).toBeCloseTo(WIDE, 4);
    }
  });

  it("scales the pass separation with the width too", () => {
    const m = applyCallToCouple("partner-trade", wide);
    const a = midpoint(m, "beau");
    const b = midpoint(m, "belle");
    expect(Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0)))
      .toBeCloseTo(WIDE / 2, 4);
  });

  it("still comes home at a non-default width", () => {
    expect(isCoupleZero(["partner-trade", "partner-trade"], wide).home).toBe(true);
  });

  it("leaves the serialisable `chains` at the default width, as the fixtures expect", () => {
    // `chainsAt` is what gets danced; `chains` stays the COUPLE_WIDTH instantiation so the
    // workshop and the spec-conformance fixtures keep reading concrete data (ADR-0005).
    const belle = partnerTrade.chains?.belle[0];
    expect(belle?.block).toBe("step-pivot");
    expect((belle?.params as { distance: number }).distance).toBeCloseTo(COUPLE_WIDTH, 9);
    const danced = partnerTrade.chainsAt?.(wide).belle[0];
    expect((danced?.params as { distance: number }).distance).toBeCloseTo(WIDE, 9);
  });
});

describe("the pass separation follows the couple's width", () => {
  it("🔴 is half the width, and is not a tuned proportion", () => {
    // 🔴 This suite used to be *"the Trade lane follows the couple's width"* and asserted
    // three constants — `TRADE_LANE`, `TRADE_RADIUS_IN`, `TRADE_RADIUS_OUT` — that are gone
    // with the lane. The lane was `COUPLE_WIDTH × LANE_OFFSET`, a proportion borrowed from a
    // *facing pair's* one-unit separation and then scaled; it separated the dancers by 0.3
    // of the couple's width. The separation is now 0.5 of it and comes from the figure:
    // he is at the top of the arc, she is at its centre (ADR-0014).
    expect(TRADE_PASS_SEPARATION).toBeCloseTo(COUPLE_WIDTH / 2, 9);
  });

  it("separates the dancers at the crossing by exactly that", () => {
    // The property the lane used to exist for, now a consequence of the shape.
    const m = applyCallToCouple("partner-trade", couple);
    const a = midpoint(m, "beau");
    const b = midpoint(m, "belle");
    expect(Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0)))
      .toBeCloseTo(TRADE_PASS_SEPARATION, 5);
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
