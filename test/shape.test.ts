/**
 * Every call in the catalog, sized to the bodies dancing it (ADR-0020).
 *
 * The couple exchange has been shape-aware since ADR-0015: its chains are built from the
 * couple's width and its bow is solved against the couple's clearance. Nothing else was.
 * A Dosado passed at a fixed 0.3, a Pass Thru at the same 0.3, and an Allemande Left
 * gripped at a fixed 0.3 whatever anybody's arms were — so a consumer with real dancers
 * could size two calls out of five and had to move the whole floor for the rest.
 *
 * This suite is the claim that the seam now reaches all of them, and — just as important —
 * that a consumer who says nothing about bodies dances exactly what they danced before.
 */

import { describe, expect, it } from "vitest";
import {
  ALL_CALL_NAMES,
  CALLS,
  applyCall,
  applyCallToCouple,
  applyCallToPair,
  chainFor,
  type CallDef,
} from "../src/calls.js";
import { partnerUp } from "../src/couple.js";
import {
  COUPLE_WIDTH,
  DEFAULT_PAIR_SHAPE,
  DEFAULT_SHAPE,
  shapeOf,
  type FigureShape,
} from "../src/shape.js";
import {
  ENTRY_RADIUS,
  ORBIT_RADIUS,
  PASS_CLEARANCE,
  SLIDE_DISTANCE,
  STEP_OUT_RADIUS,
  generateBlock,
  pass,
  slide,
  turnUnder,
} from "../src/blocks/index.js";
import { atLeast } from "../src/geometry.js";
import { danceCoupleSequence, danceSequence, reformCouple } from "../src/sequence.js";
import { nth } from "./helpers.js";

/** How close the two dancers of a facing pair get, over the whole call. */
function closestInPair(name: Parameters<typeof applyCall>[0], shape: FigureShape): number {
  const { a, b } = applyCallToPair(name, shape);
  let worst = Infinity;
  for (const p of a.waypoints) {
    const q = b.waypoints.find((w) => Math.abs(w.beat - p.beat) < 1e-9);
    if (q === undefined) continue;
    worst = Math.min(worst, Math.hypot(p.x - q.x, p.y - q.y));
  }
  return worst;
}

/**
 * The radii an Allemande Left walks, in the **grip-centred frame the block is written in**.
 *
 * Generated from the block rather than from `applyCall`, and that is not a shortcut. A
 * composed chain is placed in the *dancer's* frame — `compose` aligns on `entry`, so the
 * dancer starts at the origin and the shared pivot ends up at `(0, standoff)` instead of
 * under it. Measuring a composed Allemande from the frame origin is how the first draft of
 * this suite convinced itself the default one walks a circle of 0.8. What the call is
 * responsible for is the *parameter*, which is asserted separately against `chainFor`.
 */
function gripRadii(shape: FigureShape): { standoff: number; orbit: number; out: number } {
  const m = generateBlock(nth(chainFor(CALLS["allemande-left"], shape), 0));
  const r = (x: number, y: number): number => Math.hypot(x, y);
  return {
    standoff: -m.entry.position.y,
    orbit: Math.max(...m.waypoints.slice(1, -1).map((w) => r(w.x, w.y))),
    out: r(m.exit.position.x, m.exit.position.y),
  };
}

describe("every move in the catalog takes a body", () => {
  it("🔴 gives every call a way to be sized — no figure is fixed any more", () => {
    // The claim in one assertion. Before ADR-0020 this passed for two of the five calls;
    // a sixth call added without a `chainAt` or a `chainsAt` fails here, which is the
    // point of asserting it over the catalog rather than call by call.
    for (const name of ALL_CALL_NAMES) {
      const def: CallDef = CALLS[name];
      expect(
        def.chainAt !== undefined || def.chainsAt !== undefined,
        `${def.name} is not shape-aware`,
      ).toBe(true);
    }
  });

  it("🔴 never offers both, because two answers to one question can disagree", () => {
    for (const name of ALL_CALL_NAMES) {
      const def: CallDef = CALLS[name];
      expect(
        def.chainAt === undefined || def.chainsAt === undefined,
        `${def.name} declares both chainAt and chainsAt`,
      ).toBe(true);
    }
  });
});

