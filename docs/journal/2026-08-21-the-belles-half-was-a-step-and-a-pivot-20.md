# 2026-08-21 — the belle's half was a step and a pivot (written three days late)

_Documents [ADR-0014](../adr/0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md) and commit
`813be1f`, both from **2026-08-18**. It has been listed as owed at the top of `PROGRESS.md` in
every chunk since — five of them — and this is it being paid._

🔴 **Written out of order and numbered where it was written, not where it belongs.** The
convention is one file per entry with a running number, and entries are append-only; entry 15 is
the California Twirl chunk from the same day and 16–19 are the four since. There is no gap to slot
this into and inventing one would mean renumbering entries that are already referenced by ADRs and
by `PROGRESS.md`. So it is 20, dated the day it was written, and the header says what it documents.
**A journal that renumbers itself is a journal you cannot cite.**

## What the chunk was

Ryan, watching a Partner Trade render for the third time:

> really the belle should not move forward hardly at all in this, since that makes the beau have
> to move even farther out to get around — for the belle this is really a step left and pivot 180

The call was two dancers walking the **same circle** in opposite senses, separated only by
ADR-0013's lane bowing them apart at the pass. The spec called that *"a pleasing check on the
reading: a Trade really is one figure danced two ways round."*

**The symmetry was the defect.** Two arcs through the same front, at a formation whose width is set
by a handhold, leaves nothing between the dancers — 0.34 world units between two torsos needing
0.52. It survived because the engine's collision invariant is "no shared coordinate", and two
points 0.1 apart pass that.

Ryan's reading dissolves it rather than tuning it. If the belle does not go round at all, the beau
is not passing someone coming the other way round his circle — **he is walking round someone
standing in the middle of it.**

## What made it more than a fix

**The source had already said so, and the spec had already written it down.** CALLERLAB's
*Choreographic Guidelines* note that Partner Trade "violates the smooth flow of the belle (right
hand) dancer". That was recorded on 2026-08-15 as a curiosity to keep in view. A dancer whose flow
the figure violates is a dancer who is **not walking a smooth forward semicircle** — the note was
reporting the exact defect, three days before anyone read it as one.

That is the pattern this month keeps producing: the answer sitting in a document nobody was
reading as an answer. `gripHeight`'s doc comment carried the forearm reach defect since the fist
bump (ADR-0033); this one carried the Trade's asymmetry.

**And a symmetry that looks like a check can be the bug.** The spec liked "one figure danced two
ways round" because it was elegant, and elegance was the thing keeping the collision in place.
ADR-0017 hit the same shape three days later from the other side — a *declared equivalence* turned
out to mark a duplicate rather than confirm a relationship.

## What it cost

`step-pivot` is a new block, because nothing translated laterally *while* turning: `slide` is
"sidestep laterally **without** turning", one beat, one fixed distance. ADR-0013's lane and its
three constants went, and the pass separation went from 0.3 of the couple's width to 0.5 — the
arc's own radius, out of the shape of the figure rather than from a proportion borrowed off a
facing pair.

Everything since has been built on it. ADR-0016's bow, ADR-0018's arch clearance and ADR-0022's
chord sag are all measured at the pass this chunk created, and ADR-0017's finding — that a
California Twirl **is** this figure, holding on — is only expressible because the two halves stopped
being the same path.

## The lesson about the entry itself

Five chunks of "🔴 no journal entry for the ADR-0014 chunk" at the top of `PROGRESS.md` did not
produce one. What produced one was Ryan asking for the short list and it being item 12 of 13.

The ADR was written the same day and was never in doubt; what was missing was the *narrative* —
the flow note nobody had read as an answer, and the symmetry that was doing damage while looking
like a proof. Neither of those is in the ADR, because an ADR records the decision and not the
three days it took to see the question. **A backlog item that has survived five chunks is not
going to be cleared by a sixth reminder.**
