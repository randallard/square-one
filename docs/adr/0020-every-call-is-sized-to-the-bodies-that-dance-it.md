# ADR-0020: Every call is sized to the bodies that dance it
- Status: Accepted
- Date: 2026-08-21
- Deciders: Ryan, Claude

## Context

Ryan, after watching the arch work:

> we've got california twirl working great and allowing for head and arm and body where beau path
> is pushed out but we need to generalize that to all the moves we have created — make sure they
> all allow for varying body, head and arm and handhold where necessary

The seam exists and it reaches two calls. [ADR-0015](0015-a-call-is-sized-to-the-couple-that-dances-it.md)
gave `CallDef` a `chainsAt(CoupleShape)` so a couple's chains are built at the width the pair are
actually standing at; [ADR-0016](0016-a-couple-carries-the-clearance-its-bodies-need.md) added the
clearance the bow is solved against; [ADR-0018](0018-the-arch-needs-a-hands-room-between-two-heads.md)
added the arch clearance. All three live on `Couple`, and `chainsAt` is declared only on Partner
Trade and California Twirl.

The other three calls are drawn at constants:

| call | what a body would change | what it actually used |
|---|---|---|
| Dosado | the lane the two of them pass in | `LANE_OFFSET` 0.15, each way |
| Pass Thru | the same lane | `LANE_OFFSET` 0.15, each way |
| Allemande Left | the circle two joined forearms hold them on | `ORBIT_RADIUS` 0.3 |

So a consumer with real dancers could size two calls out of five, and for the other three had
exactly one lever: **make the floor bigger**. That is what the-lot does, and its own comment is the
honest description —

> whole-square breathing done coarsely — the neediest pair sets the spacing for everyone, even in
> moves that don't involve them

— derived, in `minScaleForGap`, by dividing the room a pair needs by `2 × ENGINE_LANE_OFFSET`: a
hand-copied duplicate of a private constant in this repo, kept in step across two repositories by
somebody remembering to. One wide pair pushes the whole square apart, in every call, whether or not
they are in it.

There is also a fourth measurement with nowhere to go. Width, clearance and arch clearance are a
handhold, a body and a head; **an arm** is not among them, and an arm is what decides how wide an
arm turn is.

## Decision

**Every call in the catalog declares how it is sized to the dancers, and the four measurements it
may read are named, complete, and carried by any formation.**

Three parts, one decision:

1. **`FigureShape`** — `width`, `clearance`, `archClearance`, `gripRadius` — is the whole vocabulary
   a chain may depend on, moved out of `couple.ts` (where it was `CoupleShape`) into `shape.ts`,
   because a facing pair dances a Dosado and a facing pair is not a couple. `gripRadius` is new: how
   far a joined forearm holds a dancer off the shared pivot, which is the **arm** the list was
   missing. A `Couple` *is* a `FigureShape` plus a place to stand, so every call sized against a
   shape can be sized against a couple.
2. **`CallDef.chainAt(shape)`** is `chainsAt`'s position-independent counterpart, and every call now
   has one or the other. `chainsAt` wins where a call has one, because only it can say what the two
   sides of a couple do differently; `chainAt` is what lets a couple dance a Pass Thru at their own
   clearance instead of at the body-agnostic lane.
3. **The blocks take the measurement, not the figure.** `pass` gains `clearance`, `slide` gains
   `distance`, `arm-turn` gains `gripRadius` and `standoff`, and `turn-under` gains `grip` — the
   handhold, which it had been reporting as `forearm` for a figure whose own first line calls it an
   arch. Each defaults to the constant it has always used, and those constants are now **exported**,
   because a floor a consumer must beat is part of the contract rather than an implementation
   detail.

Beats are untouched at every size. A wider pass is a longer stride inside the chart's timing, the
way [ADR-0013](0013-the-trade-lane-rides-inside-the-arc.md)'s bow rides inside the arc and
[ADR-0014](0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md)'s step rides inside its
rotation.

## Alternatives considered

- **Keep scaling the floor.** It works, it is one number, and it is what ships today. It loses
  because it is not local: the accommodation belongs to the pair that needs it, and spending it on
  the whole square is what makes a mixed square dance loose. It also cannot express an arm at all —
  scaling the floor moves where dancers stand, not where their hands meet.
- **Put the measurements on the blocks' callers and leave `CallDef` alone.** That is a consumer
  assembling chains by hand, which is precisely what the catalog exists to stop. A call is a
  checkable chain of parameterised blocks ([ADR-0005](0005-building-blocks-first-class.md)) and the
  parameterisation has to be the call's own.
- **One shape per formation — a `PairShape` beside a `CoupleShape`.** Rejected as a distinction
  without a body. Clearance, arch clearance and grip radius are the same facts about the same
  people in either formation; only `width` is formation-flavoured, and a facing pair's separation
  is a *frame* fact rather than a body one, so it is deliberately not a field. Two nearly-identical
  types would have to be kept in step for one field that does not belong to either of them.
- **Let `shape.width` supply an `arm-turn`'s standoff.** Tempting — the standoff is `0.5` and a
  facing pair stands `1` apart — and wrong, because `width` is a *couple's* handhold span. Feeding
  it in would make an Allemande danced by a couple step in from `COUPLE_WIDTH / 2`. The standoff
  stays the pair frame's own half unit and is a block parameter, not a shape field.

## Consequences

- **A consumer can now accommodate a pair inside the figure they are dancing**, for every call in
  the catalog, without moving anybody else. What the-lot decides to switch on is a render watch and
  not a number — its hands-free clearance has been deliberately withheld since ADR-0018 for exactly
  that reason, and this decision does not change it.
- **The default instantiations are byte-identical.** `chainAt(DEFAULT_PAIR_SHAPE)` emits the
  hand-written chain, argument for argument, because a measurement is spread into the params only
  when it asks for more than the block's own default. Not one spec fixture moved and all 193
  existing tests passed unchanged, which is the only evidence worth having that a generalisation
  did not quietly become a change.
- 🔴 **`Couple` now has one field that is measured and three that are carried.** ADR-0019 noted this
  for two; `gripRadius` joins the carried side for the same reason, and the type still does not say
  which is which. `reformCouple` is the single place that knows, and it is asserted per field.
- 🔴 **A shape that a call does not read is silently ignored.** A consumer passing an arch clearance
  to a Dosado gets a Dosado. That is correct — a Dosado has no arch — but it means "I passed the
  number" is not evidence the number was used, which is the failure mode ADR-0019 was made of.
  Measure the figure, not the argument.
- **Promotion condition:** the four measurements are complete for the calls that exist. Star Thru
  needs an arch height, Right and Left Grand needs a palm-grip distance, and a wave needs a
  hand-to-hand span — each is a fifth field, and each should arrive with the call that reads it
  rather than in advance, because a field with no consumer is how ADR-0016's clearance sat wrong
  for two days.
