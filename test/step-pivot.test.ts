import { describe, expect, it } from "vitest";
import { slide, stepPivot } from "../src/blocks/index.js";
import { BEATS_PER_TURN } from "../src/blocks/step-pivot.js";
import { PLUS_Y, deltaDeg, normaliseDeg } from "../src/geometry.js";

/** Where a motion is at a given beat, if it emitted a waypoint there. */
function at(m: ReturnType<typeof stepPivot.generate>, beat: number) {
  return m.waypoints.find((w) => Math.abs(w.beat - beat) < 1e-9);
}

const half = (over: Partial<Parameters<typeof stepPivot.generate>[0]> = {}) =>
  stepPivot.generate({ side: "left", distance: 1 / 3, turn: "left", fraction: 0.5, ...over });

describe("step-pivot — stepping to one side while turning on the spot", () => {
  it("travels only sideways, and never forward", () => {
    // The whole point of the block, and the reason it is not `orbit` with a tiny radius:
    // the dancer's path is a straight line across their own axis, so `y` never moves.
    for (const side of ["left", "right"] as const) {
      for (const w of half({ side }).waypoints) expect(w.y).toBeCloseTo(0, 9);
    }
  });

  it("steps to the dancer's own left or right, not the frame's", () => {
    // A dancer entering the block-local frame faces `+y`, so their left is `−x`. Getting
    // this backwards is the class of error `couple.ts` warns about: invisible on anything
    // symmetric and wrong on every asymmetric call.
    expect(half({ side: "left" }).exit.position.x).toBeCloseTo(-1 / 3, 6);
    expect(half({ side: "right" }).exit.position.x).toBeCloseTo(1 / 3, 6);
  });

  it("turns the whole fraction, steadily, and ends facing there", () => {
    const m = half();
    expect(m.entry.facing).toBeCloseTo(PLUS_Y, 6);
    expect(normaliseDeg(m.exit.facing)).toBeCloseTo(normaliseDeg(PLUS_Y + 180), 6);
    const turns = m.waypoints
      .slice(1)
      .map((w, i) => deltaDeg(m.waypoints[i]?.facing ?? 0, w.facing));
    for (const t of turns) expect(t).toBeCloseTo(turns[0] ?? 0, 6);
  });

  it("🔴 is timed by its turn, not by its distance", () => {
    // The trap `slide` fell into and had a `distance` parameter removed for (ADR-0013): a
    // flat beat for any distance made a sixth of a Dosado's crossing crawl at a sixth of
    // the speed. Here the beats come from the rotation — the same 8-per-turn `orbit` and
    // `arm-turn` use — so a wider couple's belle covers more ground in the same beats,
    // which is what stepping across a wider couple is.
    for (const distance of [0.1, 1 / 3, 2]) {
      expect(stepPivot.beats({ side: "left", distance, turn: "left", fraction: 0.5 })).toBe(
        BEATS_PER_TURN / 2,
      );
    }
    expect(stepPivot.beats({ side: "left", distance: 1, turn: "left", fraction: 1 })).toBe(
      BEATS_PER_TURN,
    );
  });

  it("turns both ways, and left is CCW as everywhere else in the catalog", () => {
    expect(deltaDeg(PLUS_Y, half({ turn: "left" }).exit.facing)).toBeCloseTo(180, 6);
    expect(half({ turn: "left" }).momentum.rotation).toBeCloseTo(180, 6);
    expect(half({ turn: "right" }).momentum.rotation).toBeCloseTo(-180, 6);
  });

  it("puts the middle of the travel at the middle of the turn", () => {
    // The coincidence a Partner Trade's right-shoulder pass is asserted against. Easing
    // either the travel or the turn would move the pass off the middle of the call.
    const m = half();
    const mid = at(m, BEATS_PER_TURN / 4);
    expect(mid).toBeDefined();
    expect(mid?.x).toBeCloseTo(-1 / 6, 6);
    expect(normaliseDeg(mid?.facing ?? 0)).toBeCloseTo(180, 6);
  });

  it("leaves both hands free and reports a roll", () => {
    const m = half();
    expect(m.grips).toEqual([]);
    expect(m.momentum.lastHand).toBe("none");
    expect(m.momentum.roll).not.toBeNull();
    // Body flow is along the final facing, not the lateral vector `slide` reports: by the
    // exit the dancer has turned into the way they were going.
    expect(m.momentum.bodyFlow).toBeCloseTo(m.exit.facing, 6);
  });

  it("is a pivot on the spot when the distance is zero", () => {
    const m = stepPivot.generate({ side: "left", distance: 0, turn: "right", fraction: 0.25 });
    for (const w of m.waypoints) {
      expect(w.x).toBeCloseTo(0, 9);
      expect(w.y).toBeCloseTo(0, 9);
    }
    expect(m.momentum.rotation).toBeCloseTo(-90, 6);
  });

  it("refuses a negative distance and a non-positive fraction", () => {
    expect(() =>
      stepPivot.generate({ side: "left", distance: -1, turn: "left", fraction: 0.5 }),
    ).toThrow(/distance/);
    expect(() =>
      stepPivot.generate({ side: "left", distance: 1, turn: "left", fraction: 0 }),
    ).toThrow(/fraction/);
  });

  it("is not `slide`, and the difference is the turn", () => {
    // Kept as a comparison rather than a comment: `slide` is the same lateral travel with
    // the facing held still, which is what reads as sway when it lasts two beats.
    const s = slide.generate({ side: "left" });
    expect(s.momentum.rotation).toBe(0);
    expect(s.waypoints.every((w) => w.facing === PLUS_Y)).toBe(true);
    expect(half().momentum.rotation).not.toBe(0);
  });
});
