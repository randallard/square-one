# Partner Trade

The two dancers of a couple exchange places, each ending facing the opposite direction.

Planning ADR-0011's S1. **This is the one starter call with no salvaged source** —
[ADR-0004](../../adr/0004-starter-scope-zero-box-triple.md) flagged it as "the one call not
already in `moves.md`", and that is confirmed: the only trace there is inside Track 2's
description, *"the leads partner trade (pass right shoulders)"*, which gives the passing
shoulder and nothing else. Everything below is written from the CALLERLAB **Trade** family
definition rather than salvaged, and should be reviewed with that in mind.

## Identity

| Field | Value |
|---|---|
| Canonical name | Partner Trade |
| Spoken variants | Trade with your partner; (as a family) Boys Trade, Girls Trade, Ends Trade |
| Legacy app abbreviation | — (not in `moves.md`) |
| Program | Basic Part 1 |
| Position dependence | **Yes** — the right-shoulder pass puts one dancer inside the other. See correction 3 below |

## Formations

| | |
|---|---|
| **Start** | A couple — two dancers side by side, same facing. Beau on the left, belle on the right ([ADR-0012](../../adr/0012-calls-key-off-couple-position-not-role.md)) |
| **End** | A couple, facing the opposite direction, each dancer standing where the other started |

## Timing

| Situation | Beats |
|---|---|
| From a couple (point of contact) | **4** |

The source figure, taken whole: Basic Program Definitions §35.b gives `Timing: 4` and the
Basic and Mainstream timing chart (rev. 2023-02-15) gives `Partner Trade: 4`. It is half of
the 8-beat full turn `orbit` and `arm-turn` share, and the lane costs nothing on top of it
because it rides inside the arc ([ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md)).

🔴 **This table said 6 until 2026-08-16**, on this reasoning:

> Four for the half orbit … plus a beat each side for the lane. The chart figure for a Trade
> is 4 beats of *rotation*; the lane steps are the approach and the recovery, which is the
> same accounting `arm-turn` uses when it counts "from point of contact".

The accounting is real but it does not apply here, and the chart itself says why: timing is
measured **from point of contact**, and beats are added only when it takes some to *reach*
contact. `arm-turn` has such an approach — its dancers step in from 0.5 to 0.3 because
forearms have to meet. **A couple is already in contact**: they are standing hand in hand,
which is why §35.b's styling note is about *releasing* a handhold. So the 4 is the whole call
and there was nothing to add to it. See the second correction below.

## Dance action

Each dancer walks **forward in a semicircle**, passing **right shoulders**, and ends in the
other's starting spot facing the opposite direction. Hands are free throughout; nobody is
turned by anybody.

The general CALLERLAB **Trade** definition is "two adjacent dancers exchange places by walking
forward in a semicircle, passing right shoulders, each ending in the other's starting position
facing the opposite direction." Partner Trade is that figure with the pair being a couple.

Two details from §35 that the first build did not use, and should have:

- **The passing shoulder is an adjustment inside the walk.** The General Passing Rule (p.7)
  says two dancers whose paths coincide pass right shoulders *and continue*. Continue, not
  step aside and resume — which is what rules out a discrete sidestep at each end.
- **The call opens from joined hands.** §35.b's styling: dancers swing their joined hands
  backward slightly as they release their handhold, *"This gets them turning in the correct
  direction as they start moving forward."* That is the call's initiation and it is
  rotational, and it is renderable now that a couple stands with inside hands joined. It is a
  styling fact rather than a path fact, so it belongs to a consumer, not to this chain — but
  it is the gesture that a sidestep was standing in for.

## 🔴 Corrected 2026-08-15, by trying to build it

The first draft of this section said:

> **The couple rotates 180° about its own centre, as a unit.** That is the whole call. …
> The passing shoulder is *right* for both, which is what makes their two semicircles mirror
> images about the couple's centre rather than two different actions — so this call needs no
> beau/belle branch, and `positionDependent` is `false`.

