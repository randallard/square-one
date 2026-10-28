import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { orbit, pullBy, PULL_BY_RELEASE } from "../src/blocks/index.js";
import { checkChain } from "../src/compose.js";
import { positionOf } from "../src/couple.js";
import {
  applyCallToFacingCouples,
  faceCouples,
  placesOf,
  reformFacingCouples,
  relative,
  rightAndLeftThru,
  roomToFace,
  separationOf,
  setFacingCouples,
  type FacingCouples,
} from "../src/facing-couples.js";
import { MINUS_Y, PLUS_Y, normaliseDeg } from "../src/geometry.js";
import { partnerUp } from "../src/couple.js";
import { sampleMotion } from "../src/stepper.js";
import type { Motion } from "../src/types.js";

const SET = setFacingCouples({ beau: "b1", belle: "g1" }, { beau: "b2", belle: "g2" });

/** Closest two dancers come over a call, sampled finely. */
function closest(motions: Record<string, Motion>, a: string, b: string, step = 0.01): number {
  const ma = motions[a];
  const mb = motions[b];
  if (ma === undefined || mb === undefined) throw new Error(`no motion for ${a} or ${b}`);
  let worst = Infinity;
  for (let t = 0; t <= ma.beats + 1e-9; t += step) {
    const p = sampleMotion(ma, t).position;
    const q = sampleMotion(mb, t).position;
    worst = Math.min(worst, Math.hypot(p.x - q.x, p.y - q.y));
  }
  return worst;
}

describe("🧪 facing couples (S2)", () => {
  it("stands two couples up a unit apart, facing each other, beau on each couple's left", () => {
    expect(SET.first.center).toEqual({ x: 0, y: -0.5 });
    expect(SET.first.facing).toBe(PLUS_Y);
    expect(SET.second.center).toEqual({ x: 0, y: 0.5 });
    expect(SET.second.facing).toBe(MINUS_Y);
    // Facing +y the beau is at −x; the couple facing −y has its beau at +x.
    expect(positionOf(SET.first, "beau").position.x).toBeLessThan(0);
    expect(positionOf(SET.second, "beau").position.x).toBeGreaterThan(0);
  });

  it("refuses two couples that are not facing couples", () => {
    const a = partnerUp("a", "b", { x: 0, y: -0.5 }, PLUS_Y);
    expect(() => faceCouples(a, partnerUp("c", "d", { x: 0, y: 0.5 }, PLUS_Y))).toThrow(/opposite/);
    expect(() => faceCouples(a, partnerUp("c", "d", { x: 0, y: -1.5 }, MINUS_Y))).toThrow(/in front/);
    expect(() => faceCouples(a, partnerUp("c", "d", { x: 0.3, y: 0.5 }, MINUS_Y))).toThrow(/one line/);
  });

  it("keeps the set's own clearance, the wider couple's by default", () => {
    expect(SET.clearance).toBeCloseTo(SET.first.clearance, 6);
    const set = setFacingCouples({ beau: "a", belle: "b" }, { beau: "c", belle: "d" }, 2, undefined, undefined, 0.9);
    expect(set.clearance).toBe(0.9);
    expect(reformFacingCouples(set, applyCallToFacingCouples("right-and-left-thru", set)).clearance).toBe(0.9);
  });

  it("stands couples at least a clearance and half of each couple's width apart", () => {
    expect(roomToFace(SET.first, SET.second)).toBeCloseTo(0.3 + 1 / 3, 6);
    const wide = setFacingCouples(
      { beau: "a", belle: "b", shape: { width: 1, clearance: 0.8 } },
      { beau: "c", belle: "d", shape: { width: 0.5 } },
      1,
    );
    expect(separationOf(wide)).toBeCloseTo(0.8 + 0.75, 6);
  });

  it("names a dancer's partner and opposite: the opposite is straight across", () => {
    expect(relative(SET, "b1", "partner")).toBe("g1");
    expect(relative(SET, "b1", "opposite")).toBe("g2");
    expect(relative(SET, "g1", "opposite")).toBe("b2");
    expect(relative(SET, "g2", "opposite")).toBe("b1");
    // Straight across: the beau and the opposite belle stand on one line.
    expect(positionOf(SET.first, "beau").position.x).toBeCloseTo(positionOf(SET.second, "belle").position.x, 6);
  });
});

