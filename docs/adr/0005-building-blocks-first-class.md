# ADR-0005: Calls are compositions of first-class building blocks
- Status: Accepted
- Date: 2026-07-24
- Deciders: Ryan

## Context
Two requirements converge on the same structure. The game arc teaches square
dancing by building blocks — an NPC teaches a fist bump, an arm turn, and the
blocks combine into real calls. And Ryan wants players to eventually **build their
own moves** from a catalog of parts, evaluate them (flow, collisions, legality),
and share them. The Dosado spec as first drafted had a monolithic waypoint table
with parts as prose — nothing reusable, nothing composable.

CALLERLAB's own "parts" concept (fraction boundaries for "half of a…"/"finish…")
is coarser than what teaching and composing need, but it's evidence the domain
already thinks in segments.

## Decision
Building blocks are **first-class engine objects**, cataloged in
[`../spec/blocks/`](../spec/blocks/README.md). A block is a parameterized,
pose-to-pose motion fragment (entry contract, waypoint fragment, beats, hands,
momentum delta, exit pose). A call definition's choreography is an **ordered
composition of blocks** (plus, where genuinely irreducible, bespoke fragments —
which are themselves cataloged as blocks). Composition is checkable: each block's
exit pose must satisfy the next block's entry contract.

Custom moves use the identical mechanism: any block chain that passes pose,
collision, and breathing checks is a move, and the flow/variety rules (F1–F7,
V1–V6) evaluate it exactly as they evaluate a standard call.

## Alternatives considered
- **Monolithic per-call waypoint tables** (the first Dosado draft) — rejected:
  every call hand-authored from scratch, parts stay prose, custom moves would need
  a second, parallel representation.
- **Blocks as documentation only** (spec convention, engine still stores flat
  paths) — rejected: the composer and the teach-by-parts arc would both have to
  re-derive structure the spec already knew and the engine threw away.
- **CALLERLAB parts as the unit** — rejected as too coarse (Dosado is one "call"
  with four motion segments); parts remain in the model as *named block
  subsequences* for fractionalization.

## Consequences
- Authoring shifts from per-call paths to per-block paths + per-call composition —
  more upfront design per block, then reuse (Dosado's `pass` block is most of
  Pass Thru already).
- The block catalog is a real public API surface: custom moves, townage teaching,
  and hash-n-patter drills all consume it. Changes to a block ripple into every
  call composed from it — block specs need the same rigor as call specs.
- Blocks, moves, and sequences must serialize as versioned plain data
  (ADR-0002 already requires JSON-serializable types) so custom moves can be
  shared as files first and via any future service without redesign.
- Not every call will decompose elegantly; the bespoke-fragment escape hatch is
  deliberate, and a block used once is still a catalog entry someone's custom
  move can reuse.