**Right about the end positions, wrong about the paths, and wrong about the conclusion.**
Kept visible rather than deleted: it is the kind of error that reads perfectly well, and the
only thing that caught it was composing the blocks.

Three separate corrections fall out.

### 1. It is not a rigid rotation

Under a rigid 180° rotation of the couple, each dancer's facing would turn continuously from
`+y` to `−y` while their position swept a semicircle — and their facing would **not** be
tangent to their path. One of them would be walking sideways or backwards for most of it. The
CALLERLAB Trade definition is explicit that both dancers *walk forward*.

### 2. The two orbits run in opposite senses

Both dancers face `+y` and both walk forward, so from the couple's centre:

| | starts at | walks | ends at |
|---|---|---|---|
| beau | position angle 180° | **clockwise**, through the front | 0° |
| belle | position angle 0° | **counterclockwise**, through the front | 180° |

Tangential facing then works out for both — beau `90° → 270°`, belle `90° → 270°` — which is
the end state the call needs, and it is *why* the senses have to be opposite. A shared sense
would start one of them facing the wrong way.

### 3. And that is why it is position-dependent

Both arcs pass through the front, so without something else the two dancers occupy the same
point at the same beat. That is not merely bad dancing: the engine models dancers as points and
its collision-freedom invariant is "no shared coordinate", so the property tests would catch it.

**Passing right shoulders is what separates them, and it separates them asymmetrically.** At
the meeting point the beau faces `+x` and the belle `−x`. Each must have the other on their own
right — the beau's right is `−y` (toward the centre) and the belle's is `+y` (away from it) —
so the **belle passes inside and the beau outside**, at radii differing by a lane.

That asymmetry is the correction. A mirror about the couple's fore-aft axis maps a radius to
itself, so it cannot produce one dancer inside and the other outside; neither can the 180°
rotation `applyCallToPair` uses. **The two dancers genuinely walk different figures**, which is
exactly what `positionDependent` means.

## What this says about pair symmetry generally

Worth recording because it outlives this call. `applyCallToPair` derives dancer B as A rotated
180° about the pair centre, and that is right for a **facing pair** — two dancers pointing
opposite ways. A **couple** points the same way, and its natural symmetry is a **reflection**,
not a rotation.

So the symmetry follows the formation, and the engine currently knows only one of the two.
Partner Trade needs neither, because the right-shoulder pass breaks even the reflection — but
the general point stands and Star Thru will need the reflection.

## Block composition

Per position, because the two walk different arcs:

| Position | # | Block | Beats | Exit |
|---|---|---|---|---|
| beau | 1 | `orbit(right, 0.5, COUPLE_WIDTH / 2, +TRADE_LANE)` | 4 | the belle's standing spot, facing reversed, having passed outside |
| belle | 1 | `orbit(left, 0.5, COUPLE_WIDTH / 2, −TRADE_LANE)` | 4 | the beau's standing spot, facing reversed, having passed inside |

Both walk the circle the couple is **already standing on** — radius `COUPLE_WIDTH / 2`,
centred on the couple's centre — and the right-shoulder pass is the lane bowing them apart at
the middle and returning them to their own radius by the end
([ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md)).

Written as the constants rather than as numbers **on purpose**: they follow
`COUPLE_WIDTH`, and the first version of this table hard-coded the values that fell out
of a unit-wide couple. See below.

The two chains have the **same shape** and differ only in which way round they walk and which
way they bow, which is a pleasing check on the reading: a Trade really is one figure danced
two ways round.

🔴 **The lane is a *proportion* of the couple's width, not the absolute `LANE_OFFSET`.**
The first version used the flat 0.15 that `pass` uses for Dosado's shoulder pass. That was
invisible while a couple was a full unit wide, and degenerate the moment it stopped being: when
`COUPLE_WIDTH` dropped to a third so the pair could touch hands, the inside dancer's radius came
out at **0.017** — a dancer spinning on the spot rather than walking an arc. `LANE_OFFSET` is
calibrated against a **facing pair's** one-unit separation, so borrowing the number borrowed a
ratio with it.

