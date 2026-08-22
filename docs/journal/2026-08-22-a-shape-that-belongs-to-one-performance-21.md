# 2026-08-22 — a shape that belongs to one performance

_Documents [ADR-0025](../adr/0025-a-sequence-can-size-each-call-to-its-own-shape.md), landed in
`c0ee981` on **2026-08-21**. Written the next morning: the chunk shipped the ADR and the code and
did not stop to write this, and the entry went unlisted rather than owed, which is worse. The
day's other lesson was that a stale backlog is read as the current state — an entry nobody wrote
down as missing is that same failure with the evidence removed._

## What the couple's shape was allowed to be

[ADR-0015](../adr/0015-a-call-is-sized-to-the-couple-that-dances-it.md) sized a call to the couple
dancing it. [ADR-0019](../adr/0019-a-couples-clearances-are-carried-across-a-call-boundary.md)
carried those measurements across boundaries so a sequence keeps them. Both treat a couple's shape
as a **constant of the sequence**, and both are right about that, because a shape is a fact about
bodies and dancers do not change size between calls.

What they quietly also assumed is that the shape is a fact about bodies *only*.

townage draws an accommodation every time a pair meet a hold they cannot make — reshape, or reach
and let go, at even odds per execution. The two want very different room: **0.193** of the couple's
width against **0.951**, five times apart. With one shape per sequence the consumer had two moves,
and both are bad. Size every arch to the worse of the two, which is what it did — so the beau bowed
for a break he had usually not drawn, on every Twirl. Or let the figure disagree with the pose,
which is a clip waiting to happen.

Neither is a bug in this library. The library simply had no way to be told *"for this one call,
they are standing like this."*

## The asymmetry is the whole decision

`ShapeAt` is four lines of type and not much more of code:

```ts
type ShapeAt = (index: number, call: CallName) => Partial<FigureShape> | undefined
```

The part worth an entry is what happens at the **boundary**. The couple that comes out of an
overridden call is reformed from the couple that went **in** — never from the overridden one. An
accommodation cannot outlive the execution it was drawn for.

Get that backwards and a pair who reshaped once dance every later call as though they had, which
is ADR-0019's bug exactly, one field over. It was tempting to let the override flow through,
because *carrying things forward* is what `reformCouple` is for and the code path was already
there. The distinction that settles it: ADR-0019 carries **measurements of dancers**, and an
override is not one. It is a fact about one performance of one call.

## What I nearly did instead

Take a `readonly Couple[]`, one per step. More general, and worse — a caller could change who the
beau is, or move the couple's centre, halfway through a sequence, and then `reformCouple`'s
measured width would be arguing with an asserted one. `Partial<FigureShape>` is exactly the
measurements a chain may read ([ADR-0020](../adr/0020-every-call-is-sized-to-the-bodies-that-dance-it.md))
and nothing else, which makes the override unable to express anything the engine would then have
to referee.

The other one I turned down was putting the accommodation *here*. It is a fact about bodies, and
this library has none ([ADR-0002](../adr/0002-pure-library-no-storage-no-ui.md)). Being told a shape and
sizing a figure to it is the whole job.

## One call is now two figures, deliberately

🔴 **Two executions of the same call can differ from each other for the first time**, and every
test that assumed otherwise had been right up to this commit. `isCoupleZero` still holds, because
an override changes the figure **between** the ends and not the ends themselves — asserted now
rather than assumed.

The hazard rides along with it: a consumer can make a sequence non-deterministic. That is the
point of the feature and it is still a hazard for that consumer's own suite. townage's fixes the
draw; the scene does not, which is what makes two Twirls in a row look like two Twirls in a row.

## The number this bought did not survive the day

Worth recording beside the ADR rather than inside it. ADR-0025 let townage's reshaped Twirl pass at
**0.685** of the couple's width instead of 0.951 — and then its own ADR-0038 found the **arm** in
the gap that the break's low join had been paying for by accident, and the reshape went back to
**0.897**.

So the saving was mostly an omission, and removing the cover is what exposed it. The mechanism is
untouched by that: the figure follows the draw, which is the thing that was impossible yesterday.
What shrank is how much of the difference the beau's **bow** carries — the reshaping torsos still
show it plainly. Whether the bow *should* carry more is Ryan's question and a new one.