describe("🧪 Right and Left Thru", () => {
  const motions = applyCallToFacingCouples("right-and-left-thru", SET);

  it("is the chart's 6 beats, for every dancer", () => {
    expect(rightAndLeftThru.chartBeats).toBe(6);
    for (const m of Object.values(motions)) expect(m.beats).toBe(6);
  });

  it("chains: each dancer's two blocks meet", () => {
    for (const [key, place] of Object.entries(placesOf(SET))) {
      expect(checkChain(rightAndLeftThru.chainFor(SET, place), positionOf(SET[place.couple], place.position))).toEqual([]);
      expect(motions[key]).toBeDefined();
    }
  });

  it("ends in facing couples, each couple on the other's line, beau and belle as they were", () => {
    const end = reformFacingCouples(SET, motions);
    expect(end.first.center.x).toBeCloseTo(SET.second.center.x, 5);
    expect(end.first.center.y).toBeCloseTo(SET.second.center.y, 5);
    expect(end.first.facing).toBeCloseTo(SET.second.facing, 5);
    expect(end.second.center.y).toBeCloseTo(SET.first.center.y, 5);
    expect(end.first.beau).toBe("b1");
    expect(end.first.width).toBeCloseTo(SET.first.width, 5);
  });

  it("turns everybody half way round to the left, and backs the beau round", () => {
    for (const m of Object.values(motions)) {
      expect(m.momentum.rotation).toBeCloseTo(180, 5);
      expect(m.momentum.roll).toBe("ccw");
    }
    // Mid-turn the beau faces away from where he is going; the belle faces it.
    const b = motions.b1;
    const g = motions.g1;
    if (b === undefined || g === undefined) throw new Error("missing");
    const heading = (m: Motion, t: number) => {
      const p = sampleMotion(m, t - 0.05).position;
      const q = sampleMotion(m, t + 0.05).position;
      return (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
    };
    const off = (a: number, f: number) => Math.min(Math.abs(normaliseDeg(a - f)), 360 - Math.abs(normaliseDeg(a - f)));
    expect(off(heading(b, 4), sampleMotion(b, 4).facing)).toBeGreaterThan(150);
    expect(off(heading(g, 4), sampleMotion(g, 4).facing)).toBeLessThan(30);
  });

  it("joins right hands with the opposite and lets go before the two are level", () => {
    const pull = motions.b1?.grips.find((g) => g.grip === "palm" && g.hand === "right");
    expect(pull).toMatchObject({ with: "g2", relation: "opposite", from: 0, to: PULL_BY_RELEASE });
    expect(PULL_BY_RELEASE).toBeLessThan(1);
    expect(motions.g2?.grips.find((g) => g.hand === "right")?.with).toBe("b1");
  });

  it("courtesy turns his partner: left in left, and his right on her back", () => {
    const b = motions.b1?.grips.filter((g) => g.from >= 2) ?? [];
    expect(b).toEqual(expect.arrayContaining([
      expect.objectContaining({ hand: "left", grip: "palm", with: "g1", from: 2, to: 6 }),
      expect.objectContaining({ hand: "right", grip: "back", with: "g1", from: 2, to: 6 }),
    ]));
    expect(motions.g1?.grips.filter((g) => g.from >= 2)).toEqual([
      expect.objectContaining({ hand: "left", grip: "palm", with: "b1" }),
    ]);
  });

  it("passes the opposite, and the two belles each other, a clearance apart", () => {
    // The default set walks a Pass Thru's lane, 0.3; the belles pass in the middle.
    expect(closest(motions, "b1", "g2")).toBeGreaterThan(0.3 - 1e-3);
    expect(closest(motions, "g1", "b2")).toBeGreaterThan(0.3 - 1e-3);
    expect(closest(motions, "g1", "g2")).toBeGreaterThan(0.3 - 1e-3);
  });
});

describe("🧪 Right and Left Thru, any bodies (property)", () => {
  const sets: fc.Arbitrary<FacingCouples> = fc
    .record({
      w1: fc.double({ min: 0.2, max: 1.2, noNaN: true }),
      w2: fc.double({ min: 0.2, max: 1.2, noNaN: true }),
      c1: fc.double({ min: 0.1, max: 1, noNaN: true }),
      c2: fc.double({ min: 0.1, max: 1, noNaN: true }),
      // The set's own, between dancers of the two couples; absent half the time (the wider couple's).
      passing: fc.option(fc.double({ min: 0.1, max: 1, noNaN: true }), { nil: undefined }),
      // Asked for anything from a unit up; `setFacingCouples` stands them at least `roomToFace`.
      sep: fc.double({ min: 0.5, max: 3, noNaN: true }),
    })
    .map(({ w1, w2, c1, c2, sep, passing }) =>
      setFacingCouples(
        { beau: "b1", belle: "g1", shape: { width: w1, clearance: c1 } },
        { beau: "b2", belle: "g2", shape: { width: w2, clearance: c2 } },
        sep,
        undefined,
        undefined,
        passing,
      ),
    );

  it("gives every passing pair its clearance, and ends in facing couples at their own widths", () => {
    fc.assert(
      fc.property(sets, (set) => {
        const m = applyCallToFacingCouples("right-and-left-thru", set);
        const c = Math.max(0.3, set.clearance);
        for (const [a, b] of [["b1", "g2"], ["g1", "b2"], ["g1", "g2"]] as const) {
          expect(closest(m, a, b, 0.01)).toBeGreaterThan(c * 0.995);
        }
        const end = reformFacingCouples(set, m);
        expect(end.first.width).toBeCloseTo(set.first.width, 4);
        expect(end.second.width).toBeCloseTo(set.second.width, 4);
        // Mid-turn each couple has closed in to its own clearance, or stayed at its width if that
        // is less: the partners' room, not the set's.
        for (const c of [set.first, set.second]) {
          const beau = m[c.beau];
          const belle = m[c.belle];
          if (beau === undefined || belle === undefined) throw new Error("missing a dancer");
          const p = sampleMotion(beau, 4).position;
          const q = sampleMotion(belle, 4).position;
          const mid = Math.hypot(p.x - q.x, p.y - q.y);
          expect(mid).toBeCloseTo(Math.min(c.width, c.clearance), 3);
        }
      }),
      { numRuns: 60 },
    );
  });
});

describe("🧪 the blocks four needed", () => {
  it("pull-by: a Pass Thru's walk, straight ahead at both ends, its lane widest at the crossing", () => {
    const m = pullBy.generate({ hand: "right" });
    expect(m.exit).toEqual({ position: { x: 0, y: 1 }, facing: PLUS_Y });
    const mid = m.waypoints.find((w) => w.beat === 1);
    expect(mid?.x).toBeCloseTo(-0.15, 6);
    expect(m.momentum.lastHand).toBe("right");
  });

  it("orbit as a unit: square to the centre at every mark, however the circle bows", () => {
    const m = orbit.generate({ turn: "left", fraction: 0.5, radius: 0.5, lane: -0.2, unit: true });
    for (const w of m.waypoints) {
      // Facing +y·(angle + 90) for a left turn: perpendicular to the radius, the way round.
      const angle = (Math.atan2(w.y, w.x) * 180) / Math.PI;
      const off = Math.abs(normaliseDeg(w.facing - (angle + 90)));
      expect(Math.min(off, 360 - off)).toBeLessThan(1e-3);
    }
    // Facing the path instead, the bow tilts it off square on the way in and out.
    const path = orbit.generate({ turn: "left", fraction: 0.5, radius: 0.5, lane: -0.2 });
    expect(path.waypoints.some((w, i) => Math.abs(w.facing - (m.waypoints[i]?.facing ?? w.facing)) > 5)).toBe(true);
  });

  it("orbit backward: the same circle and the same turn, facing the other way", () => {
    const fwd = orbit.generate({ turn: "left", fraction: 0.5, radius: 0.5 });
    const back = orbit.generate({ turn: "left", fraction: 0.5, radius: 0.5, direction: "backward" });
    expect(back.waypoints.map((w) => [w.x, w.y])).toEqual(fwd.waypoints.map((w) => [w.x, w.y]));
    expect(back.momentum.rotation).toBe(fwd.momentum.rotation);
    expect(normaliseDeg(back.exit.facing - fwd.exit.facing)).toBe(180);
    expect(back.momentum.bodyFlow).toBe(fwd.momentum.bodyFlow);
  });
});