describe("a pair who ask for nothing dance exactly what they danced before", () => {
  // The compatibility claim the whole change rests on, and the reason not one spec fixture
  // moved. Written as the *serialised* chains rather than as endpoints, because the chains
  // are what the workshop shows and what a shared move travels as: an extra `clearance: 0.3`
  // riding along where the block's own default is already 0.3 would be a second document
  // saying the same thing.
  it("🔴 emits the hand-written chains, argument for argument", () => {
    expect(CALLS["dosado"].chain).toEqual([
      { block: "pass", params: { direction: "forward", shoulder: "right", exit: "lane" } },
      { block: "slide", params: { side: "right" } },
      { block: "pass", params: { direction: "backward", shoulder: "left", exit: "close" } },
    ]);
    expect(CALLS["pass-thru"].chain).toEqual([
      { block: "pass", params: { direction: "forward", shoulder: "right", exit: "centered" } },
    ]);
    expect(CALLS["allemande-left"].chain).toEqual([
      { block: "arm-turn", params: { hand: "left", fraction: 1, exit: "step-out" } },
    ]);
  });

  it("🔴 emits those same chains when handed the body-agnostic shape", () => {
    for (const name of ALL_CALL_NAMES) {
      const def: CallDef = CALLS[name];
      if (def.chainAt === undefined) continue;
      expect(def.chainAt(DEFAULT_PAIR_SHAPE), def.name).toEqual(def.chain);
    }
  });
});

describe("bodies widen a figure; they never narrow it", () => {
  // `shape.ts`'s rule, and the reason a shape can be handed to any call without the caller
  // checking whether it is safe. A figure's shape comes from the source; a body is the floor
  // under it. Two children who can pass in less room than a Dosado is drawn with still dance
  // the Dosado.
  const TINY = shapeOf({ clearance: 0.01, archClearance: 0.01 }, DEFAULT_PAIR_SHAPE);

  it("🔴 ignores a clearance smaller than the lane the figure is drawn with", () => {
    for (const name of ["dosado", "pass-thru"] as const) {
      expect(chainFor(CALLS[name], TINY), name).toEqual(CALLS[name].chain);
    }
  });

  it("🔴 and the blocks hold the same floor on their own", () => {
    const lane = { direction: "forward", shoulder: "right", exit: "lane" } as const;
    expect(pass.generate({ ...lane, clearance: 0.01 })).toEqual(pass.generate(lane));
    expect(slide.generate({ side: "right", distance: 0.01 })).toEqual(
      slide.generate({ side: "right" }),
    );
    expect(atLeast(PASS_CLEARANCE, undefined)).toBe(PASS_CLEARANCE);
    expect(atLeast(PASS_CLEARANCE, 0.9)).toBe(0.9);
  });

  it("🔴 makes the one exception the arms, because a grip is a placement and not room", () => {
    // A clearance is room a figure has to *find*, so a small request changes nothing. A grip
    // radius is where two people's arms actually put them — short arms genuinely dance a
    // tighter Allemande, and flooring it would draw a turn nobody can reach.
    const r = gripRadii(shapeOf({ gripRadius: 0.18 }));
    expect(r.standoff).toBeCloseTo(ENTRY_RADIUS, 6); // where they stand — a frame fact
    expect(r.orbit).toBeCloseTo(0.18, 6); // where their arms put them
    expect(r.orbit).toBeLessThan(ORBIT_RADIUS);
  });
});

