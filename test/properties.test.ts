/**
 * Property tests over the model's invariants (ADR-0001, provable-lite).
 *
 * Real invariants, not smoke tests: the things that must hold for *every* input,
 * named in `docs/spec/call-model.md` before any of this was implemented.
 */

import fc from "fast-check";
import { nth } from "./helpers.js";
import { describe, expect, it } from "vitest";
import { armTurn, generateBlock, pass, slide, type CatalogCall } from "../src/blocks/index.js";
import { CALLS, applyCall, applyCallToPair, counterpart, PAIR_A } from "../src/calls.js";
import { checkChain, compose, embed } from "../src/compose.js";
import { deltaDeg, normaliseDeg, turnOf } from "../src/geometry.js";
import { IDEAL, createPerformance, idealPaths, sampleMotion } from "../src/stepper.js";

const passParams = fc.record({
  direction: fc.constantFrom("forward" as const, "backward" as const),
  shoulder: fc.constantFrom("right" as const, "left" as const),
  exit: fc.constantFrom("lane" as const, "centered" as const, "close" as const),
});

const slideParams = fc.record({ side: fc.constantFrom("right" as const, "left" as const) });

const armTurnParams = fc.record({
  hand: fc.constantFrom("right" as const, "left" as const),
  fraction: fc.constantFrom(0.25, 0.5, 0.75, 1, 1.5, 2),
  exit: fc.constantFrom("step-out" as const, "hold" as const),
});

const anyBlock: fc.Arbitrary<CatalogCall> = fc.oneof(
  passParams.map((params) => ({ block: "pass" as const, params })),
  slideParams.map((params) => ({ block: "slide" as const, params })),
  armTurnParams.map((params) => ({ block: "arm-turn" as const, params })),
);

describe("block invariants", () => {
  it("every block's waypoints run from beat 0 to its beat count, monotonically", () => {
    fc.assert(
      fc.property(anyBlock, (call) => {
        const m = generateBlock(call);
        const first = m.waypoints[0];
        const last = m.waypoints[m.waypoints.length - 1];
        expect(first?.beat).toBe(0);
        expect(last?.beat).toBeCloseTo(m.beats, 9);
        for (let i = 1; i < m.waypoints.length; i += 1) {
          expect(nth(m.waypoints, i).beat).toBeGreaterThan(nth(m.waypoints, i - 1).beat);
        }
      }),
    );
  });

  it("every block's final waypoint is its exit pose", () => {
    fc.assert(
      fc.property(anyBlock, (call) => {
        const m = generateBlock(call);
        const last = m.waypoints[m.waypoints.length - 1];
        expect(last?.x).toBeCloseTo(m.exit.position.x, 9);
        expect(last?.y).toBeCloseTo(m.exit.position.y, 9);
        expect(normaliseDeg(last?.facing ?? 0)).toBeCloseTo(normaliseDeg(m.exit.facing), 9);
      }),
    );
  });

  it("roll direction agrees with the sign of the rotation", () => {
    fc.assert(
      fc.property(anyBlock, (call) => {
        const m = generateBlock(call);
        expect(m.momentum.roll).toBe(turnOf(m.momentum.rotation));
      }),
    );
  });

  it("grip spans lie inside the block's beat range and start before they end", () => {
    fc.assert(
      fc.property(anyBlock, (call) => {
        const m = generateBlock(call);
        for (const g of m.grips) {
          expect(g.from).toBeGreaterThanOrEqual(0);
          expect(g.to).toBeLessThanOrEqual(m.beats);
          expect(g.from).toBeLessThan(g.to);
        }
      }),
    );
  });

  it("arm-turn engages the named forearm from contact; pass and slide keep hands free", () => {
    fc.assert(
      fc.property(armTurnParams, (params) => {
        const m = armTurn.generate(params);
        expect(m.grips).toHaveLength(1);
        expect(m.grips[0]?.hand).toBe(params.hand);
        expect(m.grips[0]?.grip).toBe("forearm");
        expect(m.grips[0]?.from).toBe(1); // the contact beat
      }),
    );
    fc.assert(
      fc.property(fc.oneof(passParams, slideParams), (params) => {
        const m =
          "side" in params ? slide.generate(params) : pass.generate(params);
        expect(m.grips).toEqual([]);
      }),
    );
  });

  it("composition shifts grip spans onto the chain's beat axis", () => {
    // A slide (1 beat, no grips) ahead of a full left arm-turn: the turn's grip
    // must ride along with its block.
    const motion = compose([
      { block: "slide", params: { side: "right" } },
      { block: "arm-turn", params: { hand: "left", fraction: 1, exit: "step-out" } },
    ]);
    expect(motion.grips).toHaveLength(1);
    expect(motion.grips[0]?.from).toBe(2); // 1 (slide) + 1 (contact beat)
    expect(motion.grips[0]?.to).toBe(8.5); // 1 + 8 − the step-out half beat
  });

  it("non-rotating blocks cannot roll", () => {
    // CALLERLAB lists Dosado and Pass Thru as cannot-roll calls, and this is the
    // structural reason: their blocks accumulate no rotation.
    fc.assert(
      fc.property(fc.oneof(passParams, slideParams), (params) => {
        const m =
          "side" in params ? slide.generate(params) : pass.generate(params);
        expect(m.momentum.rotation).toBe(0);
        expect(m.momentum.roll).toBeNull();
      }),
    );
  });

  it("mirroring a block negates its x and its rotation", () => {
    fc.assert(
      fc.property(armTurnParams, (params) => {
        const left = armTurn.generate({ ...params, hand: "left" });
        const right = armTurn.generate({ ...params, hand: "right" });
        expect(right.momentum.rotation).toBeCloseTo(-left.momentum.rotation, 9);
        expect(left.waypoints.length).toBe(right.waypoints.length);
        left.waypoints.forEach((w, i) => {
          expect(nth(right.waypoints, i).x).toBeCloseTo(-w.x, 6);
          expect(nth(right.waypoints, i).y).toBeCloseTo(w.y, 6);
        });
      }),
    );
  });

  it("arm-turn timing is linear in the fraction: a full turn is 8 beats", () => {
    fc.assert(
      fc.property(armTurnParams, (params) => {
        expect(armTurn.beats(params)).toBeCloseTo(params.fraction * 8, 9);
      }),
    );
  });
});

