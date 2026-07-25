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

## Waypoint-table convention (load-bearing — [ADR-0009](../../adr/0009-spec-markdown-is-the-conformance-fixture.md))

The worked examples in these specs are the engine's **conformance fixtures**: the
test suite parses them and asserts the implementation reproduces them exactly. So
the format is not cosmetic. Every waypoint table must be preceded by a signature
line of exactly this shape:

```
`blockname(arg, arg, …)` — N beats[; any extra notes]:
```

followed by a blank line and a table whose header is `| Beat | x | y | Doing |`,
or `| Beat | x | y | Facing | Doing |` where facing varies. The `Doing` column is
free prose and is ignored by the loader.

Remember these files show **worked instantiations, not the whole parameter space**
— the general rule (mirroring, direction negation, fraction truncation) lives in
the prose beneath each table and is implemented in the generator, per
[ADR-0008](../../adr/0008-runtime-data-is-code-and-plain-data-not-spec-markdown.md).
Add a table when it pins down something a rule alone wouldn't.

## Catalog

| Block | Parameters | First used by | Spec |
|---|---|---|---|
| `pass` | direction (forward/backward), shoulder (right/left), exit (lane/centered) | Dosado; Pass Thru | [pass.md](pass.md) |
| `slide` | side (right/left) | Dosado | [slide.md](slide.md) |
| `arm-turn` | hand (right/left), fraction, exit (step-out/hold) | Allemande Left | [arm-turn.md](arm-turn.md) |

Anticipated from the remaining starter calls (specced when their call is):
`pull-by` (hand — R&L Grand, Square Thru), `face-turn` (direction, fraction —
turning in place; Square Thru corners), `arc-walk` (Partner Trade),
`twirl-arch` (California Twirl, Star Thru), `promenade-step`. Townage's
taught gestures (fist bump, arm turn) live in the same model — the game's
building-block arc and this catalog are one system.
