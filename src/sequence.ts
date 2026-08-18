/**
 * Sequences: several calls, danced one after another, and the question of whether
 * the set got home.
 *
 * Planning **ADR-0011** (`work/square-dance-planning/adr/0011-npcs-dance-a-sequence-before-the-player-joins-one.md`,
 * no public remote — unlinked on purpose, per the escape rule the docs gate enforces)
 * makes this S1 — the increment that isolates **sequence** from **formation**.
 * Everything the engine has rendered so far is one call on a loop, and chaining is a
 * different axis from dancer count: this module needs exactly the two dancers
 * `applyCallToPair` already produces.
 *
 * ## Why this is not just `compose` again
 *
 * `compose` chains **blocks** within one call, in one dancer's local frame. This
 * chains **calls** across a **set**, and the difference is that a set has a shared
 * frame and more than one occupant. Composition is per-dancer and independent;
 * a sequence is the set moving together, and "are we home" is a fact about all of
 * them at once — no individual dancer can answer it.
 *
 * ## "Are we home" is the point, and it did not exist
 *
 * [ADR-0004](../docs/adr/0004-starter-scope-zero-box-triple.md) named home
 * resolution as a starter-set capability. It was never built: before this file the
 * only occurrence of "home" in this package was a comment inside Dosado's chain
 * explaining a blend. A **zero** — a call or sequence that returns the set to where
 * it started — is the module system's whole vocabulary, so a starter set that cannot
 * check one is a starter set that cannot check its own specs.
 *
 * Everything here is pure and frame-agnostic, like the rest of the package.
 */

import { normaliseDeg, round, type Degrees } from "./geometry.js";
import { CALLS, applyCallToCouple, applyCallToPair, type CallName } from "./calls.js";
import { coupleSet, partnerUp, type Couple } from "./couple.js";
import { compose } from "./compose.js";
import type { GripSpan, Motion, Pose, Waypoint } from "./types.js";

/**
 * How close a dancer has to be to a position to count as standing on it.
 *
 * In pair-frame units, where the two dancers of a facing pair start one unit apart.
 * A twentieth of that is well inside a body and well outside floating-point noise —
 * this is a *resolution* threshold, not an equality check, because a chain of calls
 * accumulates rounding at every `embed` and demanding exactness would make the
 * answer depend on how many calls were danced rather than on where anybody is.
 */
export const HOME_POSITION_TOLERANCE = 0.05;

/**
 * How far a dancer's facing may be off and still count as home, in degrees.
 *
 * Deliberately tight relative to the quarter-turns the call model deals in: the
 * failure this is here to catch is a call that leaves someone facing 90° or 180°
 * wrong, and a threshold loose enough to hide that would make the check worthless.
 */
export const HOME_FACING_TOLERANCE: Degrees = 2;

/** Where every dancer of a set is standing, keyed the way the consumer keys them. */
export type SetPose = Readonly<Record<string, Pose>>;

/** The two dancers of a facing pair, in the frame `calls.ts` establishes. */
export const PAIR_KEYS = ["a", "b"] as const;
export type PairKey = (typeof PAIR_KEYS)[number];

/** One call of a sequence, as danced by the whole set. */
export interface SequenceStep {
  readonly call: CallName;
  /** Beat at which this call begins, relative to the start of the sequence. */
  readonly startBeat: number;
  readonly beats: number;
  /** Each dancer's motion for this call, already placed in the set's frame. */
  readonly motions: Readonly<Record<string, Motion>>;
}

/** A whole sequence, danced. */
export interface Sequence {
  readonly calls: readonly CallName[];
  readonly steps: readonly SequenceStep[];
  readonly beats: number;
  /** Where the set stood before the first call. */
  readonly start: SetPose;
  /** Where it stands after the last one. */
  readonly end: SetPose;
}

/**
 * How far one dancer finished from where they started.
 *
 * Reported rather than reduced to a boolean, because "not home" is a number a spec
 * can be wrong by and a test can regress against. This package's consumers have
 * been caught four times by a claim that was checked as a boolean and wrong by a
 * measurable amount.
 */
export interface HomeOffset {
  readonly key: string;
  /** Straight-line distance from the starting position, in frame units. */
  readonly distance: number;
  /** Smallest angle between finishing and starting facing, unsigned. */
  readonly facingOff: Degrees;
  readonly home: boolean;
}

/** Whether a set got home, and by how much it missed if not. */
export interface HomeResolution {
  readonly home: boolean;
  readonly offsets: readonly HomeOffset[];
  /** The largest `distance` across the set — the number a spec is wrong by. */
  readonly worstDistance: number;
  /** The largest `facingOff` across the set. */
  readonly worstFacing: Degrees;
}

