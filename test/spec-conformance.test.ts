/**
 * The specs' worked examples, asserted against the generators (ADR-0009).
 *
 * Two vectors are `it.fails` — they are **defects in the specs that this suite
 * caught**, kept as live tripwires rather than comments. Fixing the spec turns
 * them red, which is the prompt to flip them back to `it`. Detail in
 * `docs/PROGRESS.md` under "Known spec defects".
 */

import { describe, expect, it } from "vitest";
import { armTurn, pass, slide } from "../src/blocks/index.js";
import { compose } from "../src/compose.js";
import { CALLS, PAIR_A } from "../src/calls.js";
import type { Motion } from "../src/types.js";
import { loadSpecVectors, type SpecVector } from "./spec-loader.js";

const vectors = loadSpecVectors();

/** Rebuild the block invocation the signature line describes. */
function invoke(v: SpecVector): Motion {
  const [a = "", b = "", c = ""] = v.args;
  switch (v.block) {
    case "pass":
      return pass.generate({
        direction: a as "forward" | "backward",
        shoulder: b as "right" | "left",
        exit: c as "lane" | "centered",
      });
    case "slide":
      return slide.generate({ side: a as "right" | "left" });
    case "arm-turn":
      return armTurn.generate({
        hand: a as "right" | "left",
        fraction: b === "full" ? 1 : Number(b),
        exit: c as "step-out" | "hold",
      });
    default:
      throw new Error(`${v.file}: unknown block \`${v.block}\` in the catalog`);
  }
}

describe("spec conformance — the docs are the fixtures", () => {
  it("found the documented worked examples", () => {
    // Guards against the loader silently matching nothing, which would look like
    // a passing suite with no coverage at all.
    expect(vectors.length).toBeGreaterThanOrEqual(4);
    expect(vectors.map((v) => v.signature)).toContain("pass(forward, right, lane)");
    expect(vectors.map((v) => v.signature)).toContain("arm-turn(left, full, step-out)");
  });

  for (const v of vectors) {
    describe(`${v.file} — \`${v.signature}\``, () => {
      const motion = invoke(v);

      it("matches the documented beat count", () => {
        expect(motion.beats).toBe(v.beats);
      });

      it("reproduces every documented waypoint position", () => {
        for (const row of v.rows) {
          const wp = motion.waypoints.find((w) => w.beat === row.beat);
          expect(wp, `no waypoint at beat ${String(row.beat)}`).toBeDefined();
          expect(wp?.x).toBeCloseTo(row.x, 6);
          expect(wp?.y).toBeCloseTo(row.y, 6);
        }
      });

      const facingRows = v.rows.filter((r) => r.facing !== undefined);
      if (facingRows.length > 0) {
        it("reproduces every documented facing", () => {
          for (const row of facingRows) {
            const wp = motion.waypoints.find((w) => w.beat === row.beat);
            expect(wp?.facing).toBeCloseTo(row.facing ?? 0, 6);
          }
        });
      }
    });
  }
});

describe("call composition matches the chart", () => {
  for (const [name, def] of Object.entries(CALLS)) {
    it(`${def.name}: block chain sums to the chart's ${String(def.chartBeats)} beats`, () => {
      expect(compose(def.chain).beats).toBe(def.chartBeats);
      void name;
    });
  }

  // dosado.md asserts its full-call table is the chain's embedding. It is — once
  // `pass(backward, …)` is the time-reversal it should always have been. This test
  // is what caught that it wasn't.
  it("Dosado's documented full-call table is the chain's embedding", () => {
    const documented = [
      { beat: 0, x: 0.0, y: -0.5 },
      { beat: 1, x: -0.15, y: -0.1 },
      { beat: 2, x: -0.15, y: 0.3 },
      { beat: 3, x: 0.15, y: 0.3 },
      { beat: 4, x: 0.15, y: -0.1 },
      { beat: 6, x: 0.0, y: -0.5 },
    ];
    const motion = compose(CALLS.dosado.chain, PAIR_A);

    for (const row of documented) {
      const wp = motion.waypoints.find((w) => w.beat === row.beat);
      expect(wp?.x).toBeCloseTo(row.x, 6);
      expect(wp?.y).toBeCloseTo(row.y, 6);
    }
  });
});
