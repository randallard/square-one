# ADR-0017: A California Twirl is a Partner Trade danced holding on
- Status: Accepted
- Date: 2026-08-18
- Deciders: Ryan, Claude

## Context

Ryan, watching the two couple calls back to back, an hour after
[ADR-0014](0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md) landed:

> partner trade looks good — california twirl beau might be same path but raise arm and have
> belle duck under the two held hands — belle's path might be the same as partner trade too —
> but she needs to start the turn to the left, ccw, and make it only a 180 degree turn — the
> way it's running now the belle is doing 540 degree turn cw

The Twirl was built on 2026-08-15 as a **rigid rotation of the pair about their joined hands**:
both dancers on a circle of radius `width / 2` centred on the join, diametrically opposite for
the whole call, facings turning with the body rather than following the path, and the belle
carrying `spin: 1` — one whole extra turn under a fixed arch. Her accumulated rotation came out
**−540°**, which is the number Ryan read off the screen.

Three things were wrong with it, and only the third is about the arch.

**The 540° is a turn nobody dances.** The chart gives the call 4 beats. A dancer covering a
couple's width and a turn and a half in 4 beats is spinning, not walking under an arm.

**The direction winds the arm up.** Her joined hand is her left, and she travels to her left.
Turning *right* through that step carries her body away from her own held hand and wraps the
arm across her; turning left unwinds it. The rigid-rotation model could not see this, because
it never asked which way anything travelled — the pair's shared rotation set both facings and
the spin was added on top.

**And the figure had no clearance in it at all.** Held diametrically opposite at a constant
`width` apart, the two dancers never pass each other. The spec called that a feature —
*"nothing has to separate them, which shows the lane is a property of the figure"* — and it was
the same defect ADR-0014 had just found in the Trade, wearing the opposite disguise: there, two
dancers occupying the same lane; here, two dancers who never approach at all because neither
one crosses the floor between them.

Ryan's reading dissolves all three at once, and it is the reading the *source* has always
described. `moves.md`: *"the lady walks forward and under the arch while the gent stays in
place or steps through."* She walks; he goes round. That is the Trade's two halves, and the
only thing the arch adds is that they do not let go.

## Decision

**California Twirl is the couple's 180° exchange — the same two paths as a Partner Trade —
danced with the inside hands joined and raised into an arch. The hold is the whole difference
between the two calls.**

- The beau: `orbit(right, 0.5, width / 2, hold: right hand, arch)` — Partner Trade's arc,
  holding on.
- The belle: `step-pivot(left, width, left, 0.5, hold: left hand, arch)` — Partner Trade's step
  and pivot, holding on. 180°, counterclockwise.
- Both chains come from one factory, `EXCHANGE_CHAINS_AT`, whose only parameter is the hold. A
  reader who wants to know how the two calls differ reads one argument.
- `GripSpan.grip` gains **`arch`** beside `forearm`: palms joined and raised clear of the head,
  high enough to walk beneath. It is a second *style*, not a second grip mechanism — a
  renderer that drew `forearm` here would draw an Allemande.
- `orbit` and `step-pivot` gain an optional `hold`. Their hands-free emptiness stays the
  default and stays a positive F2 fact; a hold is the exception, stated by the figure.

**The arch is a hold, not a spin.** Nothing in the call turns a dancer more than the exchange
itself turns them. The extra turn was the old model's way of getting a dancer round a fixed
arch; with the arch travelling with the beau there is nothing to get round.

## Alternatives considered

- **Keep the rigid rotation and fix only the belle's turn** — `spin: 0`, `turn: "left"` for
  her. It fixes the number Ryan named and leaves the figure with no clearance and both
  dancers walking sideways, since a rigid rotation's facings are not tangent to its paths.
  Correction 1 in `california-twirl.md` rejected rigid rotation for a couple on 2026-08-15 for
  exactly that reason, and then the Twirl was built as one anyway.
- **A `turn-under` with the Trade's paths baked in.** That is two blocks' worth of geometry in
  one block, and it would have the catalog holding two descriptions of the same arc.
- **Make them one call with two names.** Rejected: F2 can tell them apart. A Trade finishes
  with both hands free and flows into anything; a Twirl finishes holding the inside hand. A
  caller substituting one for the other inside a phrase is doing something real.
- **Model the arch's *height* in the engine.** Rejected — it is a body measurement, and this
  library has no bodies (ADR-0002). "Clear of the head" is the contract; how high that is
  belongs to the consumer that knows how tall anybody is, exactly as `COUPLE_WIDTH` does.

## Consequences

- **The declared equivalence with Partner Trade becomes an identity of paths.** It was the
  first member of [ADR-0004](0004-starter-scope-zero-box-triple.md)'s equivalence suite, and
  the suite's first result is that one of its members was two calls' worth of geometry for one
  figure. The test is strengthened accordingly: it compares every waypoint of both dancers,
  not the end states, so it can no longer pass on two different figures.
- **The catalog's three-way difference table collapses to one row.** Hands. The rotation row
  (*"same sense, different magnitude"* against *"opposite senses, equal magnitude"*) and the
  beats row were both describing defects that are gone.
- 🔴 **`turn-under` loses its only consumer.** It keeps its spec, its worked examples and its
  conformance vectors, because it was built for **Star Thru** and **Box the Gnat** as much as
  for this call and [ADR-0005](0005-building-blocks-first-class.md)'s bet is being tested on
  exactly that. But the bet is now open rather than won: the one call that used it does not,
  and Star Thru is what will settle whether the arch figure is a block or a hold. Same status
  `orbit`'s `lane` has carried since ADR-0014, and the same rule applies — if neither arrives,
  it is a candidate for deletion.
- 🔴 **The consumer has to draw a hold it has never drawn.** the-lot renders `forearm` grips
  and infers a standing couple's plain handhold from the live placements; an arch is neither.
  Until it does, a California Twirl and a Partner Trade are the same thing on screen — which
  is a true statement about the engine and a wrong one about the dance.
- **The belle's clearance arrives with the figure.** She passes the beau at `width / 2`, the
  same separation ADR-0014 gave the Trade, and it comes from the shape rather than from a
  parameter. The same 🔴 pinned in ADR-0014 applies unchanged: half the couple's width does not
  clear the heads on the size-extreme casts.
- **Fourth correction to this call, and the third found by looking at a render.** The first two
  were the ending formation and the "illustrative" path sketch; both were caught on paper. The
  paths themselves survived two builds and a passing equivalence test, and were corrected by
  Ryan watching a dancer turn one and a half times.
