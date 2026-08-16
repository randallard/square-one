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
- A briefly-considered `span: half` variant (2026-07-26, for Dosado's closing
  step) was removed the same day: CALLERLAB's dance action blends the closing
  lateral into the backing ("walking a smooth circular path … slide slightly"),
  which is [`pass`](pass.md)'s `close` exit, not a discrete sidestep. If the
  Dodge family later needs partial slides, design the parameter then.
- 🔴 **It came back anyway, as `distance`, and was removed again on 2026-08-16.**
  Partner Trade added it on 2026-08-15 to sidestep a half lane onto its passing
  lane — the same idea as `span: half`, under a different name, in a call whose
  source says *walk forward* just as plainly as Dosado's does. The precedent was
  in this file and nobody read it. Removed by
  [ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md), which puts
  the Trade's lane inside its arc instead.

  The extra lesson, and the reason "design the parameter then" is not enough on
  its own: `distance` arrived without touching **`BEATS`**, which is flat. A
  half-lane slide therefore took the same beat as a full lane change and moved at
  a sixth the speed. **Design a distance parameter and its timing together, or
  not at all.**
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
