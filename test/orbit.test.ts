import { describe, expect, it } from "vitest";
import { armTurn, orbit } from "../src/blocks/index.js";
import { ORBIT_RADIUS } from "../src/blocks/arm-turn.js";
import { normaliseDeg } from "../src/geometry.js";

/** Where a motion is at a given beat, if it emitted a waypoint there. */
function at(m: ReturnType<typeof orbit.generate>, beat: number) {
  return m.waypoints.find((w) => Math.abs(w.beat - beat) < 1e-9);
}

describe("orbit — walking a circle with your hands free", () => {
  it("stays on its radius the whole way round", () => {
    // The property that distinguishes it from `arm-turn`, which steps in.
    for (const radius of [0.3, 0.5, 1.2]) {
      const m = orbit.generate({ turn: "left", fraction: 1, radius });
      for (const w of m.waypoints) {
        expect(Math.hypot(w.x, w.y)).toBeCloseTo(radius, 5);
      }
    }
  });

  it("faces where it is going, from the first beat", () => {
    // No step-in means no turn-out: a dancer walking a circle is tangential
    // immediately, which is the entry difference from `arm-turn`.
    const m = orbit.generate({ turn: "right", fraction: 0.5, radius: 0.5 });
    for (const w of m.waypoints.slice(0, -1)) {
      const next = m.waypoints[m.waypoints.indexOf(w) + 1];
      if (next === undefined) continue;
      const travel = normaliseDeg((Math.atan2(next.y - w.y, next.x - w.x) * 180) / Math.PI);
      // The chord's bearing lags the tangent by half the sampled arc; an eighth of a
      // circle is 45°, so the tangent leads the chord by 22.5°.
      expect(Math.abs(normaliseDeg(travel - w.facing + 180) - 180)).toBeLessThan(23);
    }
  });

  it("turns the facing through exactly the arc it walked", () => {
    for (const fraction of [0.25, 0.5, 0.75, 1]) {
      for (const turn of ["left", "right"] as const) {
        const m = orbit.generate({ turn, fraction, radius: 0.5 });
        expect(m.momentum.rotation).toBeCloseTo((turn === "left" ? 1 : -1) * fraction * 360, 9);
      }
    }
  });

  it("leaves both hands free, and says so as a fact", () => {
    // F2 asks whether the hand a following call needs is *available*. An empty grip
    // list is the positive answer, which is what makes a Trade flow into anything.
    const m = orbit.generate({ turn: "left", fraction: 0.5, radius: 0.5 });
    expect(m.grips).toEqual([]);
    expect(m.momentum.lastHand).toBe("none");
  });

  it("takes 4 beats for a half turn — the Trade family's timing", () => {
    expect(orbit.beats({ turn: "right", fraction: 0.5, radius: 0.5 })).toBe(4);
    expect(orbit.beats({ turn: "right", fraction: 1, radius: 0.5 })).toBe(8);
  });

  it("refuses a degenerate arc rather than emitting one", () => {
    expect(() => orbit.generate({ turn: "left", fraction: 0, radius: 0.5 })).toThrow(/fraction/);
    expect(() => orbit.generate({ turn: "left", fraction: 0.5, radius: 0 })).toThrow(/radius/);
  });

  it("mirrors exactly between left and right", () => {
    const l = orbit.generate({ turn: "left", fraction: 0.5, radius: 0.5 });
    const r = orbit.generate({ turn: "right", fraction: 0.5, radius: 0.5 });
    expect(l.waypoints).toHaveLength(r.waypoints.length);
    l.waypoints.forEach((w, i) => {
      const m = r.waypoints[i];
      // Reflected in the y axis: x negates, y is shared.
      expect(m?.x).toBeCloseTo(-w.x, 6);
      expect(m?.y).toBeCloseTo(w.y, 6);
    });
  });
});

describe("the claim that an arm turn is an orbit plus a grip plus the step-in", () => {
  // 🔴 `arm-turn` is deliberately NOT refactored onto `orbit` — it is
  // render-validated (2026-07-27, the Allemande's CCW turn) and this family does not
  // disturb validated geometry for a tidier decomposition. So the relationship is
  // asserted here instead of assumed, and a future refactor would start from evidence
  // rather than from a docstring.

  it("puts the dancer on the same arc, once the step-in has happened", () => {
    // `arm-turn` reaches ORBIT_RADIUS at beat 1 and rotates from there; `orbit` at the
    // same radius should trace the same circle. Compared at the quarter marks, which
    // is where `arm-turn` emits.
    const turn = armTurn.generate({ hand: "left", fraction: 1, exit: "hold" });
    const circle = orbit.generate({ turn: "left", fraction: 1, radius: ORBIT_RADIUS });

    for (const turns of [0.25, 0.5, 0.75]) {
      const a = at(turn, 1 + turns * 8);
      const b = at(circle, turns * 8);
      expect(a).toBeDefined();
      expect(b).toBeDefined();
      expect(a?.x).toBeCloseTo(b?.x ?? NaN, 5);
      expect(a?.y).toBeCloseTo(b?.y ?? NaN, 5);
      expect(a?.facing).toBeCloseTo(b?.facing ?? NaN, 5);
    }
  });

  it("differs exactly where the grip and the step-in are, and nowhere else", () => {
    // The two documented differences, stated as assertions so that "plus a grip plus
    // the step-in" is a complete description rather than an approximate one.
    const turn = armTurn.generate({ hand: "left", fraction: 1, exit: "hold" });
    const circle = orbit.generate({ turn: "left", fraction: 1, radius: ORBIT_RADIUS });

    // 1. The grip.
    expect(turn.grips).toHaveLength(1);
    expect(circle.grips).toHaveLength(0);

    // 2. The step-in: `arm-turn` enters further out and takes a beat to arrive.
    expect(Math.hypot(turn.entry.position.x, turn.entry.position.y)).toBeGreaterThan(
      ORBIT_RADIUS,
    );
    expect(Math.hypot(circle.entry.position.x, circle.entry.position.y)).toBeCloseTo(
      ORBIT_RADIUS,
      6,
    );
  });

  it("🔴 absorbs the step-in rather than adding it, so the last quarter is compressed", () => {
    // The correction this suite produced. "An arm turn is an orbit plus a grip plus
    // the step-in" reads as though the step-in costs a beat — it does not. Both are 8
    // beats for a full turn; `arm-turn` spends the first on stepping in and then has
    // to fit a whole revolution into the remaining seven, which it does by compressing
    // the closing quarter. The arcs therefore agree at the quarter marks up to 0.75
    // and part company after it.
    //
    // Left as an assertion rather than smoothed away, because a refactor of `arm-turn`
    // onto `orbit` would have to decide what happens to that compressed quarter, and
    // this is the test that would make the decision visible.
    const turn = armTurn.generate({ hand: "left", fraction: 1, exit: "hold" });
    const circle = orbit.generate({ turn: "left", fraction: 1, radius: ORBIT_RADIUS });

    expect(turn.beats).toBe(circle.beats);

    // Three quarters of the turn take 6 beats of arc in both...
    expect(at(turn, 7)).toBeDefined();
    expect(at(circle, 6)).toBeDefined();
    // ...and the final quarter takes 1 beat in `arm-turn` against `orbit`'s 2.
    const armLastQuarter = turn.beats - 7;
    const orbitLastQuarter = circle.beats - 6;
    expect(armLastQuarter).toBe(1);
    expect(orbitLastQuarter).toBe(2);
  });
});
