# ADR-0019: A couple's clearances are carried across a call boundary, not measured
- Status: Accepted
- Date: 2026-08-19
- Deciders: Ryan, Claude

## Context

Ryan, watching `#dance=two-twirls` the first time the bow was on screen:

> it looks like the first california twirl is good but the second still has the smaller path

He was right, and the measurement is unambiguous. Over the two calls of that sequence, the closest
the pair came:

| call | closest approach (engine units) |
|---|---|
| California Twirl #1 | 0.333 — clears the 0.317 the arch wants |
| California Twirl #2 | **0.167** — the arc's bare radius |

[ADR-0015](0015-a-call-is-sized-to-the-couple-that-dances-it.md) decided that `reformCouple`
**measures** the couple's new width from the two exit poses rather than carrying the old one
forward, and gave a good reason: a call that changes how far apart the pair stand should say so in
the couple it produces, instead of having the previous number asserted over it.

That reasoning is correct about width and says nothing at all about clearance — and `reformCouple`
called `partnerUp` with a width and nothing else, so both clearances came back at their
body-agnostic defaults. A pair with real bodies danced their bow on the first call of a sequence
and the bare radius on every call after it.

**This is ADR-0015's own bug, returning one field over on the day that field got its first
reader.** It was invisible for the same reason as the original: the whole suite dances the
body-agnostic couple, where the number that is dropped and the number that replaces it are the same
number. `isCoupleZero(["california-twirl", "california-twirl"])` passed throughout — the bow is
zero at both ends, so nothing it does can survive the call, and a home check cannot see the middle
of a figure.

## Decision

**`reformCouple` carries `clearance` and `archClearance` through unchanged, while continuing to
measure `width`.**

The distinction is not a compromise between two policies, it is what the two fields are:

- **Width is where two dancers are standing.** Two exit poses contain it. Measuring is honest and
  strictly better than asserting.
- **Clearance is how wide the dancers are.** Two exit poses do not contain it and never will. It is
  a fact about bodies, not about the floor, and dancers do not get narrower between calls.

So the number that arrives is the number that leaves.

## Alternatives considered

- **Rescale the clearances by the new width.** Treat them as proportions of the couple. Rejected —
  they are absolute body measurements, and a couple who end a call standing closer have not
  shrunk.
- **Have the consumer re-supply the couple between calls.** It would work and it moves a fact the
  engine already holds out into every consumer's loop, where each one can forget it differently.
  `danceCoupleSequence` exists precisely so a consumer does not have to run the boundary itself.
- **Make `reformCouple` take the whole previous couple's shape and copy all of it, width
  included.** That is the design ADR-0015 rejected, and rejected for a reason that still holds.

## Consequences

- **Every call of a sequence gets the same room**, and a mixed sequence still sizes each call to
  what that call carries: a Trade then a Twirl by the same pair passes at 0.710 and then at 1.140
  world, which is the whole of ADR-0018 surviving a boundary.
- 🔴 **A couple now has one field that is measured and two that are carried**, and nothing in the
  type says which is which. What guards it is a test asserting the rebuilt couple keeps both
  clearances it was handed, plus one asserting both calls of a sequence deliver the same closest
  approach — the second is the one that would have caught this, and the reason it did not exist is
  that the previous measurement pass looked at **one call**.
- **The lesson is about the measurement, not the code.** The bow was measured end to end the day
  before this, beat by beat, in both accommodations, and the harness walked a single call. A figure
  that is correct in isolation and wrong in a sequence is exactly what a per-call instrument cannot
  see. **Measure the thing you are going to watch.**
- **Promotion condition:** if a call is ever legitimately allowed to change a dancer's body — a
  reshape that outlives the call, the way the-lot's arch accommodation does not — then clearance
  stops being a constant of the sequence and this needs revisiting rather than patching.
