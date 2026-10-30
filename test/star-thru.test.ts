import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { checkChain, compose } from "../src/compose.js";
import { positionOf } from "../src/couple.js";
import { PAIR_A, PAIR_B } from "../src/calls.js";
import { DEFAULT_PAIR_SHAPE, shapeOf } from "../src/shape.js";
import { applyStarThru, STAR_THRU_BEATS, starThru, starThruChains, starThruWalk } from "../src/star-thru.js";
import { sampleMotion } from "../src/stepper.js";

const MINUS_X = 180;

describe("🧪 Star Thru — a facing pair becomes a couple (2026-10-29)", () => {
  it("each side is one step-pivot, and both sum to the chart's 4 beats", () => {
    const chains = starThruChains();
    for (const side of ["beau", "belle"] as const) {
      expect(chains[side].map((c) => c.block)).toEqual(["step-pivot"]);
      expect(compose(chains[side]).beats).toBe(STAR_THRU_BEATS);
      expect(checkChain(chains[side])).toEqual([]);
    }
    expect(starThru.chartBeats).toBe(4);
  });

  it("the man turns a quarter right, the woman a quarter left under the arch, man's right to woman's left", () => {
    const { a, b } = applyStarThru("b");
    expect(b.momentum.rotation).toBe(-90);
    expect(a.momentum.rotation).toBe(90);
    expect(b.grips).toEqual([{ hand: "right", grip: "arch", from: 0, to: 4 }]);
    expect(a.grips).toEqual([{ hand: "left", grip: "arch", from: 0, to: 4 }]);
  });

  it("they swap spots and finish as a couple facing the man's right, the man as beau", () => {
    const { a, b, couple } = applyStarThru("b");
    expect(a.exit.facing).toBe(MINUS_X);
    expect(b.exit.facing).toBe(MINUS_X);
    expect(couple).toMatchObject({ beau: "b", belle: "a", facing: MINUS_X, center: { x: 0, y: 0 } });
    // Within the engine's six-decimal rounding: the couple is placed from the rounded exits.
    for (const [m, side] of [[b, "beau"], [a, "belle"]] as const) {
      expect(m.exit.position.x).toBeCloseTo(positionOf(couple, side).position.x, 5);
      expect(m.exit.position.y).toBeCloseTo(positionOf(couple, side).position.y, 5);
    }
    // On the pair's own line: nothing moved sideways.
    expect(a.exit.position.x).toBe(0);
    expect(b.exit.position.x).toBe(0);
  });

  it("either of the pair can be the man: the figure is the same, turned half round", () => {
    const one = applyStarThru("b");
    const two = applyStarThru("a");
    expect(two.couple.facing).toBe(0);
    expect(two.a.exit.position.y).toBeCloseTo(-one.b.exit.position.y, 6);
    expect(two.b.exit.position.y).toBeCloseTo(-one.a.exit.position.y, 6);
  });

  it("they are level three quarters through, not halfway (the spec's second finding)", () => {
    const { a, b } = applyStarThru("b");
    const at = (beat: number) => [sampleMotion(a, beat), sampleMotion(b, beat)] as const;
    const [a3, b3] = at(3);
    expect(a3.position.y).toBeCloseTo(b3.position.y, 6);
    const [a2, b2] = at(2);
    expect(a2.position.y).toBeLessThan(b2.position.y);
  });

  it("property: at any couple width, they finish that width apart on the pair's spots, centre unchanged", () => {
    fc.assert(
      fc.property(fc.double({ min: 0.2, max: 1.2, noNaN: true }), fc.constantFrom("a", "b"), (width, man) => {
        const shape = shapeOf({ width }, DEFAULT_PAIR_SHAPE);
        const { a, b, couple } = applyStarThru(man, shape);
        const gap = Math.hypot(a.exit.position.x - b.exit.position.x, a.exit.position.y - b.exit.position.y);
        expect(gap).toBeCloseTo(width, 5);
        expect(couple.center.x).toBeCloseTo(0, 6);
        expect(couple.center.y).toBeCloseTo(0, 6);
        // Each finishes back on the pair's line, having bowed off it only in between.
        for (const [m, start] of [[a, PAIR_A], [b, PAIR_B]] as const) {
          expect(m.exit.position.x).toBeCloseTo(start.position.x, 6);
        }
        // Where they're level, right shoulders pass the pair's clearance apart: each half of it.
        const level = 0.5 / starThruWalk(shape);
        const pa = sampleMotion(a, level * STAR_THRU_BEATS);
        const pb = sampleMotion(b, level * STAR_THRU_BEATS);
        expect(pa.position.y).toBeCloseTo(pb.position.y, 4);
        // Within 1%: sampled between marks a twelfth of a beat apart, not at the peak itself.
        const lateral = Math.abs(pa.position.x - pb.position.x);
        expect(lateral).toBeGreaterThan(0.99 * shape.clearance);
        expect(lateral).toBeLessThanOrEqual(shape.clearance + 1e-6);
        // Right shoulders: as they pass, she is on the man's right (his facing − 90°).
        const [him, her] = man === "b" ? [pb, pa] : [pa, pb];
        const r = ((him.facing - 90) * Math.PI) / 180;
        const onHisRight = (her.position.x - him.position.x) * Math.cos(r) + (her.position.y - him.position.y) * Math.sin(r);
        expect(onHisRight).toBeGreaterThan(0);
        expect(starThruWalk(shape)).toBeCloseTo((1 + width) / 2, 6);
      }),
    );
  });
});
