# Partner Trade

The two dancers of a couple exchange places, each ending facing the opposite direction.

Planning ADR-0011's S1. **This is the one starter call with no salvaged source** —
[ADR-0004](../../adr/0004-starter-scope-zero-box-triple.md) flagged it as "the one call not
already in `moves.md`", and that is confirmed: the only trace there is inside Track 2's
description, *"the leads partner trade (pass right shoulders)"*, which gives the passing
shoulder and nothing else. Everything below is written from the CALLERLAB **Trade** family
definition rather than salvaged, and should be reviewed with that in mind.

**Brought current 2026-08-19** for [ADR-0014](../../adr/0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md)
(the belle steps and pivots), [ADR-0015](../../adr/0015-a-call-is-sized-to-the-couple-that-dances-it.md)
(the figure is sized to the couple dancing it) and
[ADR-0016](../../adr/0016-a-couple-carries-the-clearance-its-bodies-need.md) (the pass is sized to
the room the bodies need). The sections marked **superseded** below are kept as history, per
[ADR-0009](../../adr/0009-spec-markdown-is-the-conformance-fixture.md) — their geometry is correct
and is what the current answer had to satisfy.

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

The two dancers exchange places, passing **right shoulders**, each ending in the other's starting
spot facing the opposite direction. Hands are free throughout; nobody is turned by anybody.

🔴 **They do not walk the same figure, and that is the whole call** (ADR-0014). Ryan, watching it
for the third time: *"really the belle should not move forward hardly at all in this, since that
makes the beau have to move even farther out to get around — for the belle this is really a step
left and pivot 180."*

- The **beau** walks one forward semicircle round the belle, on the circle the couple is already
  standing on.
- The **belle** steps the couple's whole width to her left, pivoting 180° left through the step,
  going nowhere forward.

So he goes round and she goes across, and the pass is a whole radius wide out of the shape of the
figure rather than out of a tuned separation.

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

**Superseded 2026-08-18 by [ADR-0014](../../adr/0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md).**
There is one orbit now — the beau's — and the belle does not walk an arc at all. Kept because the
tangential-facing argument below is correct and is what `step-pivot` had to reproduce for her, and
because the symmetry it establishes is still the reason the call is position-dependent.

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

🔴 **The conclusion survived ADR-0014; the mechanism did not.** She passes inside and he passes
outside because she crosses the middle while he goes round it — the asymmetry is now the *figure*
rather than a lane bowing two dancers off one shared circle.

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

Per position, because the two dance different figures — one block each:

| Position | # | Block | Beats | Exit |
|---|---|---|---|---|
| beau | 1 | [`orbit`](../blocks/orbit.md)`(right, 0.5, width / 2, lane)` | 4 | the belle's standing spot, facing reversed, having gone round the outside |
| belle | 1 | [`step-pivot`](../blocks/step-pivot.md)`(left, width, left, 0.5)` | 4 | the beau's standing spot, facing reversed, having crossed the middle |

He walks the circle the couple is **already standing on** — radius `width / 2`, centred on the
couple's centre. She steps straight across its diameter, pivoting 180° through the step and going
nowhere forward.

**`width` is the couple's own**, not `COUPLE_WIDTH` ([ADR-0015](../../adr/0015-a-call-is-sized-to-the-couple-that-dances-it.md)).
The static `chain`/`chains` a reader sees in the catalog are the body-agnostic instantiation, and
what actually gets danced is `chainsAt(couple)` — the figure at the width the pair are standing at.
Both chains come from `EXCHANGE_CHAINS_AT`, whose only parameter is the hold; a
[California Twirl](california-twirl.md) is this call with one supplied.

### The pass, and the lane that widens it

**The separation comes from the shape of the figure, not from a parameter.** At the middle of the
call he is at the top of the arc and she is at its centre — **a whole radius apart**, with nothing
tuned to make it so, which is `TRADE_PASS_SEPARATION = COUPLE_WIDTH / 2`.

🔴 **That is the floor, not the answer** ([ADR-0016](../../adr/0016-a-couple-carries-the-clearance-its-bodies-need.md)).
The engine models dancers as points and its collision invariant is "no shared coordinate", so a
radius that reads as generous can still be a figure walking two heads through each other. ADR-0014
pinned exactly that: on the-lot's cast the couple stand 1.140 world units apart, so the pass gets
**0.570**, against the **0.710** two heads actually need.

A couple therefore carries a `clearance`, supplied by whoever knows the bodies, and when it is more
than the radius the **beau's arc bows outward** to deliver it — `orbit`'s `lane`, which rides
inside the arc so a wider pass costs speed and not beats
([ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md)). The bow is:

- **the beau's alone.** The belle keeps crossing the middle and going nowhere forward, which is
  what makes this a pass rather than a pair rotating.
- **zero by default**, because the default clearance *is* the arc's own radius. Every worked
  example and conformance vector in this repo is a couple who ask for nothing.
