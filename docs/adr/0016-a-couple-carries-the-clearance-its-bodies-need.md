# ADR-0016: A couple carries the clearance its bodies need, and the beau's arc bows out to meet it
- Status: Accepted
- Date: 2026-08-18
- Deciders: Ryan, Claude

_🔴 **Reconstructed 2026-08-19.** `Couple.clearance` landed on 2026-08-18 in `813be1f` citing this
number, and the field was carried for a day with **no reader** — the bow it names did not exist
until 2026-08-19. This file records the decision the field was added for, and
[ADR-0018](0018-the-arch-needs-a-hands-room-between-two-heads.md) records what building the reader
found. Written after the fact; the number was reserved for it from the day it was first cited._

## Context

[ADR-0014](0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md) rebuilt the Partner Trade so
the two dancers pass at **half the couple's width** — the beau at the top of the arc, the belle at
its centre, a whole radius apart, out of the shape of the figure rather than out of a tuned
proportion. In the same breath it pinned that this is not enough:

> half the couple's width does not clear the heads on the size-extreme casts.

On townage's shipped cast the couple stand **1.140** world units apart, so the pass gets **0.570** —
against **0.710** that their two bodies actually need side by side. The figure is 0.14 short, every
time, and no amount of getting the geometry right fixes it, because the shortfall is not a
geometry error. **This engine has no bodies** ([ADR-0002](0002-pure-library-no-storage-no-ui.md)).
Its collision invariant is "no shared coordinate", and two points a hair apart satisfy it.

That is the same seam [ADR-0015](0015-a-call-is-sized-to-the-couple-that-dances-it.md) had just
cut for width, one field over. The consumer knows how wide anybody is. The engine knows what shape
the figure is. Neither can answer alone.

## Decision

**A couple carries `clearance` — how far apart its two dancers must be to pass each other — and a
figure whose dancers pass is built to deliver it.**

- `Couple.clearance`, supplied by whoever knows the bodies, defaulting to `width / 2`: **the arc's
  own radius**, which is exactly what the figure already gives. A consumer who knows nothing about
  bodies asks for nothing and gets, byte for byte, the figure they had before this existed.
- When the clearance is more than the radius, **the beau's arc bows outward** to deliver it. The
  bow rides *inside* the arc as `orbit`'s `lane` ([ADR-0013](0013-the-trade-lane-rides-inside-the-arc.md)),
  so it costs speed and not beats, and it is zero at both ends, so a dancer still starts and
  finishes on their standing spot.
- **The bow is the beau's alone.** The belle keeps stepping the diameter and going nowhere
  forward, which is what makes the figure a pass rather than a pair rotating.
- A clearance *smaller* than the radius asks for nothing. The bow is only ever outward; a narrow
  pair is not a licence to narrow the figure.

## Alternatives considered

- **Widen the couple.** Stand them further apart so the radius alone clears. Rejected by Ryan on
  the render: the pair's standing width is a handhold, not a free parameter, and it is already
  solved from the two bodies on the consumer's side.
- **Bow both dancers.** Symmetric and wrong for the same reason ADR-0014 rejected two dancers on
  one circle: the belle crossing the middle is the figure. Ryan, on the Trade — *"the belle should
  not move forward hardly at all in this, since that makes the beau have to move even farther
  out"* — is a statement about her path being the fixed one.
- **Let the consumer post-process the waypoints.** It has the bodies, so it could push people
  apart after the fact. Rejected: that is a second choreographer, and the two would disagree about
  beats, facings and momentum.
- **Give the engine bodies.** Rejected, unchanged, by ADR-0002. A clearance is one number a
  consumer measures; a body model is a second library.

## Consequences

- **A pinned defect becomes a number the consumer can fix**, rather than a comment. ADR-0014's 🔴
  stops being "the engine cannot know" and becomes "the engine was never told".
- **Every existing fixture and spec vector is untouched**, because the default clearance *is* the
  radius and the bow is exactly zero there. That is what makes this safe to land under a suite
  written entirely against the body-agnostic couple.
- 🔴 **`orbit`'s `lane` gets its consumer back.** It lost the only one it had when ADR-0014 deleted
  the Trade lane, and it has been a deletion candidate since. It is now the mechanism the whole of
  this decision rests on.
- 🔴 **The engine can now be asked for something it cannot deliver.** Nothing here bounds the bow,
  and a clearance close to the couple's own width demands an enormous one. What that costs, and
  where it stops, is [ADR-0018](0018-the-arch-needs-a-hands-room-between-two-heads.md) — which is
  also where the *arch* turns out to need a different number from this one.
- **Promotion condition:** if a second figure needs a clearance its own shape cannot deliver by
  bowing one dancer, the bow is the wrong mechanism and the figure should say so in a new ADR
  rather than growing a second parameter here.
