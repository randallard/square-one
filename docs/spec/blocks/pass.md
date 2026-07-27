# Block: `pass`

_Status: draft (2026-07-24). First used by [Dosado](../calls/dosado.md)._

Move past a counterpart dancer without turning — the atom of Dosado, Pass Thru,
and every "pass right/left shoulders" action.

## Parameters

| Parameter | Values | Effect |
|---|---|---|
| `direction` | `forward` / `backward` | Walk facing-forward, or back up |
| `shoulder` | `right` / `left` | Which shoulders pass — sets the lane: right-shoulder pass shifts each dancer to their **own left** lane (and vice versa) |
| `exit` | `lane` / `centered` / `close` | `lane` ends in the offset lane (a lateral block follows — Dosado's outbound); `centered` traces a shallow S back onto the center line, ending on the counterpart's former spot (the call is over — Pass Thru); `close` finishes a figure: travel the line, then blend diagonally one lane toward the brushing shoulder on the final beat (Dosado's return — the definition's "slide slightly" walked as part of the smooth path). `close` takes **3 beats**; the others 2. Per ADR-0006 these are *ideal* paths; simulated dancers cut corners exactly as much as their coefficients allow |

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

`pass(backward, left, lane)` — 2 beats:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | 0.00 | entry — already in the return lane |
| 1 | 0.00 | −0.40 | backing straight, left shoulders pass |
| 2 | 0.00 | −0.80 | backed past; still in the lane |

`pass(backward, left, close)` — 3 beats:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | 0.00 | entry — already in the return lane |
| 1 | 0.00 | −0.20 | backing straight (backing steps are smaller — half the walking pace) |
| 2 | 0.00 | −0.40 | left shoulders pass |
| 3 | −0.15 | −0.80 | closing diagonal onto the line one lane left — the opening veer, mirrored |

- `shoulder: left` mirrors x (for schedules that move laterally).
- **`direction: backward` with `exit: lane` holds its lane and travels dead
  straight** (corrected 2026-07-26, render-validated). The veer into the lane is
  *not* this block's job: per the entry contract the dancer is already laterally
  clear of the counterpart — in Dosado, the preceding `slide` put them there. The
  `shoulder` parameter still names the pair that brushes; the lane itself was
  chosen by whatever moved the dancer off the centre line.

  Two earlier models both failed here, which is why this paragraph is explicit.
  *Negated y-progression* (the first implementation) veered on the wrong beat.
  *Time-reversal of the forward pass* (the 2026-07-25 "clarification") was
  subtler: reversing a path from an entry that is already displaced re-applies
  the veer **outward**, bulging the dancer to twice the lane offset on the
  closing beat. Both errors are invisible in the endpoint maths; the second was
  also invisible in Dosado's waypoint table, which skipped beat 5. It took the
  first human render watch (townage `#dance`, 2026-07-26) to catch it —
  dancers backing diagonally *away* from home, then leaping two lanes sideways.
  Any future block with an asymmetric schedule needs a table row for **every**
  beat and a render check before the geometry is trusted.
- Facing constant throughout — **momentum delta: rotation 0**; exit flow vector is
  straight ahead (or straight back).
- Hands: none.

## Exit pose

`lane`, forward: 0.8 units along the travel direction, offset 0.15 into the lane,
facing unchanged; counterpart symmetric on the other lane.
`lane`, backward: 0.8 units straight back in the lane the dancer entered on,
facing unchanged — one lane off the centre line, where the next block takes over.
`close`: 0.8 units along the travel direction, ended one lane toward the brushing
shoulder (backward: onto the line the figure started from — home). Exit flow is
the closing diagonal's true bearing, effectively at rest for a following call.
(Forward `close` — veer out on the first beat, then a slower straight approach —
is defined for symmetry; no call uses it yet.)
`centered`: 1.0 units along the travel direction on the center line — the
counterpart's former spot — facing unchanged, back-to-back with them.

## Flow notes

F3–F5 neutral (no rotation, no sharp turn). Lane discipline is the collision
property: two dancers `pass`-ing with the same `shoulder` value are provably on
opposite lanes.