- **solved, not computed**, and **capped at one couple-width** — both for reasons that only show up
  at large bows, set out in [`california-twirl.md`](california-twirl.md#the-arch-needs-more-room-than-the-bodies-do--2026-08-19)
  and [ADR-0018](../../adr/0018-the-arch-needs-a-hands-room-between-two-heads.md).

🔴 **the-lot does not pass this call's clearance yet**, deliberately: switching it on would bow a
figure Ryan has already watched and accepted, which is a look rather than a number. So ADR-0014's
head overlap is fixable and not yet fixed.

### 🔴 Superseded — the lane as the only thing between two dancers

**Superseded 2026-08-18 by [ADR-0014](../../adr/0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md).**
Until then both dancers walked the same circle in opposite senses, at radii differing by a
`TRADE_LANE` of 0.3 of the couple's width — 0.34 world units between two torsos needing 0.52. The
symmetry was the defect: two dancers on one circle leave the lane as the *only* thing separating
them, and it survived because two points a tenth apart satisfy "no shared coordinate".
`TRADE_LANE`, `TRADE_RADIUS_OUT` and `TRADE_RADIUS_IN` are deleted with it.

Kept because one thing in it outlived it. 🔴 **The lane had to be a *proportion* of the couple's
width, not the absolute `LANE_OFFSET`.** The first version used the flat 0.15 that `pass` uses for
Dosado's shoulder pass, which was invisible while a couple was a full unit wide and degenerate the
moment it stopped being: when `COUPLE_WIDTH` dropped to a third so the pair could touch hands, the
inside dancer's radius came out at **0.017** — a dancer spinning on the spot rather than walking an
arc. `LANE_OFFSET` is calibrated against a **facing pair's** one-unit separation, so borrowing the
number borrowed a ratio with it. The same trap is why the bow is solved from the couple's own
numbers today and capped at the couple's own width.

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
| **beau** | −½w, +y | on the axis at ½w + lane, +x | +½w, −y |
| **belle** | +½w, +y | **the centre**, −x | −½w, −y |

In terms of the couple's own width `w` and the bow `lane`, which is **zero** unless the couple
carries a clearance wider than `½w` (ADR-0016). A table of literals would have gone stale silently
when the couple narrowed, and would go stale again for every consumer with bodies.

**Beats 0, 2 and 4 are the only ones with anything to say**, which is itself the shape of the
call: both dancers start and finish on `½w` — their own standing spots, whatever the bow does —
and the one instant the beau is off it is the middle, which is the top of the bow. She is at the
couple's centre there, going nowhere forward, which is why the pass is a whole radius wide with
nothing tuned to make it so. Beats 1 and 3 are mid-arc and mid-step and are left to the tests, for
the reason [`orbit.md`](../blocks/orbit.md) gives about its own missing rows.

🔴 **"The top of the bow" stops being "the closest moment" once the bow is large** — she crosses at
a constant rate and the lane is `sin²`, so a heavily bowed beau is nearest her on the *way* to the
middle. It is why the bow is solved over the whole call rather than computed at beat 2
([ADR-0018](../../adr/0018-the-arch-needs-a-hands-room-between-two-heads.md)).

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

## The equivalence with California Twirl is an identity of paths

Partner Trade and [California Twirl](california-twirl.md) were recorded on 2026-08-15 as reaching
the same end position by **different** paths and different hands: a genuine choreographic
equivalence, and the first member of ADR-0004's equivalence suite. Confirmed by the engine the
same day, in `test/california-twirl.test.ts`.

🔴 **They walk the same paths.** Ryan, 2026-08-18, watching both renders: *"california twirl beau
might be same path but raise arm and have belle duck under the two held hands — belle's path might
be the same as partner trade too."* They are, waypoint for waypoint, both dancers, position and
facing. [ADR-0017](../../adr/0017-a-california-twirl-is-a-partner-trade-holding-on.md); the Twirl
is this call with the inside hands joined and raised, and the chains come from one factory whose
only parameter is the hold.

The test is strengthened rather than deleted: it compares every waypoint instead of the end
states, so it can no longer pass on two figures that merely agree at the finish.

🔴 **And the identity is now the body-agnostic couple's alone** — 2026-08-19,
[ADR-0018](../../adr/0018-the-arch-needs-a-hands-room-between-two-heads.md). It is the same
*figure* either way: same blocks, same belle, same beats. But the arch puts a **joined hand in the
gap** the two dancers pass through, at head height, so a Twirl's pass needs strictly more room than
a Trade's out of the same two bodies — and the beau's arc bows wider for it. "Identical paths"
becomes "same figure, sized to what it carries", and the waypoint-for-waypoint test is scoped to a
couple who ask for nothing, where it is still exactly true.

**What is left is the hands, and it is enough to keep them two calls.** F2 asks whether the hand a
following call needs is available. A Trade finishes with both free — which is what lets it flow
into anything — and a Twirl finishes holding the inside hand. They take the same 4 beats, which is
what makes the substitution usable inside a phrase.

🔴 Both of the *other* differences this section used to claim were symptoms. The rotation
difference (*"a Trade's dancers turn in opposite senses, a Twirl's the same way"*) was the Twirl's
540° spin, gone with ADR-0017. The beats difference was the Trade's own lane, gone with ADR-0013.
Each was written down as a characterisation of the two calls, and each was a defect describing
itself.
