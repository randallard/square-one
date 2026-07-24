# ADR-0001: TypeScript at the provable-lite tier
- Status: Accepted
- Date: 2026-07-24
- Deciders: Ryan

## Context
square-one is the engine library for the square-dance game family: pure logic
(formations, call semantics, choreography paths, FASR state, resolution) consumed by
two TypeScript/browser games (the-lot, hash-n-patter). The language question is
constrained by the consumers: both are TS frontends, and the engine's value is being
importable by them without a bridge.

## Decision
TypeScript, `strict` + `noUncheckedIndexedAccess`, at the **provable-lite** tier: the
entire library is a functional core — no IO anywhere — with `fast-check` property
tests over the model's invariants (path/formation round-trips, collision-freedom,
timing sums, symmetry preservation, zero-module identity; see
[`../spec/call-model.md`](../spec/call-model.md)).

## Alternatives considered
- **Rust core via wasm (provable tier, `kani`)** — stronger guarantees, but adds a
  build/packaging seam between the engine and two TS consumers, and the first
  consumers are browser games where iteration speed matters more than bounded proofs.
- **Both (TS shell, Rust core)** — the template supports it, but there is no shell
  here; the library *is* the core.

## Consequences
- The whole repo is held to core rules: no IO, no `Date.now()`, no randomness without
  an injected seed.
- TS's unsound type system is an accepted trade; rigor comes from the property tests,
  not the compiler.
- **Promotion condition:** if a geometric invariant (e.g. collision-freedom across all
  call/formation combinations) resists confidence via `fast-check` sampling, promote
  the geometry kernel to Rust + `kani` behind the same interface — via a new ADR.