describe("the pair calls pass at the room the bodies need", () => {
  // townage's shipped cast, in engine units: two bodies with their heads want 0.710 world
  // units side by side where the pair frame gives 0.3. Before this the only cure was to
  // scale the whole floor up by the ratio — "the neediest pair sets the spacing for
  // everyone, even in moves that don't involve them".
  const HEADS = 0.71;
  const wide = shapeOf({ clearance: HEADS }, DEFAULT_PAIR_SHAPE);

  it("🔴 opens a Pass Thru's lane to exactly the clearance asked for", () => {
    expect(closestInPair("pass-thru", DEFAULT_PAIR_SHAPE)).toBeCloseTo(PASS_CLEARANCE, 6);
    expect(closestInPair("pass-thru", wide)).toBeCloseTo(HEADS, 6);
  });

  it("🔴 opens a Dosado's, and the crossing step with it", () => {
    expect(closestInPair("dosado", wide)).toBeGreaterThan(HEADS - 1e-9);
    // The slide is a full lane change, so it is the same number and not half of it: the
    // dancer crosses from their own lane into the other one.
    const step = nth(chainFor(CALLS["dosado"], wide), 1);
    expect(step).toEqual({ block: "slide", params: { side: "right", distance: HEADS } });
    expect(slide.generate({ side: "right", distance: HEADS }).exit.position.x).toBeCloseTo(
      HEADS,
      6,
    );
  });

  it("🔴 charges no beats for it — the stride lengthens, the call does not slow down", () => {
    // ADR-0013's lesson, kept: what it threw out was a sidestep block charged a flat beat
    // for a sixth of a Dosado's distance. A *wider* step in the same beat is a longer
    // stride, which is what a bigger dancer covering more ground looks like.
    for (const name of ALL_CALL_NAMES) {
      const def: CallDef = CALLS[name];
      const wideShape = shapeOf(
        { clearance: HEADS, archClearance: HEADS, gripRadius: 0.45 },
        DEFAULT_PAIR_SHAPE,
      );
      expect(applyCall(name, undefined, wideShape).beats, def.name).toBe(
        applyCall(name).beats,
      );
    }
  });

  it("🔴 still lands a Pass Thru on the counterpart's former spot", () => {
    // The lane is an accommodation inside the figure, not a change to where it ends. The S
    // traced by a `centered` pass comes back to the centre line however wide it bulges.
    const { a } = applyCallToPair("pass-thru", wide);
    expect(a.exit.position.x).toBeCloseTo(0, 6);
    expect(a.exit.position.y).toBeCloseTo(0.5, 6);
  });

  it("🔴 still brings a Dosado home — exactly, at every clearance", () => {
    // The starter set's geometric zero, and it stays one to the last decimal however wide the
    // lane opens: the outbound lane, the crossing step and the closing diagonal are all the
    // same number, so widening it cancels. Asserted at `resolveHome`'s own tolerance would
    // have been the weaker claim — this is 0.000000, not 0.05.
    for (const clearance of [PASS_CLEARANCE, 0.5, HEADS, 1]) {
      const seq = danceSequence(["dosado"], shapeOf({ clearance }, DEFAULT_PAIR_SHAPE));
      const from = seq.start["a"];
      const to = seq.end["a"];
      expect(to?.position.x, `x at ${String(clearance)}`).toBeCloseTo(from?.position.x ?? 0, 9);
      expect(to?.position.y, `y at ${String(clearance)}`).toBeCloseTo(from?.position.y ?? 0, 9);
      expect(to?.facing).toBe(from?.facing);
    }
  });
});

