# `step-pivot`

Step to one side while turning on the spot.

The belle's half of a [Partner Trade](../calls/partner-trade.md) and of a
[California Twirl](../calls/california-twirl.md), and the catalog's first block whose travel is
lateral **on purpose**. Introduced by
[ADR-0014](../../adr/0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md).

## Parameters

| Parameter | Values | Meaning |
|---|---|---|
| `side` | `left` / `right` | Which way the dancer steps — their **own** left or right |
| `distance` | any non-negative number | How far they step. `0` is a pivot on the spot |
| `turn` | `left` / `right` | Which way they turn. **`left` is CCW**, matching [`orbit`](orbit.md) and [`arm-turn`](arm-turn.md) |
| `fraction` | quarter multiples — `0.25`, `0.5`, `0.75`, `1`, … | How much of a turn |
| `hold` | a hand and a grip style, default **absent** | A hand joined for the whole step. Absent is a Partner Trade's belle, who lets go; present is a California Twirl's, whose step across **is** the duck under the arch ([ADR-0017](../../adr/0017-a-california-twirl-is-a-partner-trade-holding-on.md)) |

## Why this is not `slide`

[`slide`](slide.md) is "sidestep laterally **without turning**", one beat, one fixed distance.
All three of those are wrong here, and the third is a trap this catalog has already fallen into:
a `distance` parameter was added to `slide` for Partner Trade on 2026-08-15 and removed the next
day by [ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md), because charging a flat
beat for a sixth of a Dosado's crossing made the step crawl. `slide`'s own spec left the standing
instruction: *if the Dodge family needs partial slides, design the parameter **and its timing**
together.*

Giving `slide` a distance and a rotation would also make "sidestep laterally without turning"
false of the block called `slide`.

## Timed by the rotation, not by the distance

`BEATS_PER_TURN` is **8**, the same rate [`orbit`](orbit.md) and [`arm-turn`](arm-turn.md) use.
A half turn is 4 beats — a Partner Trade entire.

The distance rides inside that budget the way ADR-0013's lane rides inside an arc, and costs
nothing. A wider couple's belle covers more ground in the same beats, which is what stepping
across a wider couple *is*.

## Lateral travel is not sway, when the dancer is turning

The Trade's render watch (2026-08-16) produced the invariant *every step has a forward
component*, because two beats of pure lateral translation **with the facing constant** read on
screen as a standing couple swaying.

The cure was right and it named the wrong cause. What makes sway read as sway is the **absence
of turning**, not the presence of sideways travel. Here the dancer rotates through the whole
step, so by its middle the direction they are travelling *is* their forward. ADR-0014 restates
the invariant accordingly: *a step with no forward component comes with a turn.*

## Frame

The catalog's ordinary block-local frame — as [`pass`](pass.md) and [`slide`](slide.md) use, and
unlike `orbit` — the dancer enters at the origin facing `+y`.

`side` is the dancer's **own** left or right, so a dancer facing `+y` stepping `left` moves
toward `−x`.

Position is **linear** in the beat and facing turns at a steady rate, so the midpoint of the step
is the midpoint of the travel and of the turn at once. A Partner Trade's right-shoulder pass is
asserted against that coincidence, and easing either one would move the pass off the middle of
the call for no reason the sources describe.

## Flow

| Field | Value |
|---|---|
| Hands | **None**, unless `hold` names one — the belle's Trade releases the handhold and takes nothing, which is the F2 fact that lets a Trade flow into anything |
| Last hand used | `none`, or `hold`'s hand: what finished engaged |
| Rotation (F4) | `fraction × ±360°`, signed by `turn` — left positive |
| Body-flow vector | Along the **final facing**, not the lateral vector `slide` reports: by the exit the step is no longer lateral, because the dancer has turned into the way they are going |
| Roll | Available — the pivot gives a definite rotation direction |

## The hold changes nothing here

`hold` emits one grip span covering the block and sets `lastHand`. It moves no waypoint, which is
the claim ADR-0017 rests on: a California Twirl's belle walks a Partner Trade's step. So there is
no worked example with a hold in it — the tables below **are** the held step's tables.

## The marks match `orbit`'s, at 7.5°

This dancer's path needs no refining — `step-pivot` moves her linearly in the beat, so a chord
between her marks *is* her path at any spacing. She is sampled at a forty-eighth of a turn anyway,
to stay **beat-aligned with `orbit`** (ADR-0022): the instrument that asks how close a couple came
pairs the two dancers **by beat**, so marks the two halves do not share are marks that measurement
cannot see. Her facing is the part that gains resolution.

## Worked examples

**The `Facing` column carries only cardinals.** The loader reads `+x`/`+y`/`−x`/`−y` and silently
ignores anything else (`SpecRow.facing`), and a silently ignored fixture is what this repo treats
as worse than no fixture. A half turn sampled every eighth passes through 135° and 225°, so those
two rows are omitted rather than written as numbers the loader cannot check. They are covered in
`test/step-pivot.test.ts` by the stronger claim that the turn is **steady** — equal increments
between every consecutive pair of samples — which pins the intermediates without naming them.

A belle stepping half a unit to her left, across a couple half a unit wide.

`step-pivot(left, 0.5, left, 0.5)` — 4 beats:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | 0 | 0 | +y | on her standing spot, facing the way the couple faces |
| 2 | −0.25 | 0 | −x | halfway across and a quarter turned — facing the way she is travelling |
| 4 | −0.5 | 0 | −y | on the beau's spot, reversed, having gone nowhere forward |

`y` is **exactly** zero at every sample, and that is the point of the block rather than a
property of this example: she steps along the couple's own axis, and there is nothing in the
figure to put a forward component in it.

The degenerate case, a pivot on the spot.

`step-pivot(right, 0, right, 0.5)` — 4 beats:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | 0 | 0 | +y | standing |
| 2 | 0 | 0 | +x | a quarter turned CW |
| 4 | 0 | 0 | −y | reversed, having not moved |

`distance: 0` is legal and `distance < 0` is not: direction is `side`'s job, and a block with two
ways to say "left" is a block that can be told to go both ways at once.