describe("composition invariants", () => {
  const chain = fc.array(anyBlock, { minLength: 1, maxLength: 6 });

  it("a chain's beats are the sum of its blocks' beats", () => {
    fc.assert(
      fc.property(chain, (blocks) => {
        const total = blocks.reduce((n, b) => n + generateBlock(b).beats, 0);
        expect(compose(blocks).beats).toBeCloseTo(total, 6);
      }),
    );
  });

  it("blocks meet: no chain built by composition has a positional gap", () => {
    fc.assert(
      fc.property(chain, (blocks) => {
        expect(checkChain(blocks)).toEqual([]);
      }),
    );
  });

  it("a chain's waypoints are beat-monotonic across block boundaries", () => {
    fc.assert(
      fc.property(chain, (blocks) => {
        const wps = compose(blocks).waypoints;
        for (let i = 1; i < wps.length; i += 1) {
          expect(nth(wps, i).beat).toBeGreaterThan(nth(wps, i - 1).beat);
        }
      }),
    );
  });

  it("accumulated rotation is the sum of the blocks' rotations, unwrapped", () => {
    // F4 measures same-direction rotation *across* transitions, so this must not
    // collapse to a bearing in [0, 360).
    fc.assert(
      fc.property(chain, (blocks) => {
        const total = blocks.reduce((n, b) => n + generateBlock(b).momentum.rotation, 0);
        expect(compose(blocks).momentum.rotation).toBeCloseTo(total, 6);
      }),
    );
  });

  it("embedding a motion at its own entry pose is the identity", () => {
    // Not "at the origin": arm-turn's local frame is grip-centred, so its entry is
    // (0, -0.5). Alignment is on `entry`, which is what lets the two frame
    // conventions coexist in one chain.
    fc.assert(
      fc.property(anyBlock, (call) => {
        const m = generateBlock(call);
        const e = embed(m, m.entry, 0);
        e.waypoints.forEach((w, i) => {
          expect(w.x).toBeCloseTo(nth(m.waypoints, i).x, 6);
          expect(w.y).toBeCloseTo(nth(m.waypoints, i).y, 6);
        });
      }),
    );
  });

  it("a chain's first waypoint is where the chain was told to start", () => {
    fc.assert(
      fc.property(chain, (blocks) => {
        const m = compose(blocks, PAIR_A);
        expect(m.waypoints[0]?.x).toBeCloseTo(PAIR_A.position.x, 6);
        expect(m.waypoints[0]?.y).toBeCloseTo(PAIR_A.position.y, 6);
      }),
    );
  });

  it("embedding preserves distances between consecutive waypoints", () => {
    // Rotation and translation are rigid motions; a block placed into a square
    // must not stretch.
    fc.assert(
      fc.property(anyBlock, fc.double({ min: -180, max: 180, noNaN: true }), (call, facing) => {
        const m = generateBlock(call);
        const e = embed(m, { position: { x: 3, y: -2 }, facing }, 0);
        for (let i = 1; i < m.waypoints.length; i += 1) {
          const a = Math.hypot(
            nth(m.waypoints, i).x - nth(m.waypoints, i - 1).x,
            nth(m.waypoints, i).y - nth(m.waypoints, i - 1).y,
          );
          const b = Math.hypot(
            nth(e.waypoints, i).x - nth(e.waypoints, i - 1).x,
            nth(e.waypoints, i).y - nth(e.waypoints, i - 1).y,
          );
          // 5dp, not 6: waypoints are rounded to 6dp for tidiness, so a rigid
          // motion can shift the last place. The invariant is rigidity, not
          // bit-exactness.
          expect(b).toBeCloseTo(a, 5);
        }
      }),
    );
  });
});