/** Smallest unsigned angle between two facings. */
function facingDelta(from: Degrees, to: Degrees): Degrees {
  const d = Math.abs(normaliseDeg(to - from));
  return round(d > 180 ? 360 - d : d);
}

/**
 * Is this set standing where it started?
 *
 * **A property of the set, not of a dancer.** Every occupant has to be home for the
 * answer to be yes, which is what makes a zero a claim about choreography rather
 * than about one person's luck — two dancers who swapped places are both "somewhere
 * a dancer started" and the set is emphatically not home.
 *
 * Compares like-for-like keys: a dancer present in one pose and not the other is a
 * different set, and reported as not home rather than silently skipped.
 */
export function resolveHome(start: SetPose, end: SetPose): HomeResolution {
  const keys = [...new Set([...Object.keys(start), ...Object.keys(end)])].sort();
  const offsets = keys.map((key): HomeOffset => {
    const from = start[key];
    const to = end[key];
    if (from === undefined || to === undefined) {
      return { key, distance: Infinity, facingOff: 180, home: false };
    }
    const distance = round(
      Math.hypot(to.position.x - from.position.x, to.position.y - from.position.y),
    );
    const facingOff = facingDelta(from.facing, to.facing);
    return {
      key,
      distance,
      facingOff,
      home: distance <= HOME_POSITION_TOLERANCE && facingOff <= HOME_FACING_TOLERANCE,
    };
  });
  return {
    home: offsets.every((o) => o.home),
    offsets,
    worstDistance: offsets.reduce((m, o) => Math.max(m, o.distance), 0),
    worstFacing: offsets.reduce((m, o) => Math.max(m, o.facingOff), 0),
  };
}

/**
 * Dance a sequence of calls with a facing pair, from the standard pair frame.
 *
 * Each call is generated in the set's frame from wherever the previous one left
 * everybody, so a sequence is exactly what it looks like: the calls, in order, with
 * nothing between them. The **first** call comes from `applyCallToPair`, which knows
 * the pair symmetry; subsequent ones are composed per dancer from their own exit
 * pose, because after one call the two are no longer necessarily related by that
 * symmetry — and asserting they still are is how a pair model quietly outlives its
 * assumptions.
 *
 * 🔴 **Every starter call is symmetric, so that distinction is currently invisible.**
 * Star Thru is the first one that is not — the gent turns a quarter right while the
 * lady turns a quarter left, ending on the *same* facing rather than opposed ones,
 * which `counterpart` cannot express. Composing each dancer independently here is
 * what leaves room for it; `applyCallToPair` is where the work will be.
 */
export function danceSequence(calls: readonly CallName[]): Sequence {
  const first = applyCallToPair("dosado");
  const start: Record<string, Pose> = { a: first.a.entry, b: first.b.entry };

  const steps: SequenceStep[] = [];
  let at: Record<string, Pose> = { ...start };
  let beat = 0;

  for (const call of calls) {
    const chain = CALLS[call].chain;
    const motions: Record<string, Motion> = {};
    for (const key of PAIR_KEYS) {
      const from = at[key];
      /* v8 ignore next -- `at` is seeded with both keys and only ever rewritten wholesale */
      if (from === undefined) continue;
      motions[key] = compose(chain, from);
    }
    const beats = Math.max(0, ...Object.values(motions).map((m) => m.beats));
    steps.push({ call, startBeat: round(beat), beats: round(beats), motions });
    beat += beats;
    at = Object.fromEntries(Object.entries(motions).map(([k, m]) => [k, m.exit]));
  }

  return {
    calls,
    steps,
    beats: round(beat),
    start,
    end: at,
  };
}

/**
 * Does this sequence bring the set back to where it started?
 *
 * The definition of a **zero**, which is the unit the CALLERLAB module system is
 * built out of — a get-in reaches a named formation, a zero preserves it, a get-out
 * resolves it. `Dosado` is the starter set's geometric zero and this is the check
 * that says so out loud rather than in a comment.
 */
export function isZero(calls: readonly CallName[]): HomeResolution {
  const seq = danceSequence(calls);
  return resolveHome(seq.start, seq.end);
}

