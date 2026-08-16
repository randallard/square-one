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
| From a couple (point of contact) | **6** |

Four for the half orbit — half of the 8-beat full turn `orbit` and `arm-turn` share — plus a
beat each side for the lane. The chart figure for a Trade is 4 beats of *rotation*; the lane
steps are the approach and the recovery, which is the same accounting `arm-turn` uses when it
counts "from point of contact".

## Dance action

Each dancer walks **forward in a semicircle**, passing **right shoulders**, and ends in the
other's starting spot facing the opposite direction. Hands are free throughout; nobody is
turned by anybody.

The general CALLERLAB **Trade** definition is "two adjacent dancers exchange places by walking
forward in a semicircle, passing right shoulders, each ending in the other's starting position
facing the opposite direction." Partner Trade is that figure with the pair being a couple.

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
| beau | 1 | `slide(left, TRADE_LANE)` | 1 | out to the far lane |
| | 2 | `orbit(right, 0.5, TRADE_RADIUS_OUT)` | 4 | the belle's side, facing reversed, having passed outside |
| | 3 | `slide(right, TRADE_LANE)` | 1 | back in onto the belle's standing spot |
| belle | 1 | `slide(left, TRADE_LANE)` | 1 | in to the near lane |
| | 2 | `orbit(left, 0.5, TRADE_RADIUS_IN)` | 4 | the beau's side, facing reversed, having passed inside |
| | 3 | `slide(right, TRADE_LANE)` | 1 | back out onto the beau's standing spot |

Written as the constants rather than as numbers **on purpose**: they follow
`COUPLE_WIDTH`, and the first version of this table hard-coded the values that fell out
of a unit-wide couple. See below.

The two chains have the **same shape** and differ only in the orbit's direction and radius,
which is a pleasing check on the reading: a Trade really is one figure danced two ways round.

🔴 **The lane is a *proportion* of the couple's width, not the absolute `LANE_OFFSET`.**
The first version used the flat 0.15 that `pass` uses for Dosado's shoulder pass. That was
invisible while a couple was a full unit wide, and degenerate the moment it stopped being: when
`COUPLE_WIDTH` dropped to a third so the pair could touch hands, the inside dancer's radius came
out at **0.017** — a dancer spinning on the spot rather than walking an arc. `LANE_OFFSET` is
calibrated against a **facing pair's** one-unit separation, so borrowing the number borrowed a
ratio with it.

### 🔴 Why the slides are not optional, which took building it to see

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

| | beat 0 | beat 1 | beat 3 | beat 5 | beat 6 |
|---|---|---|---|---|---|
| **beau** | −½w, +y | −(½w+lane), +y | on the axis at ½w+lane, +x | +(½w+lane), −y | +½w, −y |
| **belle** | +½w, +y | +(½w−lane), +y | on the axis at ½w−lane, −x | −(½w−lane), −y | −½w, −y |

In terms of `COUPLE_WIDTH` (`w`) and `TRADE_LANE` (`lane`), because both moved once the couple
narrowed and a table of literals would have gone stale silently.

The lane radii are visited in the middle and left behind: the slides put each dancer on their
lane and take them off it again, so the call starts and ends on the couple's own standing
positions.

## Flow

| Field | Value |
|---|---|
| Hands | None engaged at any point — a positive fact for F2, not an omission |
| Last hand used | `none`; both hands stay available for whatever follows |
| Rotation (F4) | 180° per dancer, direction set by the right-shoulder pass |
| Body-flow vector | Along the final facing |
| Roll | Available — the dancer has a definite rotation direction |

## Is it a zero?

**Two Partner Trades should return the couple to its start** — each dancer walks a half circle
and then the other half of the same circle, arriving back where they began facing the way they
began. `isZero` in `src/sequence.ts` says so rather than this paragraph; see
`test/partner-trade.test.ts`.

Note that the lane radii do not spoil it: a dancer who starts a trade at `0.5 + lane` finishes
it at `0.5 + lane` on the far side, and the second trade brings them home along the same
circle.

## Suspected equivalence

Partner Trade and [California Twirl](california-twirl.md) may reach the **same end position**
by different paths and different hands. If so it is a genuine choreographic equivalence — a
caller can substitute one for the other — and it belongs in ADR-0004's equivalence suite.

🔴 **Unverified.** Recorded as a question for the engine to settle once both calls exist, not
as a claim.
