# ADR-0025: A sequence can size each call to its own shape
- Status: Accepted
- Date: 2026-08-21
- Deciders: Ryan, Claude

## Context

[ADR-0015](0015-a-call-is-sized-to-the-couple-that-dances-it.md) sized a call to the couple that
dances it, and [ADR-0019](0019-a-couples-clearances-are-carried-across-a-call-boundary.md) carried
those measurements across call boundaries so a sequence keeps them. Both treat a couple's shape as
a constant of the sequence, because it is a fact about **bodies** and dancers do not change size
between calls.

They do change what they are *doing*. townage draws an **accommodation** each time a pair meets a
hold they cannot make — they reshape, or they reach and let go, at even odds per execution (its
ADR-0028) — and the two need very different room: on its shipped cast a reshape wants **0.193** of
the couple's width and a break wants **0.951**, five times more.

With one shape per sequence the consumer's only options were to size every arch to the worse of
the two, which is what it did (its ADR-0030), or to let the figure disagree with the pose. So the
beau bowed for a break he had usually not drawn, on every Twirl he danced.

Ryan, on the pair who cannot make an arch at all:

> so do what we did with the california twirl — sometimes myco gets smaller and sprout gets
> bigger, and sometimes they just reach as far as possible but don't connect — make this a rule

Making it a rule requires the figure to follow the draw, and the draw is per call.

## Decision

**`danceCoupleSequence` takes an optional `ShapeAt` — a per-step shape override.**

```ts
type ShapeAt = (index: number, call: CallName) => Partial<FigureShape> | undefined
```

It replaces whatever it names for **that call only**. The couple that comes out is reformed from
the couple that went **in**, never from the overridden one, so an accommodation cannot outlive the
execution it was drawn for.

That asymmetry is the decision's whole content. A shape override is not a measurement of the
dancers — it is a fact about one performance of one call — and ADR-0019's rule that clearances are
carried forward is about the former. Letting an override leak into the couple that leaves would
make a pair who reshaped once dance every later call as though they had, which is the shape of the
bug ADR-0019 fixed, one field over again.

## Alternatives considered

- **Let the consumer call `applyCallToCouple` per step and run the boundary itself.** It works and
  it moves `reformCouple`'s rules — measure the width, carry the clearances — out into every
  consumer's loop, where each can forget them differently. `danceCoupleSequence` exists precisely
  so nobody has to.
- **Put the accommodation in the engine.** It is a fact about bodies, and this library has none
  (ADR-0002). The engine's job is to be *told* a shape and size a figure to it.
- **Take a `readonly Couple[]`, one per call.** More general and worse: a caller could change who
  the beau is, or move the couple's centre, halfway through a sequence — and then `reformCouple`'s
  measured width would be arguing with an asserted one. A `Partial<FigureShape>` is exactly the
  measurements a chain may read (ADR-0020) and nothing else.
- **Rebuild the sequence per accommodation and pick.** What a consumer would have to do without
  this, and it costs a whole sequence per draw.

## Consequences

- **The figure can match the draw.** townage sizes each arch to the accommodation that execution
  actually drew, so a reshaped Twirl bows for a reshape: its beau's pass goes from 0.951 of the
  couple's width to **0.685**, on every Twirl the pair reshape.
- 🔴 **Two executions of one call can now differ, and every test that assumed otherwise was
  right until today.** `isCoupleZero` still holds — an override changes the figure between the
  ends, not the ends — and that is asserted rather than assumed.
- 🔴 **A consumer can now make a sequence non-deterministic**, which is the point and is also a
  hazard for its own tests. townage's suite fixes the draw rather than seeding it.
- **Nothing changes for a caller who passes nothing**, which is every caller in this repo's tests
  and every one before today.
- **Promotion condition:** if an override ever needs to *persist* — a dancer who is genuinely
  reshaped for the rest of a sequence rather than for one call — that is a change to what
  `reformCouple` carries, and it belongs in a new decision beside ADR-0019 rather than here.
