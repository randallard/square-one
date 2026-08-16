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
| Position dependence | **None** — both dancers walk the same figure, mirrored. See "Why this is not position-dependent" below |

## Formations

| | |
|---|---|
| **Start** | A couple — two dancers side by side, same facing. Beau on the left, belle on the right ([ADR-0012](../../adr/0012-calls-key-off-couple-position-not-role.md)) |
| **End** | A couple, facing the opposite direction, each dancer standing where the other started |

## Timing

| Situation | Beats |
|---|---|
| From a couple (point of contact) | **4** |

Half of `arm-turn`'s 8-beat full turn, which is what the figure is geometrically — see below.

## Dance action

Each dancer walks **forward in a semicircle**, passing **right shoulders**, and ends in the
other's starting spot facing the opposite direction. Hands are free throughout; nobody is
turned by anybody.

The general CALLERLAB **Trade** definition is "two adjacent dancers exchange places by walking
forward in a semicircle, passing right shoulders, each ending in the other's starting position
facing the opposite direction." Partner Trade is that figure with the pair being a couple.

## What it is, geometrically

**The couple rotates 180° about its own centre, as a unit.** That is the whole call.

Both dancers orbit the couple's midpoint by half a turn at their own standing radius. Since
each keeps their side of the couple through the rotation, **the beau is still the beau and the
belle is still the belle** — the couple has turned around, not reshuffled.

Worth stating explicitly because it is easy to read "exchange places" as a swap of sides. In
world coordinates they have swapped; in the couple's own frame nobody has moved.

## Why this is not position-dependent

Both dancers walk the same figure. The passing shoulder is *right* for both, which is what
makes their two semicircles mirror images about the couple's centre rather than two different
actions — so this call needs no beau/belle branch, and `positionDependent` is `false`.

Contrast [California Twirl](california-twirl.md), which reaches a similar end position through
an arch that one dancer makes and the other passes under, and *is* position-dependent.

## Block composition

🔴 **Needs a block the catalog does not have.**

| # | Block | Beats | Exit |
|---|---|---|---|
| 1 | `orbit(right, 1/2)` — **not yet in the catalog** | 4 | the other's spot, facing reversed |

`arm-turn` is the wrong block despite the obvious resemblance, and the reason is a radius.
`arm-turn` has the dancers **step in** from `ENTRY_RADIUS` 0.5 to `ORBIT_RADIUS` 0.3 because
forearms are joining; its own module doc says it is "two dancers join forearms and walk forward
around their common pivot". Partner Trade's dancers keep their hands free and stay at their own
radius the whole way.

**Open question for the catalog, and it is ADR-0005's bet being tested.** Two shapes:

1. **A new `orbit` block** — walk a fraction of a circle about a shared centre, hands free, at
   a given radius. `arm-turn` then reads as `orbit` plus a grip plus the step-in.
2. **A `grip` parameter on `arm-turn`** — `forearm` (today) or `none`, with the radius following
   from it.

(1) is cleaner and (2) is cheaper. (1) also invites refactoring `arm-turn`, which is
render-validated and should not be disturbed lightly. **Not decided here** — this is a catalog
decision, and picking it while writing one call's spec is how a catalog gets shaped by
whichever call happened to come first.

## Choreography paths

**Deliberately not written in the conformance-fixture format yet.** The loader keys on a
`` `block(args)` — N beats: `` signature line and **throws** on a block it cannot find in the
catalog ([ADR-0009](../../adr/0009-spec-markdown-is-the-conformance-fixture.md) makes an
unmatched fixture an error rather than a skip, on purpose). Writing the table in that form
before `orbit` exists would take the suite red for a reason that is not a defect.

What the fixture will assert, once the block lands — beau's path in the couple frame, couple
centred on the origin facing `+y`, beau entering at `(−0.5, 0)`:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | −0.5 | 0 | +y | standing as beau |
| 2 | 0 | −0.5 | −x | quarter round, passing right shoulders at the centre-rear |
| 4 | +0.5 | 0 | −y | arrived in the belle's spot, facing reversed |

The belle's path is this rotated 180° about the couple's centre — the same pair symmetry
`applyCallToPair` already encodes, and one of the last calls for which that symmetry holds.

## Flow

| Field | Value |
|---|---|
| Hands | None engaged at any point — a positive fact for F2, not an omission |
| Last hand used | `none`; both hands stay available for whatever follows |
| Rotation (F4) | 180° per dancer, direction set by the right-shoulder pass |
| Body-flow vector | Along the final facing |
| Roll | Available — the dancer has a definite rotation direction |

## Is it a zero?

**Two Partner Trades return the couple exactly to its start**, because 180° + 180° is a full
turn about the same centre. That is the first half of Ryan's S1 sequence, and `isZero` in
`src/sequence.ts` is what will say so rather than this paragraph.

## Suspected equivalence

Partner Trade and [California Twirl](california-twirl.md) may reach the **same end position**
by different paths and different hands. If so it is a genuine choreographic equivalence — a
caller can substitute one for the other — and it belongs in ADR-0004's equivalence suite.

🔴 **Unverified.** Recorded as a question for the engine to settle once both calls exist, not
as a claim.
