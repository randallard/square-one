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
| `clearance` | a distance, default `0.30` | How much room the two dancers need to pass — **a body measurement** (ADR-0020). They split it: each steps half of it into their own lane, so a clearance of `c` leaves them `c` apart at the pass. Below `PASS_CLEARANCE` (`2 × 0.15`, the gap the figure is drawn with) it is ignored — bodies widen a figure and never narrow it (ADR-0021). Costs no beats: the stride lengthens inside the chart's timing |

## How far is "past"? (ADR-0023)

🔴 **`lane` and `close` used to walk a flat `0.80`, and that is more than twice as far past the
counterpart as a body needs.** Measured on townage's cast, at the back-to-back beat of a Dosado:
the pair were **1.562 world units** past each other, against the **0.710** their heads and torsos
take to clear. Ryan, watching it: *"dosado pass by too far though — should watch body / head size
and pass by just enough to clear."*

The travel is now derived rather than fixed:

| exit | walks | why |
|---|---|---|
| `centered` | the whole `separation` (1.00) | a Pass Thru finishes on the counterpart's spot — that is what the call *is*, and no body changes it |
| `lane`, `close` | `(separation + clearance) / 2` — **0.65** at the defaults | far enough that the two are exactly `clearance` past each other, which is where a Dosado is back to back |

Why that is the right moment and not a taste: during the `slide` that follows, the two dancers
**swap lanes** — each crosses the other's `x` — so nothing lateral is holding them apart and the
whole separation is the gap they walked out. It has to be the clearance, and it need not be more.

## The lane is where a body arrives

Every table below is the **body-agnostic** instantiation, at the `0.15` half-lane this block has
always been drawn with. A pair who need more room get the same tables with every `x` scaled by
`clearance / 0.30` — the shape is identical and the beats are unchanged, which is why no fixture
here moved when the parameter arrived.

## Entry contract

A counterpart dancer ahead (for `forward`; behind for `backward`) in the opposing
lane or directly opposite at ~1 unit, facing opposite to this dancer.

## Waypoint fragment (local frame: dancer at origin facing `+y`)

`pass(forward, right, lane)` — 2 beats:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | 0.00 | entry |
| 1 | −0.15 | +0.325 | shifted to own-left lane, advancing |
| 2 | −0.15 | +0.65 | shoulders passed; **`clearance` past** the counterpart, back to back |

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
| 1 | 0.00 | −0.325 | backing straight, left shoulders pass |
| 2 | 0.00 | −0.65 | backed past; still in the lane |

`pass(backward, left, close)` — 3 beats:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | 0.00 | entry — already in the return lane |
| 1 | 0.00 | −0.1625 | backing straight (backing steps are smaller — half the walking pace) |
| 2 | 0.00 | −0.325 | left shoulders pass |
| 3 | −0.15 | −0.65 | closing diagonal onto the line one lane left — the opening veer, mirrored |

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

## A centred pass, solved for its closest moment — 2026-10-28

A `centered` pass is a V: the lane opens straight to the crossing and closes straight after it,
while the two dancers close the separation between them. Between those straight lines the
closest they get is not the gap at the crossing but `G·s / √(G² + s²)`, reached **on the way in**.
townage's `solve-all` found it: ember ×4's Pass Thru head to head at t = 0.3, 10.4 cm, with the
gap at the crossing exactly the clearance asked for. The test that pinned "exactly the
clearance" measured at the waypoints only, where the crossing is.

So when a body asks for more than the figure's own clearance, the gap at the crossing is
`centeredGap(c, s) = c·s / √(s² − c²)`, and the pair's **closest** moment is `c`. Below that the
figure is as drawn (ADR-0021). That figure, at `PASS_CLEARANCE`, dips to 0.287 at its closest,
and the table above is unchanged. `pull-by` solves the same question for its `sin²` lane
(`gapAtCrossing`), and the Trade's bow did first (`laneForClearance`).