### 🔴 Why the slides are not optional, which took building it to see — and then were

**Superseded 2026-08-16 by [ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md).**
Kept in full because the geometry in it is correct and is what the new answer had to satisfy;
only the conclusion was wrong, and one word of the argument is where it turned. The correction
is at the end of this section.

The first composition was a single `orbit` per dancer, and it cannot work. For a circular arc
from a dancer's standing spot to their partner's, the centre must lie on the **perpendicular
bisector** of the line between them — the couple's fore-aft axis — and the only such arc that
is a semicircle has its centre at the couple's own centre and radius `0.5`. **For both
dancers.** Which is the collision.

So no single constant-radius arc both lands on the standing spots and separates the dancers,
and the lane has to be its own motion. That is what a real Trade looks like anyway: curve out,
round, and back in.

This also required giving [`slide`](../blocks/slide.md) a **distance** — it had a fixed
`SLIDE_DISTANCE` of `2 × LANE_OFFSET`, which is a *full* lane change (Dosado's crossing step)
and twice what a half-lane offset needs.

#### 🔴 And the correction: the word doing the work is *constant-radius*

The proof above is sound and the conclusion drawn from it is not. "No single **constant-radius**
arc both lands on the standing spots and separates the dancers" is true; "and so the lane has
to be its own motion" does not follow from it. **A varying radius does both** — leave on your
own radius, bow to the passing side through the middle, arrive on your own radius — and that
is one curve walked, not three motions concatenated. `orbit` now takes a `lane` that does
exactly this, and Partner Trade is a single block per dancer again.

Three things say the slides were wrong rather than merely improvable:

1. **They cost beats the chart does not give.** See the Timing section above.
2. **They produce motion the source never describes.** A `slide` moves a dancer at exactly 90°
   to their facing. §35.a says *walk forward in a semicircle*; the Passing Rule says pass and
   *continue*. Sideways travel with no forward component appears nowhere.
3. **This block had already refused the same idea.** [`slide`](../blocks/slide.md)'s spec
   records a `span: half` variant proposed and dropped on 2026-07-26, for Dosado, on the
   grounds that CALLERLAB blends the closing lateral into the walk rather than making it a
   discrete step. Three weeks later this call re-introduced the discrete step as a `distance`
   parameter and nobody noticed the precedent. **The parameter has been removed.**

What caught it was rendering it: two Trades in a row put the closing sidestep of the first
against the opening sidestep of the second, and two beats of pure lateral translation with
facing constant reads on screen as a standing couple swaying. Ryan, watching
`#dance=two-trades`: *"the sway when just standing — it seems 2x too wide and 2X too slow."*
Which is the second time this call has been corrected by looking at it rather than by reading
it, and both times the reading was internally consistent.

**The block exists now**: [`orbit`](../blocks/orbit.md), added 2026-08-15. The reasoning that
produced it is kept below because it is the catalog argument, not just this call's.

`arm-turn` was the wrong block despite the obvious resemblance, and the reason is a radius.
`arm-turn` has the dancers **step in** from `ENTRY_RADIUS` 0.5 to `ORBIT_RADIUS` 0.3 because
forearms are joining; its own module doc says it is "two dancers join forearms and walk forward
around their common pivot". Partner Trade's dancers keep their hands free and stay at their own
radius the whole way.

**Settled 2026-08-15.** The two shapes on the table were a new `orbit` block (with `arm-turn`
reading as orbit + grip + step-in) or a `grip` parameter on `arm-turn`. Ryan: *"go with
cleaner"* — the new block. `arm-turn` is **not** refactored onto it, being render-validated;
the relationship is asserted by test instead, and that test corrected the claim (the step-in is
absorbed into the same beat budget, not added to it).

## Choreography paths

The block's own worked examples are in [`orbit.md`](../blocks/orbit.md) and are conformance
fixtures. This call's paths are those two arcs placed in the couple frame, and are asserted in
`test/partner-trade.test.ts` rather than restated here — the numbers below would otherwise be a
third copy of the same geometry, and a copy is a thing that can disagree.

Couple centred on the origin facing `+y`:

| | beat 0 | beat 2 | beat 4 |
|---|---|---|---|
| **beau** | −½w, +y | on the axis at ½w+lane, +x | +½w, −y |
| **belle** | +½w, +y | on the axis at ½w−lane, −x | −½w, −y |

In terms of `COUPLE_WIDTH` (`w`) and `TRADE_LANE` (`lane`), because both moved once the couple
narrowed and a table of literals would have gone stale silently.

**Beats 0, 2 and 4 are the only ones with anything to say**, which is itself the shape of the
call: the dancers start and finish on `½w` — their own standing radius, never a lane — and the
one instant they are off it is the pass at the middle, which is also the top of the bow. Beats
1 and 3 are mid-bow and mid-crab and are left to the tests, for the reason
[`orbit.md`](../blocks/orbit.md) gives about its own missing rows.

🔴 **This table used to run to beat 6**, with a `beat 1` and a `beat 5` column in which each
dancer sat on their lane radius still facing `+y` — the sidestep, written down. That those two
columns changed nothing but `x` is the defect in the table, visible in hindsight and not at the
time.

## Flow

| Field | Value |
|---|---|
| Hands | None engaged at any point — a positive fact for F2, not an omission |
| Last hand used | `none`; both hands stay available for whatever follows |
| Rotation (F4) | 180° per dancer, direction set by the right-shoulder pass |
| Body-flow vector | Along the final facing |
| Roll | Available — the dancer has a definite rotation direction |

**The asymmetry is in the sources too, as a flow cost.** CALLERLAB's *Choreographic
Guidelines* (ch. 3, Anticipation) observes that Partner Trade "violates the smooth flow of the
belle (right hand) dancer" — an independent confirmation of correction 2 below, arrived at from
dancing rather than from geometry. Worth keeping in view for F3/F4: the belle is the dancer for
whom this call is uncomfortable, and she is the one who passes inside.

## Is it a zero?

**Two Partner Trades should return the couple to its start** — each dancer walks a half circle
and then the other half of the same circle, arriving back where they began facing the way they
began. `isZero` in `src/sequence.ts` says so rather than this paragraph; see
`test/partner-trade.test.ts`.

Note that the lane does not spoil it, and since
[ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md) it cannot: the bow is zero at
both ends of every Trade, so a dancer begins and finishes each one on `½w` exactly and there is
no lane state to carry into the next call. (Under the old constant-radius arcs it also held,
but for a longer reason — a dancer who started at `½w+lane` finished at `½w+lane` on the far
side, and the second trade brought them home along the same circle.)

## Equivalence with California Twirl

Partner Trade and [California Twirl](california-twirl.md) reach the **same end position** by
different paths and different hands: a genuine choreographic equivalence, and the first member
of ADR-0004's equivalence suite.

**Confirmed 2026-08-15** by the engine, in `test/california-twirl.test.ts`: either can follow
the other and the couple still comes home.

They also take the **same 4 beats**, which is what makes the substitution usable — a caller
swaps one for the other inside a phrase, so an equivalence that changed the phrase's length
would not be one they could reach for. That was not true until 2026-08-16: the Trade was 6, and
the test asserted the two-beat gap as though it were a property of the call rather than a
defect in its timing.

What genuinely differs is the hands (a Trade leaves both free throughout; a Twirl keeps one
joined) and the rotation (a Trade's dancers turn in opposite senses, a Twirl's the same way).
