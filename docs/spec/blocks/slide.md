# Block: `slide`

_Status: draft (2026-07-24). First used by [Dosado](../calls/dosado.md)._

Sidestep laterally without turning — the lane-change atom (Dosado's crossing
steps; later: Dodge-family calls, adjustments).

## Parameters

| Parameter | Values | Effect |
|---|---|---|
| `side` | `right` / `left` | Sidestep toward the dancer's own right or left |

## Entry contract

Clear lateral space on the named side (no dancer occupying the destination lane
at the crossing moment — a timing/collision check, not a formation requirement).

## Waypoint fragment (local frame: dancer at origin facing `+y`)

`slide(right)` — 1 beat:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | 0.00 | entry |
| 1 | +0.30 | 0.00 | lane changed (2 × 0.15 lane offset) |

- `side: left` mirrors x.
- Facing constant — **momentum delta: rotation 0**; exit flow vector is lateral
  (which arms the F6 lateral-motion rule: the next block must not move this
  dancer against that lateral direction).
- Hands: none.

## Exit pose

0.30 units to the named side, same depth, facing unchanged.

## Flow notes

The lateral exit vector is exactly the condition F6 watches
([flow-and-variety.md](../flow-and-variety.md)): a composition following
`slide(right)` with leftward motion is a flow defect the checker can catch
statically — first concrete example of block-level flow analysis.
