# Progress & Status

_Last updated: 2026-07-24_

## Status / next

**Status:** Bootstrapped, pre-code. Architecture decided and recorded (ADR-0001
TypeScript/provable-lite, ADR-0002 pure library — no storage/UI/IO). The main
intellectual artifact so far is [`spec/call-model.md`](spec/call-model.md) — the
researched four-layer state model (per-dancer state incl. roll/sweep/flow/hands,
square-level FASR, the call definition record, sequence-level evaluation) — **drafted,
awaiting Ryan's review**. No source code yet; `package.json` doesn't exist, so CI's
language jobs self-skip.

**Next:** Ryan finishes reviewing `spec/call-model.md` — the roles question is
**settled** (boy/girl canonical with pluggable labels,
[ADR-0003](adr/0003-roles-boy-girl-with-alternative-labels.md)); still open: Layer-4
scope for v1, not hard-coding 8 dancers, concepts out of scope. Then: accept the model
via an ADR, commit the bootstrap, migrate
`~/Development/mix-a-hoot-n-hollar/docs/moves.md` in as the call-definition spec seed,
and design the core types from the accepted model.

## Architecture

square-one is the engine seam of the square-dance game family planned in
`~/Development/work/square-dance-planning/` (its ADR-0003 set the repo split, ADR-0004
the paths-as-data seam). This repo's own decisions:

- Rigor tier: provable-lite, TypeScript — [ADR-0001](adr/0001-typescript-provable-lite.md)
- Storage: none — pure library; consumers own persistence — [ADR-0002](adr/0002-pure-library-no-storage-no-ui.md)
- Roles: boy/girl canonical, pluggable presentation labels — [ADR-0003](adr/0003-roles-boy-girl-with-alternative-labels.md)

## Provability

Nothing verified yet — no code. The property-test targets are already named in
[`spec/call-model.md`](spec/call-model.md) (collision-freedom, path/formation
round-trips, timing sums, roll/sweep derivation consistency, symmetry preservation,
zero-module identity, breathing bounds) so the invariants precede the implementation.

## Worklist

1. Review + accept the call/state model (ADR it once accepted).
2. Migrate `mix-a-hoot-n-hollar/docs/moves.md` → call-definition specs under
   `docs/spec/` (extend each call with the Layer-3 fields: paths, roll/sweep, hands,
   parts, standard applications).
3. Core types: dancer, formation, FASR, call record — two-couple-safe (don't
   hard-code 8 dancers).
4. Formation recognition + call application for the first handful of Basic calls.
5. Property-test harness (`fast-check`) over the named invariants.

Deferred with reasons: multiplayer/sync concerns (belongs to the games, not the
engine); higher-level concepts (As Couples, Tandem — arc doesn't need them yet).

## Open questions

- **Distribution**: how the-lot and hash-n-patter consume square-one — published npm
  package, git dependency, or pnpm workspace. Deliberately undecided until
  hash-n-patter exists; a git dependency is the likely v1.
- The four model questions listed at the end of [`spec/call-model.md`](spec/call-model.md).
- Whether `docs/spec/` call files or generated JSON become the runtime call data
  (spec-as-source vs spec-as-documentation).

---

_History accretes below, oldest first. See [`journal/`](journal/README.md) for the narrative
and [`reviews/`](reviews/README.md) for stance reviews._

- **2026-07-24** — Repo created from template; bootstrap + call-model research. See
  [`journal/2026-07-24-bootstrap-and-call-model.md`](journal/2026-07-24-bootstrap-and-call-model.md).
- **2026-07-24** — Roles decision: boy/girl canonical with pluggable labels
  (ADR-0003). See [`journal/2026-07-24-roles-decision-1.md`](journal/2026-07-24-roles-decision-1.md).
