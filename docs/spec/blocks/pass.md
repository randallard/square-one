# Block: `pass`

_Status: draft (2026-07-24). First used by [Dosado](../calls/dosado.md)._

Move past a counterpart dancer without turning — the atom of Dosado, Pass Thru,
and every "pass right/left shoulders" action.

## Parameters

| Parameter | Values | Effect |
|---|---|---|
| `direction` | `forward` / `backward` | Walk facing-forward, or back up |
| `shoulder` | `right` / `left` | Which shoulders pass — sets the lane: right-shoulder pass shifts each dancer to their **own left** lane (and vice versa) |

## Entry contract

A counterpart dancer ahead (for `forward`; behind for `backward`) in the opposing
lane or directly opposite at ~1 unit, facing opposite to this dancer.

## Waypoint fragment (local frame: dancer at origin facing `+y`)

`pass(forward, right)` — 2 beats:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | 0.00 | entry |
| 1 | −0.15 | +0.40 | shifted to own-left lane, advancing |
| 2 | −0.15 | +0.80 | shoulders passed; alongside/past the counterpart |

- `shoulder: left` mirrors x. `direction: backward` negates the y-progression
  (back up along the lane; shoulders named for the pair that brushes).
- Facing constant throughout — **momentum delta: rotation 0**; exit flow vector is
  straight ahead (or straight back) along the lane.
- Hands: none.

## Exit pose

0.8 units along the travel direction, offset 0.15 into the lane, facing unchanged;
counterpart symmetric on the other lane. Callers of the block (call compositions)
end it early or extend it via beat scaling — e.g. Pass Thru is essentially
`pass(forward, right)` run to a back-to-back finish at the counterpart's former
depth, 2 beats.

## Flow notes

F3–F5 neutral (no rotation, no sharp turn). Lane discipline is the collision
property: two dancers `pass`-ing with the same `shoulder` value are provably on
opposite lanes.
