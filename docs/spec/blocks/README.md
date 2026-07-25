# Building blocks — the catalog

_Status: draft (2026-07-24), stood up with [ADR-0005](../../adr/0005-building-blocks-first-class.md).
Blocks are the parts moves are made of — and the parts custom moves will be built
from. One file per block, `blocks/<name>.md`._

## What a block is

A **block** is the smallest named unit of dance motion, defined by:

| Field | Meaning |
|---|---|
| **Entry contract** | The relative pose required to start it (e.g. "a facing dancer at 1 unit", "adjacent lane, back-to-back") — checkable against the previous block's exit |
| **Parameters** | The knobs: shoulder (right/left), direction (forward/backward), lateral side, hand, fraction. A mirror transform flips all sided parameters and negates `x` |
| **Waypoint fragment** | Path in the block-local frame (dancer starts at origin, facing `+y`), per the frame conventions in [calls/dosado.md](../calls/dosado.md) |
| **Beats** | Nominal duration (composition sums; a call's chart timing governs and may compress) |
| **Hands** | Engagement during the block (none, right, left, both, grip) |
| **Momentum delta** | Facing-rotation contribution (signed), exit flow vector — what the Layer-1 roll/sweep/flow state accumulates |
| **Exit pose** | Where the dancer ends, relative to entry — the next block's input |

## Composition rules

1. **Chaining:** block *k*'s exit pose must satisfy block *k+1*'s entry contract.
   This is machine-checkable and is the first validity gate for custom moves.
2. **Transforms:** mirror (left-handed variants come free — Left Dosado is the
   mirror of Dosado's chain); rotation/translation to embed the local frame into
   the square via the formation.
3. **Parts:** a call's CALLERLAB parts (fractionalization boundaries) are *named
   subsequences* of its block chain — "once and a half" replays a subsequence.
4. **Custom moves:** any block chain passing chaining + collision + breathing
   checks is a move; the flow/variety rules
   ([flow-and-variety.md](../flow-and-variety.md)) evaluate it like any call.
   Serialization is versioned plain data (blocks referenced by name + params), so
   custom moves are shareable as files from day one.

## Catalog

| Block | Parameters | First used by | Spec |
|---|---|---|---|
| `pass` | direction (forward/backward), shoulder (right/left), exit (lane/centered) | Dosado; Pass Thru | [pass.md](pass.md) |
| `slide` | side (right/left) | Dosado | [slide.md](slide.md) |

Anticipated from the remaining starter calls (specced when their call is):
`arm-turn` (hand, fraction — Allemande Left), `pull-by` (hand — R&L Grand, Square
Thru), `face-turn` (direction, fraction — turning in place; Square Thru corners,
California Twirl halves), `courtesy-turn-half`, `promenade-step`. Townage's
taught gestures (fist bump, arm turn) live in the same model — the game's
building-block arc and this catalog are one system.
