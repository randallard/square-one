# 2026-08-19 — the hand in the gap, and the second twirl

_Documents `b3a02eb` — the clearance chunk: [ADR-0018](../adr/0018-the-arch-needs-a-hands-room-between-two-heads.md)
and [ADR-0019](../adr/0019-a-couples-clearances-are-carried-across-a-call-boundary.md), plus the two
owed reconstructions [ADR-0015](../adr/0015-a-call-is-sized-to-the-couple-that-dances-it.md) and
[ADR-0016](../adr/0016-a-couple-carries-the-clearance-its-bodies-need.md) that this one had to
reference before it could be written. Committed unverified: the `#dance=two-twirls` watch
below is still owed._

`Couple.clearance` was added on 2026-08-18 inside ADR-0014's commit and read by nothing. It carried
a real number, the consumer computed and passed one, and every call in the library sized its figure
from the constant beside it. A field with a producer, a value, and no consumer — which is the
quietest way for a decision to be half-made, because nothing about it is broken.

This chunk gave it a reader, and the reader found two things nobody had asked about.

## An arch is not two dancers passing

ADR-0017 had just established that a California Twirl **is** a Partner Trade with the inside hands
joined and raised — same blocks, same belle, same beats, same waypoints. Which meant both calls
asked the same pair for the same room. Ryan, on the arch:

> the beau's hand clips through the belle's head — it shouldn't push into the beau's own head
> either though

The gap has a **third thing** in it. Two dancers passing must clear each other; two dancers passing
under a joined hand must clear each other *and the hand*, at head height, where a head is the
widest thing either of them has — and that hand belongs to neither of them, so neither one's width
accounts for it. Measured on the shipped cast, against a couple standing 1.140 apart: torsos want
0.520, heads want 0.710, **heads with a hand between them want 1.084.**

So a couple carries two clearances, and the figure picks by its hold — `hold?.grip === "arch"`, one
expression, because the hold already says which call this is. Two calls, one factory, still one
parameter.

## The pass is not the closest moment

The bow that delivers a clearance looks like arithmetic: he is at the top of the arc, she is at its
centre, so bow him out by `wanted − radius`. That is exactly right about the **pass** and wrong
about the **figure**. The lane is `sin²` — widest in the middle — and she crosses the diameter at a
constant rate, so once the bow is large the two of them are nearest each other on the *way* to the
pass rather than at it.

At this cast's arch clearance the arithmetic came out **3% short**, and 3% is a hand inside a head.
It is bisected now, on the minimum separation over the whole call, which works because the
separation is monotonic in the bow: the belle never leaves the disc the beau walks around.

**The formula was right about the instant it was derived for and wrong about every other instant.**
It is the same failure as the equivalence test in entry 15 — a claim that is true, checked, and not
the claim you needed.

## And a figure cannot separate two dancers standing on their spots

Solving it unbounded put the beau at **73 times** the couple's width. At both ends of the call the
separation is exactly the couple's own width, whatever happens in between, so the minimum only ever
*approaches* that width — a clearance near it costs an unbounded bow for a vanishing gain, and one
at or above it cannot be delivered at all. The bow is capped at one couple-width: past that he is
not dancing round his partner, he is running a lap. The cap is the couple's own number, not one
anybody picked, and the standing hold answers for the ends.

On this cast the arch wants 0.951 of the standing width — inside the cap, and only just. The bow it
buys is large: the beau's arc peaks at **1.152× the couple's width**, and the pass goes from 0.570
to 1.314 world units. That is the one number a render decides, because he covers all of it in the
same 4 beats.

## The second twirl

Then Ryan watched it:

> it looks like the first california twirl is good but the second still has the smaller path

| call | closest approach |
|---|---|
| California Twirl #1 | 0.333 — clears the 0.317 the arch wants |
| California Twirl #2 | **0.167** — the arc's bare radius |

`reformCouple` rebuilds the couple between calls of a sequence, and it called `partnerUp` with a
width and nothing else, so both clearances came back at their body-agnostic defaults.

**This is ADR-0015's bug, one field over, on the day that field got its first reader.** ADR-0015
exists because `reformCouple` used to drop the *width* the same way. The fix then was to measure it
from the two exits, and the reasoning was good: a call that changes how far apart the pair stand
should say so in the couple it produces. That reasoning is about width and says nothing about
clearance — and clearance cannot be measured from two exit poses at all, because it is a fact about
**bodies**. Dancers do not get narrower between calls. So width is measured and clearance is
carried, and the two rules are not a compromise; they are what the two fields are.

## The thing worth keeping

**Measure the thing you are going to watch.** The bow was measured end to end the day before — beat
by beat, both accommodations, worst penetration 0.175 → none — and the harness walked **one call**.
Ryan was watching a **sequence**. A figure that is correct in isolation and wrong in a sequence is
precisely what a per-call instrument cannot see, and no amount of care inside that instrument would
have found it.

The suite could not have caught it either, for a reason worth naming: every test in this repo
dances the body-agnostic couple, where the number that gets dropped and the number that replaces it
are **the same number**. That is true of the original width bug too. A default that is also the
correct answer everywhere you test is a default that hides its own loss.

`isCoupleZero(["california-twirl", "california-twirl"])` passed the whole time. The bow is zero at
both ends, so nothing it does can survive the call — a home check is blind to the middle of a
figure by construction, which is exactly the part a clearance lives in.

## What this leaves

- 🔴 **The Partner Trade's own clearance is still not passed by the consumer.** The mechanism now
  exists to close ADR-0014's head overlap, and turning it on would bow a figure Ryan has already
  watched and accepted. That is a look, not a number, and it is owed rather than taken. Flagged
  where a reader will hit it, on `useDancePerformance`'s `archClearance`.
- 🔴 **Watch `#dance=two-twirls`.** The beau's arc is now 1.15× the couple's width where it was
  0.5×, in the same 4 beats. Whether he reads as sprinting is the open question and it is not one
  the tests can answer.
- **`orbit`'s `lane` is load-bearing again.** It has been a deletion candidate since ADR-0014 took
  its only consumer away; the whole of ADR-0016 now rests on it. `turn-under` is still waiting for
  Star Thru.