describe("call vectors from the specs", () => {
  it("Pass Thru lands on the counterpart's former spot", () => {
    const { a } = applyCallToPair("pass-thru");
    // Dancer A starts at (0, -0.5); B is at (0, +0.5). A should end on B's spot.
    expect(a.exit.position.x).toBeCloseTo(0, 6);
    expect(a.exit.position.y).toBeCloseTo(0.5, 6);
    expect(normaliseDeg(a.exit.facing)).toBeCloseTo(90, 6);
  });

  it("Pass Thru cannot roll and leaves both hands free", () => {
    const m = applyCall("pass-thru");
    expect(m.momentum.roll).toBeNull();
    expect(m.momentum.lastHand).toBe("none");
  });

  it("Allemande Left rolls CCW and leaves the right hand fresh", () => {
    // The F2 textbook pairing: a left arm turn releases the left hand, so Right
    // and Left Grand's right-hand start is available.
    const m = applyCall("allemande-left");
    expect(m.momentum.roll).toBe("ccw");
    expect(m.momentum.rotation).toBeCloseTo(360, 6);
    expect(m.momentum.lastHand).toBe("left");
  });

  it("the pair is point-symmetric: B is always A rotated 180°", () => {
    for (const name of Object.keys(CALLS) as (keyof typeof CALLS)[]) {
      const { a, b } = applyCallToPair(name);
      a.waypoints.forEach((w, i) => {
        expect(nth(b.waypoints, i).x).toBeCloseTo(-w.x, 6);
        expect(nth(b.waypoints, i).y).toBeCloseTo(-w.y, 6);
        expect(deltaDeg(nth(b.waypoints, i).facing, w.facing + 180)).toBeCloseTo(0, 6);
      });
      expect(b.exit.position.x).toBeCloseTo(counterpart(a.exit).position.x, 6);
    }
  });

  it("every call's chain sums to its charted beats", () => {
    for (const def of Object.values(CALLS)) {
      expect(compose(def.chain).beats).toBeCloseTo(def.chartBeats, 6);
    }
  });
});

describe("stepper — the anchor invariant (ADR-0006 / ADR-0007)", () => {
  it("with every coefficient off, the stepper reproduces the ideal path exactly", () => {
    // This is the structural anchor: ideal paths are not a second implementation,
    // they are this stepper degenerating. The test pins the degeneration.
    fc.assert(
      fc.property(fc.array(anyBlock, { minLength: 1, maxLength: 5 }), (blocks) => {
        const motion = compose(blocks, PAIR_A);
        const perf = createPerformance({ motions: { a: motion }, coefficients: IDEAL });

        for (const w of motion.waypoints) {
          const s = sampleMotion(motion, w.beat);
          expect(s.position.x).toBeCloseTo(w.x, 6);
          expect(s.position.y).toBeCloseTo(w.y, 6);
          expect(normaliseDeg(s.facing)).toBeCloseTo(normaliseDeg(w.facing), 6);
        }

        const at0 = perf.sample()[0];
        expect(at0?.lag).toBe(0);
        expect(at0?.position.x).toBeCloseTo(nth(motion.waypoints, 0).x, 6);
      }),
    );
  });

  it("is deterministic: same seed and config give identical output", () => {
    const motion = applyCall("dosado", PAIR_A);
    const run = (): unknown => {
      const p = createPerformance({ motions: { a: motion }, seed: 42 });
      return [p.tick(1), p.tick(1), p.tick(1)];
    };
    expect(run()).toEqual(run());
  });

  it("an externally-driven dancer takes its pose from the consumer, not the engine", () => {
    // The reason the stepper is the primary interface: the player is a dancer whose
    // position the engine reads rather than computes.
    const motion = applyCall("dosado", PAIR_A);
    const perf = createPerformance({
      motions: { npc: motion, player: motion },
      externallyDriven: ["player"],
    });

    const states = perf.tick(2, { player: { position: { x: 9, y: -9 }, facing: 12 } });
    const player = states.find((s) => s.key === "player");
    const npc = states.find((s) => s.key === "npc");

    expect(player?.externallyDriven).toBe(true);
    expect(player?.position).toEqual({ x: 9, y: -9 });
    expect(player?.facing).toBe(12);

    expect(npc?.externallyDriven).toBe(false);
    expect(npc?.position.x).toBeCloseTo(sampleMotion(motion, 2).position.x, 6);
  });

  it("idealPaths emits the ADR-0004 shape", () => {
    const motion = applyCall("dosado", PAIR_A);
    const paths = idealPaths({ a: motion });
    expect(paths["a"]).toEqual(motion.waypoints);
  });

  it("sampling never leaves the motion's beat range", () => {
    fc.assert(
      fc.property(
        fc.array(anyBlock, { minLength: 1, maxLength: 4 }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        (blocks, beat) => {
          const motion = compose(blocks);
          const s = sampleMotion(motion, beat);
          expect(Number.isFinite(s.position.x)).toBe(true);
          expect(Number.isFinite(s.position.y)).toBe(true);
          expect(Number.isFinite(s.facing)).toBe(true);
        },
      ),
    );
  });
});