describe("an Allemande Left is turned by the arms that grip it", () => {
  // The catalog's one body measurement that is not a clearance. Nobody passes anybody in an
  // arm turn: the two of them grip and walk a circle, and what decides its radius is how far
  // a joined forearm holds them off the shared pivot.
  const LONG = 0.45;

  it("🔴 hands the grip radius down the chain, and not the standoff", () => {
    // The standoff — where they stand before stepping in — is the pair frame's own half
    // unit, a fact about the floor rather than about anybody's arms. `shape.width` is a
    // *couple's* handhold span, which a facing pair does not have, so passing it here would
    // be one formation's measurement used as another's.
    expect(chainFor(CALLS["allemande-left"], shapeOf({ gripRadius: LONG }))).toEqual([
      {
        block: "arm-turn",
        params: { hand: "left", fraction: 1, exit: "step-out", gripRadius: LONG },
      },
    ]);
  });

  it("🔴 walks the circle the grip puts them on", () => {
    expect(gripRadii(DEFAULT_SHAPE).orbit).toBeCloseTo(ORBIT_RADIUS, 6);
    const long = generateBlock(
      nth(chainFor(CALLS["allemande-left"], shapeOf({ gripRadius: LONG })), 0),
    );
    // Every waypoint after the step-in is on the grip's own circle about the pivot.
    for (const w of long.waypoints.slice(1, -1)) {
      expect(Math.hypot(w.x, w.y)).toBeCloseTo(LONG, 6);
    }
  });

  it("🔴 steps out proportionally rather than to a fixed radius", () => {
    // `STEP_OUT_RADIUS` 0.42 is three fifths of the way from the 0.3 grip back out to the 0.5
    // standoff. Stated as a radius it would be *inside* the grip for a pair whose arms are
    // longer than 0.42, and the dancer would finish an Allemande by stepping in.
    expect(gripRadii(DEFAULT_SHAPE).out).toBeCloseTo(STEP_OUT_RADIUS, 6);
    const long = gripRadii(shapeOf({ gripRadius: LONG }));
    expect(long.out).toBeGreaterThan(LONG);
    expect(long.out).toBeLessThan(ENTRY_RADIUS);
  });

  it("🔴 takes the grip where the pair stand when their arms reach past their spots", () => {
    // A dancer cannot step *in* to a grip that is further out than they are standing. Rather
    // than an error — there is nothing wrong with long arms — the standoff rises to meet it
    // and the step-in becomes the no-op it physically is.
    const reaching = gripRadii(shapeOf({ gripRadius: 0.8 }));
    expect(reaching.standoff).toBeCloseTo(0.8, 6);
    expect(reaching.orbit).toBeCloseTo(0.8, 6);
    expect(reaching.out).toBeCloseTo(0.8, 6);
  });

  it("🔴 keeps the F2 grip channel saying forearm from the contact beat", () => {
    const long = applyCall("allemande-left", undefined, shapeOf({ gripRadius: LONG }));
    expect(long.grips).toHaveLength(1);
    expect(nth(long.grips, 0).grip).toBe("forearm");
    expect(nth(long.grips, 0).hand).toBe("left");
    expect(long.momentum.lastHand).toBe("left");
  });
});

describe("a couple carries all four measurements across a call boundary", () => {
  // ADR-0019's rule, extended to the field ADR-0020 adds. Width is measured from the two
  // exits because a call may legitimately change it; the other three are facts about bodies,
  // and a call boundary does not lengthen anybody's arm.
  it("🔴 carries the grip radius through `reformCouple`", () => {
    const couple = partnerUp("beau", "belle", undefined, undefined, {
      width: COUPLE_WIDTH,
      gripRadius: 0.44,
    });
    expect(couple.gripRadius).toBeCloseTo(0.44, 6);
    const motions = applyCallToCouple("partner-trade", couple);
    expect(reformCouple(couple, motions).gripRadius).toBeCloseTo(0.44, 6);
  });

  it("🔴 keeps it for every call of a sequence, not just the first", () => {
    // The exact shape of the bug ADR-0019 found one field over: a rebuilt couple got the
    // body-agnostic defaults, so the accommodation was danced once and lost.
    const couple = partnerUp("beau", "belle", undefined, undefined, {
      width: COUPLE_WIDTH,
      clearance: 0.3,
      archClearance: 0.32,
      gripRadius: 0.44,
    });
    const seq = danceCoupleSequence(["california-twirl", "california-twirl"], couple);
    const bows = seq.steps.map((s) =>
      Math.max(...(s.motions["beau"]?.waypoints ?? []).map((w) =>
        Math.hypot(w.x - couple.center.x, w.y - couple.center.y),
      )),
    );
    expect(nth(bows, 1)).toBeCloseTo(nth(bows, 0), 6);
  });

  it("🔴 sizes a position-independent call to the couple too", () => {
    // A couple *is* a `FigureShape`, so a call with no beau/belle split still reads their
    // bodies. Before ADR-0020 a couple dancing a Pass Thru fell back to the static chain and
    // passed at the body-agnostic lane however wide the two of them were.
    const couple = partnerUp("beau", "belle", undefined, undefined, {
      width: COUPLE_WIDTH,
      clearance: 0.7,
    });
    const chain = chainFor(CALLS["pass-thru"], couple);
    expect(nth(chain, 0)).toEqual({
      block: "pass",
      params: { direction: "forward", shoulder: "right", exit: "centered", clearance: 0.7 },
    });
    const motions = applyCallToCouple("pass-thru", couple);
    expect(Object.keys(motions).sort()).toEqual(["beau", "belle"]);
  });
});

