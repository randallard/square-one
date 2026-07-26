# Block: `pass`

_Status: draft (2026-07-24). First used by [Dosado](../calls/dosado.md)._

Move past a counterpart dancer without turning — the atom of Dosado, Pass Thru,
and every "pass right/left shoulders" action.

## Parameters

| Parameter | Values | Effect |
|---|---|---|
| `direction` | `forward` / `backward` | Walk facing-forward, or back up |
| `shoulder` | `right` / `left` | Which shoulders pass — sets the lane: right-shoulder pass shifts each dancer to their **own left** lane (and vice versa) |
| `exit` | `lane` / `centered` | `lane` ends in the offset lane (a lateral block follows — Dosado); `centered` traces a shallow S back onto the center line, ending on the counterpart's former spot (the call is over — Pass Thru). Per ADR-0006 these are *ideal* paths; simulated dancers cut the S-curve's corner exactly as much as their coefficients allow |

## Entry contract

A counterpart dancer ahead (for `forward`; behind for `backward`) in the opposing
lane or directly opposite at ~1 unit, facing opposite to this dancer.

## Waypoint fragment (local frame: dancer at origin facing `+y`)

`pass(forward, right, lane)` — 2 beats:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | 0.00 | entry |
| 1 | −0.15 | +0.40 | shifted to own-left lane, advancing |
| 2 | −0.15 | +0.80 | shoulders passed; alongside/past the counterpart |

`pass(forward, right, centered)` — 2 beats:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | 0.00 | entry |
| 1 | −0.15 | +0.50 | lane offset at the shoulder-pass moment |
| 2 | 0.00 | +1.00 | S-curve back to center; on the counterpart's former spot, back-to-back |

- `shoulder: left` mirrors x.
- **`direction: backward` is a full time-reversal of the forward pass, not just a
  negated y-progression** (clarified 2026-07-25). Forward, you veer into the lane on
  the first beat and hold it. Reversed, you travel straight and the veer lands on the
  closing beat — the same path walked the other way. The shoulders are still named
  for the pair that brushes, so the lane sign is unaffected.

  This distinction is invisible at the endpoints: the exit pose is identical either
  way. It only shows up **mid-block**, which is why the first implementation got it
  wrong and why [Dosado](../calls/dosado.md)'s beat-4 waypoint is the thing that
  caught it. Any future block with an asymmetric schedule needs the same care.
- Facing constant throughout — **momentum delta: rotation 0**; exit flow vector is
  straight ahead (or straight back).
- Hands: none.

## Exit pose

`lane`: 0.8 units along the travel direction, offset 0.15 into the lane, facing
unchanged; counterpart symmetric on the other lane.
`centered`: 1.0 units along the travel direction on the center line — the
counterpart's former spot — facing unchanged, back-to-back with them.

## Flow notes

F3–F5 neutral (no rotation, no sharp turn). Lane discipline is the collision
property: two dancers `pass`-ing with the same `shoulder` value are provably on
opposite lanes.
