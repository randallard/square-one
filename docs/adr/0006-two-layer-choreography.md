# ADR-0006: Two-layer choreography — ideal paths, pursued by simulated dancers
- Status: Accepted
- Date: 2026-07-24
- Deciders: Ryan

## Context
The re-centering question (does Pass Thru's momentary lane offset resolve inside a
block, a micro-block, or a formation snap?) exposed a conflation: the *canonical*
choreography and the *danced* choreography are different things. Ryan's
requirements make the difference load-bearing: squares migrate across the floor;
dancers head for formation spots but round the corner into the next call when it
arrives early; dancers differ in speed and rhythm; some squares fall apart, some
keep up, some ride the brink because enough dancers cut corners — and that tension
is part of what makes square dancing fun. A single-layer model can't represent
"didn't quite get there."

## Decision
Choreography is **two layers**:

1. **Ideal layer** — block compositions (ADR-0005) defining canonical paths whose
   exits land on formation targets. Fully explicit: every unit of ideal motion
   belongs to a block (this settles re-centering — e.g. `pass` gains an
   `exit: lane | centered` parameter; no snap, no zero-beat blocks). Legality,
   equivalence, zeros, flow/variety rules, and proofs are defined here.
2. **Performance layer** — dancer agents **pursue** the ideal timeline rather than
   execute it: steering toward moving targets, switching target streams when the
   next call is delivered (corner-rounding is emergent, not coded). Agents carry
   configurable, seeded, **individually toggleable** coefficients (speed, rhythm,
   reaction, corner-cutting, per-move and general skill, helping with
   Dunning-Kruger confidence, and later demeanor — cataloged in
   [`../spec/performance-model.md`](../spec/performance-model.md)).

Formation targets live in the **square's own frame, continuously re-fit from where
the dancers actually are** — so error accumulates as whole-square drift
(migration) instead of being corrected toward absolute floor coordinates.

The layers are pinned together by the anchor invariant: **all coefficients
off/zero ⇒ the performance layer reproduces the ideal paths exactly.**

## Alternatives considered
- **Single ideal layer with formation snap** — rejected: snap is motion belonging
  to no block, hides broken custom moves inside its tolerance, and cannot
  represent migration, lag, or breakdown at all.
- **Baking variance into the paths** (noisy waypoints) — rejected: destroys the
  provable layer and makes equivalence/zero classification meaningless.
- **Performance simulation in the consumers** (townage/hash-n-patter each animate
  their own imperfection) — rejected: both games need identical lag/breakdown
  semantics (a drill score and an NPC square must agree on what "kept up" means),
  and the simulation is pure computation — exactly what square-one is for.

## Consequences
- The simulation stays deterministic under an injected seed (ADR-0001), so
  emergent phenomena are property-testable, starting with the anchor invariant.
- Flow quality becomes *felt*: F-rule violations cost pursuit beats, so bad-flow
  sequences measurably lag and break squares — the static score predicts what the
  simulation demonstrates.
- Caller timing (command/lead/execution, stacking) becomes simulate-able against
  square survival — a direct hash-n-patter drill mechanic.
- The engine takes on a real second subsystem (agents, pursuit, metrics) — scoped
  to *after* core types and the starter calls; the spec leads the code.
- Games own progression: which coefficients are enabled is a consumer-side choice
  (levels/badges gating lives in the games and the planning effort, not here).