/**
 * Rebuild a couple from where its two dancers finished.
 *
 * The couple keeps its beau and belle: a call that starts and ends as a couple has not
 * reshuffled anybody, it has moved them. Centre is the midpoint of the two exits and
 * facing is the beau's — which is the belle's too, for any call that ends as a couple.
 *
 * 🔴 **This trusts that the call ended as a couple rather than checking it.** Formation
 * *recognition* — looking at two poses and deciding what formation they are in — is S2's
 * job, and inventing half of it here would be exactly the quiet widening planning
 * ADR-0011 asked to be told about. What guards it meanwhile is a test asserting the
 * rebuilt couple's own positions match the exits it was built from, which catches a
 * call that ended in something else.
 *
 * 🔴 **Width is measured, not carried, and it used to be neither** (ADR-0015). This called
 * `partnerUp` without a width, so every rebuilt couple came back at `COUPLE_WIDTH` whatever
 * the pair had actually been standing at — a consumer passing its own width lost it at the
 * first call boundary. Measuring the two exits is the honest answer and it is strictly
 * better than carrying `couple.width` forward: a call that changes the pair's separation
 * says so in the couple it produces, rather than having the old number asserted over it.
 * That is the property which would have caught this.
 */
export function reformCouple(couple: Couple, motions: Record<string, Motion>): Couple {
  const beau = motions[couple.beau]?.exit;
  const belle = motions[couple.belle]?.exit;
  if (beau === undefined || belle === undefined) return couple;
  return partnerUp(
    couple.beau,
    couple.belle,
    { x: (beau.position.x + belle.position.x) / 2, y: (beau.position.y + belle.position.y) / 2 },
    beau.facing,
    Math.hypot(
      belle.position.x - beau.position.x,
      belle.position.y - beau.position.y,
    ),
  );
}

/**
 * Dance a sequence of calls with a couple.
 *
 * The couple counterpart of {@link danceSequence}. Each call is applied to wherever the
 * previous one left the couple, so the two zeros S1 is built around —
 * `partner-trade, partner-trade` and `california-twirl, california-twirl` — are one call
 * to `isCoupleZero` away from being checked instead of asserted.
 */
export function danceCoupleSequence(calls: readonly CallName[], couple: Couple): Sequence {
  const start = coupleSet(couple);
  const steps: SequenceStep[] = [];
  let at = couple;
  let beat = 0;

  for (const call of calls) {
    const motions = applyCallToCouple(call, at);
    const beats = Math.max(0, ...Object.values(motions).map((m) => m.beats));
    steps.push({ call, startBeat: round(beat), beats: round(beats), motions });
    beat += beats;
    at = reformCouple(at, motions);
  }

  return { calls, steps, beats: round(beat), start, end: coupleSet(at) };
}

/** Does this sequence bring the couple back to where it started? */
export function isCoupleZero(calls: readonly CallName[], couple: Couple): HomeResolution {
  const seq = danceCoupleSequence(calls, couple);
  return resolveHome(seq.start, seq.end);
}

/**
 * Flatten a danced sequence into **one motion per dancer** — what the performance
 * stepper wants.
 *
 * `createPerformance` takes a motion each and advances them together, so a sequence of
 * several calls has to become a single continuous path per dancer before it can be
 * watched. This is `compose`'s job one level up: same concatenation, same dropped
 * duplicate waypoint at each join, on the beat axis of the whole sequence rather than
 * of one call.
 *
 * The leading waypoint of every call after the first is dropped, because it repeats the
 * previous call's exit instant. Keeping it would put two waypoints on the same beat and
 * a consumer interpolating between them would divide by a zero-length interval.
 *
 * Momentum is the **last call's**, not the sum: it describes how a dancer is moving at
 * the end, which is what the flow rules ask about a transition. Accumulated rotation
 * across a whole sequence is a different question (F4's), and answering it here would
 * quietly give one field two meanings.
 */
export function flattenSequence(seq: Sequence): Record<string, Motion> {
  const keys = [...new Set(seq.steps.flatMap((s) => Object.keys(s.motions)))];
  const out: Record<string, Motion> = {};

  for (const key of keys) {
    const waypoints: Waypoint[] = [];
    const grips: GripSpan[] = [];
    let entry: Pose | null = null;
    let last: Motion | null = null;

    for (const step of seq.steps) {
      const m = step.motions[key];
      if (m === undefined) continue;
      entry ??= m.entry;
      const offset = step.startBeat;
      const from = waypoints.length === 0 ? 0 : 1;
      for (const w of m.waypoints.slice(from)) {
        waypoints.push({ ...w, beat: round(w.beat + offset) });
      }
      for (const g of m.grips) {
        grips.push({ ...g, from: round(g.from + offset), to: round(g.to + offset) });
      }
      last = m;
    }

    /* v8 ignore next -- `keys` comes from the steps, so at least one motion exists */
    if (entry === null || last === null) continue;
    out[key] = {
      beats: seq.beats,
      waypoints,
      grips,
      entry,
      exit: last.exit,
      momentum: last.momentum,
    };
  }
  return out;
}
