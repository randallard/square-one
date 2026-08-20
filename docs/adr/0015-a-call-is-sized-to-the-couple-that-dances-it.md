# ADR-0015: A call is sized to the couple that dances it
- Status: Accepted
- Date: 2026-08-18
- Deciders: Ryan, Claude

_🔴 **Reconstructed 2026-08-19.** The decision was made and implemented on 2026-08-18 inside
`813be1f`, and cited by name from three modules before this file existed. The reasoning below is
recovered from the code, the commit and `3c8ed43`; it is not a fresh decision, and the number was
reserved for it from the day it was first cited._

## Context

`COUPLE_WIDTH` has documented itself since it was written as **the body-agnostic default** — a
third of a unit, with an explicit instruction that a consumer who knows how wide real dancers are
should compute the real number and pass it to `partnerUp`. On 2026-08-16 townage did exactly that
(`3c8ed43`): its two dancers stand **0.438** apart in engine units, not 0.333, because a third put
their inside shoulders *over* their joined hands.

The seam worked, and then nothing downstream of `partnerUp` used it.

- **The chains were built at `COUPLE_WIDTH`.** `partnerTrade.chain` and `.chains` were computed
  once, at module load, from the constant. A couple standing at 0.438 danced a figure sized for
  0.333: the beau's arc was too small for the circle he was standing on, and the belle stepped
  across less than the distance between them. The couple's own width was carried, reported, and
  ignored by the only thing that had to know it.
- **And it was lost at the first call boundary anyway.** `reformCouple` rebuilt the couple from
  the two exit poses by calling `partnerUp` with no width at all, so every couple that came out of
  a call was back at `COUPLE_WIDTH` whatever the pair had been standing at. A consumer's real
  number survived exactly one call of a sequence.

What makes this non-obvious is that **both defects are invisible to every test that does not use a
real width.** The whole suite dances the body-agnostic couple, where the number that is ignored and
the number that replaces it are the same number.

## Decision

**A call's chains are instantiated against the couple that is dancing them, and a couple that comes
out of a call reports the width its two dancers are actually standing at.**

- `CallDef` gains `chainsAt`, a function from the couple's measurements to the two positions'
  chains. `applyCallToCouple` calls it: `def.chainsAt?.(couple) ?? def.chains`.
- The static `chain` and `chains` stay, and are defined as **the default-width instantiation**.
  They are what the workshop, the catalog and the spec fixtures read; they are not what gets
  danced.
- `reformCouple` **measures** the new width as the distance between the two exits, rather than
  carrying the old one forward or defaulting it.

## Alternatives considered

- **Carry `couple.width` forward through `reformCouple`.** Rejected, and this is the interesting
  half of the decision: measuring is strictly better than asserting. A call that legitimately
  changes how far apart the pair stand says so in the couple it produces, instead of having the
  previous number written back over it — and a call that changes the separation *by mistake* is
  then visible in the couple rather than silently normalised away. That is the property which
  would have caught the original bug.
- **Scale the whole figure at the consumer.** The consumer already has a frame scale, so it could
  dance the body-agnostic figure and stretch it. Rejected: it makes every engine-side length a lie
  and it cannot express a couple whose width changes mid-sequence.
- **Make `COUPLE_WIDTH` configurable globally.** A module-level mutable default is the same bug
  with a wider blast radius — two floors on screen at once would fight over it.

## Consequences

- **The width seam is real end to end.** A consumer with bodies passes one number and every
  waypoint of every call in a sequence is sized from it.
- **A call definition now has two shapes in it** — the static one and the parameterised one — and
  they can drift. What holds them together is that `chains` is *defined as* `chainsAt(default)`,
  written that way in the source rather than duplicated.
- 🔴 **Measuring the width is right and it does not generalise.** It works because width is a fact
  about where two dancers are standing, which two exit poses contain. Anything a couple carries
  that is a fact about the **dancers' bodies** cannot be recovered from their positions, and
  measuring it is not an option — see [ADR-0016](0016-a-couple-carries-the-clearance-its-bodies-need.md),
  and the bug that came of not noticing the difference in
  [ADR-0018](0018-the-arch-needs-a-hands-room-between-two-heads.md).
- **Promotion condition:** if `chainsAt` ever needs something that is not a measurement — a
  formation, a floor position, who is where in the square — the parameter has become the wrong
  shape and this should be revisited rather than widened. `CoupleShape` exists to make that
  boundary visible: a chain that could see `center` or `facing` would be a chain that could bake
  the floor into the figure.
