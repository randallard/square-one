# `orbit`

Walk forward around a shared centre, hands free.

The catalog's second rotating block and the first that rotates without engaging a hand.
Introduced for the Trade family (planning ADR-0011's S1); the Circle and Promenade families
are the same figure at other radii.

## Parameters

| Parameter | Values | Meaning |
|---|---|---|
| `turn` | `left` / `right` | Which way round. **`left` is CCW**, matching [`arm-turn`](arm-turn.md) |
| `fraction` | quarter multiples — `0.25`, `0.5`, `0.75`, `1`, … | How much of the circle |
| `radius` | any positive number | Distance from the shared centre at the arc's **ends** |
| `lane` | any number, default `0` | How far to bow off `radius` on the way past someone walking the same circle the other way. Positive is **outward**. Zero is a constant-radius arc |
| `hold` | a hand and a grip style, default **absent** | A hand joined for the whole arc. Absent is the hands-free arc, and that emptiness is a positive F2 fact. Present is the beau's half of a [California Twirl](../calls/california-twirl.md) — **the identical arc**, holding on |

## The lane rides inside the arc

Two dancers walking one circle in opposite senses meet head-on. CALLERLAB's **Passing
Rule** says they pass right shoulders *and continue* — an adjustment made inside the walk,
not a step taken before it and undone after it. `lane` is that adjustment: the radius bows
out (or in) along the arc instead of the dancer stepping onto a wider circle and off it
again.

The profile is `sin²` of the fraction walked — zero at both ends, peaking at the middle:

- **Zero at the ends** so the dancer leaves and arrives on their own radius. That is what
  makes the lane cost no beats, which is the whole of [ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md).
- **Flat at the ends**, which is a stronger property than merely being zero there: the bow
  contributes no sideways velocity at the block boundaries, so entry and exit facings stay
  exactly tangential and a chain has no kink where blocks meet. A triangular or plain-sine
  profile would be zero at the ends but still moving, and would tilt them.
- **Peaking at the middle**, which is where two dancers walking opposite senses meet, so
  the widest point of the bow is the moment of the pass. Flat there too, so they pass
  exactly shoulder to shoulder.

### Who chooses the number — 2026-08-19

The lane was a **constant of the figure** when this was written: `TRADE_LANE`, a proportion of the
couple's width, deleted with [ADR-0014](../../adr/0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md)
along with the two-dancers-on-one-circle reading that needed it. It left this block with no
consumer at all for a day, and a deletion note on it.

It has one again, and the number is now **solved rather than named**
([ADR-0016](../../adr/0016-a-couple-carries-the-clearance-its-bodies-need.md)). A couple carries
how far apart its dancers must be to pass; when that is more than the arc's own radius, the call
bisects for the smallest bow whose **minimum separation over the whole arc** meets it. Two
consequences for a reader of this block:

- **The bow is not `wanted − radius`.** That is right for the widest instant and wrong for the
  figure, because the other dancer is crossing the diameter at a constant rate while this profile
  is `sin²` — at a large bow the closest moment moves off the middle.
- **A bow can be asked for that no arc can deliver.** Both dancers are on their standing spots at
  the ends, so the separation there is fixed however wide the middle gets. The call caps the bow at
  the couple's own width for that reason; nothing in this block bounds it.

**Facing is solved from the velocity, not from the circle.** With a lane the dancer is
travelling outward as well as round, and *walking forward* means facing where they are
actually going — so facing is the tangent to the **path**, which sits a few degrees off the
circle's tangent while the bow is moving. Taking `angle ± 90` instead would have them
crabbing sideways for half the arc.

## Frame

Pivot-centred, like `arm-turn`: the shared centre is the origin and the dancer enters standing
off it at `radius`, due south (position angle 270°).

**Entry facing is tangential**, unlike `arm-turn`. There is no step-in to turn out of — a
dancer walking a circle faces the way they are going from the first beat.

## Why this is not `arm-turn` with the grip switched off

The obvious reading of a Trade is "an arm turn without the arms", and it is wrong **by a
radius**. `arm-turn` steps in from `ENTRY_RADIUS` 0.5 to `ORBIT_RADIUS` 0.3, because that is
what joining forearms costs. A Trade's dancers never close that gap — they walk the circle they
are already standing on.

So the relationship runs the other way: **`orbit` is the primitive, and an arm turn is `orbit`
plus a grip plus the step-in.** Ryan chose that shape ("go with cleaner") over adding a `grip`
parameter to `arm-turn`.

🔴 **And "plus the step-in" understates it — the step-in is *absorbed*, not added.** Both
blocks are 8 beats for a full turn. `arm-turn` spends its first beat stepping in and then fits
a whole revolution into the remaining seven, compressing the closing quarter into one beat
against `orbit`'s two. The two arcs agree at the quarter marks up to 0.75 and part company
after it. Found by writing the equivalence test rather than by reading either block, and left
as a live assertion because a refactor would have to decide what becomes of that compressed
quarter.

🔴 **`arm-turn` is deliberately not refactored onto this block.** It is render-validated
(2026-07-27, the Allemande's CCW turn), and this family does not disturb validated geometry for
a tidier decomposition. A test asserts instead that `orbit` reproduces `arm-turn`'s orbital arc
at the same radius, so the claim is checked and a future refactor would start from evidence.

## Timing

A full circle is **8 beats**, the same rate `arm-turn` uses. A half turn is 4.

🔴 **Corrected 2026-08-16.** This section used to add: *"The Trade family's 4 beats for a half
turn is exactly this."* The rate is right and the arithmetic is right, but the sentence reads
the chart's `Partner Trade: 4` as the **rotation's** budget, and it is the **whole call's** —
the chart measures from point of contact, and a couple is already in contact. Partner Trade
was built at 6 on the strength of that reading, buying a beat at each end for a sidestep the
sources do not describe. See [ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md).

## Flow

| Field | Value |
|---|---|
| Hands | **None**, for the whole arc, unless `hold` names one — a positive fact for F2, not an omission. A Trade leaves both hands available, which is what makes it flow into anything |
| Last hand used | `none`, or `hold`'s hand: what finished engaged |
| Rotation (F4) | `fraction × ±360°`, signed by `turn` — left positive |
| Body-flow vector | Along the final facing, which is tangential |
| Roll | Available — the arc gives a definite rotation direction |

## The hold changes nothing here

`hold` emits one grip span covering the block and sets `lastHand`. It moves no waypoint, and
that is the claim [ADR-0017](../../adr/0017-a-california-twirl-is-a-partner-trade-holding-on.md)
rests on — a California Twirl's beau walks a Partner Trade's arc. So there is no worked example
with a hold in it: the tables below **are** the held arc's tables, and the call spec asserts
that by comparing the two calls waypoint for waypoint rather than by carrying a second copy.

🔴 **It changes nothing *here*, and it decides something one level up** — 2026-08-19,
[ADR-0018](../../adr/0018-the-arch-needs-a-hands-room-between-two-heads.md). A raised arch puts a
joined hand in the gap the two dancers pass through, so the *call* reads the hold to decide which
of its couple's two clearances the pass has to make, and hands the answer down as `lane`. From
inside this block that is an ordinary lane like any other: same `sin²`, same zero at the ends, same
no beats. The block still knows nothing about why it is that wide, which is the property worth
keeping.

## Worked examples

**The `Facing` column is not optional here.** The loader only checks facing when the table
carries the column, and treats its absence as "constant for this block and stated in prose"
(`SpecRow.facing`). An orbit's facing *rotates* — it is the whole point — so omitting the
column would leave the facing claims as unchecked prose. It was omitted in the first draft of
this file and one of the three claims was wrong.

`orbit(right, 0.5, 0.5)` — 4 beats; the half turn a Partner Trade dancer walks:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | 0 | −0.5 | −x | standing off the centre, already tangential — no step-in to turn out of |
| 2 | −0.5 | 0 | +y | a quarter round CW |
| 4 | 0 | 0.5 | +x | opposite the start, a half turn of facing with it |

The second is a quarter at an arm turn's own orbit radius — the comparison the `arm-turn`
equivalence test is built on.

`orbit(left, 0.25, 0.3)` — 2 beats:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | 0 | −0.3 | +x | tangential to a CCW arc |
| 2 | 0.3 | 0 | +y | a quarter round CCW |

The third is the same half turn with a lane, which is a Partner Trade's dancer in the general
case. Note what is **unchanged** by the bow: both ends, and the facing at all three rows.

`orbit(right, 0.5, 0.5, 0.1)` — 4 beats; bowed a fifth of its radius to pass outside:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | 0 | −0.5 | −x | on the dancer's own radius, tangential — the bow is flat here |
| 2 | −0.6 | 0 | +y | the top of the bow, a whole lane out, and the moment of the pass |
| 4 | 0 | 0.5 | +x | back on the radius they started from, having paid nothing to get there |

**Beats 1 and 3 are deliberately absent from this table**, and it is the one place in these
specs where a missing row is a statement. They are where the bow moves fastest, so they are
the only rows whose facing is *not* a cardinal — the dancer is crabbing a few degrees off the
circle's tangent because that is the direction they are genuinely travelling. The loader reads
cardinals (`SpecRow.facing`), so putting a number there would be silently ignored, and a
silently ignored fixture is what this repo treats as worse than no fixture. Those two facings
are asserted in `test/orbit.test.ts` instead, where a number is a number.