describe("the shape itself", () => {
  it("🔴 defaults each measurement to the figure's own number, not to a body", () => {
    expect(DEFAULT_SHAPE.width).toBe(COUPLE_WIDTH);
    expect(DEFAULT_SHAPE.clearance).toBe(COUPLE_WIDTH / 2); // the exchange arc's radius
    expect(DEFAULT_SHAPE.archClearance).toBe(DEFAULT_SHAPE.clearance);
    expect(DEFAULT_SHAPE.gripRadius).toBe(ORBIT_RADIUS);
    // A facing pair differs in the one measurement whose figure differs: its default lane is
    // the one `pass` is drawn with, not the couple exchange's radius.
    expect(DEFAULT_PAIR_SHAPE.clearance).toBe(PASS_CLEARANCE);
    expect(PASS_CLEARANCE).toBe(SLIDE_DISTANCE);
  });

  it("🔴 takes a subset and fills the rest in", () => {
    expect(shapeOf({ gripRadius: 0.5 })).toEqual({ ...DEFAULT_SHAPE, gripRadius: 0.5 });
    expect(shapeOf()).toEqual(DEFAULT_SHAPE);
  });

  it("🔴 refuses a measurement that is not a length", () => {
    expect(() => shapeOf({ clearance: 0 })).toThrow(/clearance/);
    expect(() => shapeOf({ width: -1 })).toThrow(/width/);
  });

  it("🔴 lets `partnerUp` take the measurements either way, and refuses both at once", () => {
    const positional = partnerUp("a", "b", undefined, undefined, 0.4, 0.5, 0.6, 0.7);
    const object = partnerUp("a", "b", undefined, undefined, {
      width: 0.4,
      clearance: 0.5,
      archClearance: 0.6,
      gripRadius: 0.7,
    });
    expect(object).toEqual(positional);
    expect(() =>
      partnerUp("a", "b", undefined, undefined, { width: 0.4 }, 0.5),
    ).toThrow(/not both/);
  });

  it("🔴 still chains the old fallbacks: arch to clearance, clearance to the radius", () => {
    const c = partnerUp("a", "b", undefined, undefined, { width: 0.4, clearance: 0.9 });
    expect(c.archClearance).toBe(0.9);
    expect(partnerUp("a", "b").clearance).toBeCloseTo(COUPLE_WIDTH / 2, 6);
  });
});

describe("the handhold each figure names", () => {
  it("🔴 draws `turn-under`'s hold as an arch, which is the only hold you can walk under", () => {
    // The block's own first line is "two dancers with joined hands rotate about them, one
    // passing beneath the other's raised arch", and it emitted `forearm` — a grip at elbow
    // height. Written before `arch` existed (ADR-0017) and never caught, because this block
    // has never had a consumer.
    const arch = turnUnder.generate({
      pivot: "right",
      turn: "right",
      fraction: 0.5,
      radius: 0.5,
      hand: "right",
    });
    expect(nth(arch.grips, 0).grip).toBe("arch");
    const forearm = turnUnder.generate({
      pivot: "right",
      turn: "right",
      fraction: 0.5,
      radius: 0.5,
      hand: "right",
      grip: "forearm",
    });
    expect(nth(forearm.grips, 0).grip).toBe("forearm");
    expect(forearm.waypoints).toEqual(arch.waypoints);
  });

  it("🔴 leaves the hands-free calls saying so, at any shape", () => {
    // F2 asks whether the hand a following call needs is *available*, and an empty grip list
    // is a positive fact rather than an omission. Widening a lane must not invent a hold.
    const wide = shapeOf({ clearance: 0.9 }, DEFAULT_PAIR_SHAPE);
    for (const name of ["dosado", "pass-thru"] as const) {
      expect(applyCall(name, undefined, wide).grips, name).toEqual([]);
      expect(applyCall(name, undefined, wide).momentum.lastHand, name).toBe("none");
    }
  });
});
