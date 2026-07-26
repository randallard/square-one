/**
 * The performance stepper — square-one's primary interface (ADR-0007).
 *
 * The engine does not hand consumers a finished animation. It hands them a
 * simulation they advance, in which any dancer may be **externally driven**: the
 * player's position and facing are read as input each tick rather than simulated.
 * That is what makes a player inside a square possible at all — square-frame
 * re-fitting, corner-rounding and helping all react to where dancers actually are,
 * which cannot be precomputed against input that has not happened yet.
 *
 * Ideal path data (ADR-0004's shape) is **derived**: it is this stepper with every
 * coefficient off and nobody externally driven. One implementation degenerating
 * correctly, not two kept in agreement.
 *
 * Purity (ADR-0002): no clock reads, no randomness without an injected seed. The
 * consumer owns the clock and passes `dt`.
 */

import { deltaDeg, normaliseDeg, round } from "./geometry.js";
import type { Degrees, Motion, Vec2, Waypoint } from "./types.js";

export type DancerKey = string;

/**
 * The performance dials (ADR-0006). Every one is independently toggleable and the
 * anchor invariant is that all-off reproduces the ideal paths exactly.
 *
 * v1 ships the dials off. The pursuit mechanics behind them land with M4, once a
 * renderer exists to show what they do — the same reason the call specs paused.
 */
export interface Coefficients {
  /** Stride as a fraction of nominal. */
  readonly stepLength: number;
  /** Phase error against the beat. */
  readonly rhythmOffset: number;
  /** Beats between call delivery and starting to move. */
  readonly reactionLatency: number;
  /** Lookahead: how early a dancer curves toward the next target. */
  readonly cornerCutting: number;
  /** Baseline execution quality. */
  readonly generalSkill: number;
}

/** All dials off. This is the configuration under which the stepper *is* the
 *  ideal-path emitter, and the property tests pin that. */
export const IDEAL: Coefficients = {
  stepLength: 0,
  rhythmOffset: 0,
  reactionLatency: 0,
  cornerCutting: 0,
  generalSkill: 0,
};

export interface DancerState {
  readonly key: DancerKey;
  readonly position: Vec2;
  readonly facing: Degrees;
  /** How far behind the ideal timeline this dancer is running, in beats. Always 0
   *  while the dials are off. */
  readonly lag: number;
  /** True when the consumer is supplying this dancer's pose rather than the engine. */
  readonly externallyDriven: boolean;
}

/** What the consumer supplies for externally-driven dancers each tick. */
export interface DriveInput {
  readonly position: Vec2;
  readonly facing: Degrees;
}

export interface PerformanceInit {
  /** The ideal motion each dancer is pursuing, keyed however the consumer likes. */
  readonly motions: Readonly<Record<DancerKey, Motion>>;
  readonly seed?: number;
  readonly coefficients?: Partial<Coefficients>;
  readonly externallyDriven?: readonly DancerKey[];
}

export interface Performance {
  /** Current position on the beat axis. */
  readonly beat: number;
  /** Beats in the longest motion — when the performance is over. */
  readonly totalBeats: number;
  readonly done: boolean;
  /** Advance by `dBeats` and return every dancer's state. Externally-driven
   *  dancers take their pose from `inputs`; the rest are simulated. */
  tick(dBeats: number, inputs?: Readonly<Record<DancerKey, DriveInput>>): DancerState[];
  /** Sample without advancing. */
  sample(): DancerState[];
}

/**
 * Interpolate a motion at an arbitrary beat.
 *
 * Facing interpolates along the **shortest arc** between consecutive waypoints,
 * which is unambiguous because the generators never place marks more than a
 * quarter turn apart. Accumulated rotation is tracked separately and stays signed
 * (see `Momentum.rotation`); this is only for display pose.
 */
export function sampleMotion(motion: Motion, beat: number): { position: Vec2; facing: Degrees } {
  const wps = motion.waypoints;
  const first = wps[0];
  if (first === undefined) return { position: { x: 0, y: 0 }, facing: 0 };

  if (beat <= first.beat) {
    return { position: { x: first.x, y: first.y }, facing: first.facing };
  }

  const last = wps[wps.length - 1];
  /* v8 ignore next -- wps is non-empty, so last is defined */
  if (last === undefined) return { position: { x: first.x, y: first.y }, facing: first.facing };
  if (beat >= last.beat) {
    return { position: { x: last.x, y: last.y }, facing: last.facing };
  }

  let lo: Waypoint = first;
  for (const w of wps) {
    if (w.beat <= beat) lo = w;
    else {
      const span = w.beat - lo.beat;
      const t = span === 0 ? 0 : (beat - lo.beat) / span;
      return {
        position: {
          x: round(lo.x + (w.x - lo.x) * t),
          y: round(lo.y + (w.y - lo.y) * t),
        },
        facing: round(normaliseDeg(lo.facing + deltaDeg(lo.facing, w.facing) * t)),
      };
    }
  }
  /* v8 ignore next 2 -- the loop always returns for an in-range beat */
  return { position: { x: last.x, y: last.y }, facing: last.facing };
}

export function createPerformance(init: PerformanceInit): Performance {
  const coefficients: Coefficients = { ...IDEAL, ...init.coefficients };
  const driven = new Set(init.externallyDriven ?? []);
  const keys = Object.keys(init.motions);
  const totalBeats = keys.reduce((m, k) => Math.max(m, init.motions[k]?.beats ?? 0), 0);

  // Present but unused while every dial is off — the pursuit model reads them.
  void coefficients;
  void init.seed;

  let beat = 0;
  let lastInputs: Readonly<Record<DancerKey, DriveInput>> = {};

  const stateOf = (): DancerState[] =>
    keys.map((key): DancerState => {
      const isDriven = driven.has(key);
      const input = lastInputs[key];

      if (isDriven && input !== undefined) {
        return {
          key,
          position: input.position,
          facing: input.facing,
          lag: 0,
          externallyDriven: true,
        };
      }

      const motion = init.motions[key];
      /* v8 ignore next -- keys come from the same record */
      if (motion === undefined) {
        return { key, position: { x: 0, y: 0 }, facing: 0, lag: 0, externallyDriven: isDriven };
      }

      const s = sampleMotion(motion, beat);
      return {
        key,
        position: s.position,
        facing: s.facing,
        // With the dials off a dancer is never behind: they are the ideal.
        lag: 0,
        externallyDriven: isDriven,
      };
    });

  return {
    get beat() {
      return beat;
    },
    get totalBeats() {
      return totalBeats;
    },
    get done() {
      return beat >= totalBeats;
    },
    tick(dBeats, inputs) {
      beat = round(beat + dBeats);
      if (inputs !== undefined) lastInputs = inputs;
      return stateOf();
    },
    sample: stateOf,
  };
}

/**
 * The ADR-0004 artifact: per-dancer waypoints with beat timing, derived from the
 * stepper's degenerate case.
 *
 * This is what NPC-only scenes, cutscenes and hash-n-patter's drills consume, and
 * what the published test vectors are written against.
 */
export function idealPaths(
  motions: Readonly<Record<DancerKey, Motion>>,
): Record<DancerKey, readonly Waypoint[]> {
  const out: Record<DancerKey, readonly Waypoint[]> = {};
  for (const [key, motion] of Object.entries(motions)) {
    out[key] = motion.waypoints;
  }
  return out;
}
