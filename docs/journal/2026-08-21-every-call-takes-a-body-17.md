# 2026-08-21 — every call takes a body

_Documents the generalisation chunk: [ADR-0020](../adr/0020-every-call-is-sized-to-the-bodies-that-dance-it.md)
(every call is sized to the bodies that dance it) and
[ADR-0021](../adr/0021-a-body-widens-a-figure-and-never-narrows-it.md) (a body measurement widens a
figure and never narrows it), landed in `8d436cd` together with entry 18's ADR-0022. Nothing on screen
changes by default, and the watches this opens are named at the end._

Ryan, looking at the arch:

> we've got california twirl working great and allowing for head and arm and body where beau path
> is pushed out but we need to generalize that to all the moves we have created — make sure they
> all allow for varying body, head and arm and handhold where necessary

The seam was three ADRs old and reached two calls. Everything the last four entries are about —
a couple's width, its clearance, its arch clearance, the bow that delivers them — lives on
`Couple` and is read by `chainsAt`, which Partner Trade and California Twirl declare and nothing
else does. Dosado, Pass Thru and Allemande Left were drawn at constants.

## The lever the other three had was the floor

Not "no lever". A consumer with a wide pair could already give them room in a Pass Thru: make the
whole square bigger. That is what the-lot does, and its own comment is the honest version —

> whole-square breathing done coarsely — the neediest pair sets the spacing for everyone, even in
> moves that don't involve them

The scale is derived by dividing the room a pair needs by `2 × ENGINE_LANE_OFFSET`, where
`ENGINE_LANE_OFFSET = 0.15` carries the comment *"mirrors `LANE_OFFSET` in the engine's `pass`
block"*. A private constant in this repo, copied by hand into another one, kept in step by
somebody remembering to — and the only place a body could touch three of the five calls.

Both halves of that are fixed by the same move. The blocks take the measurement, and the constants
they are drawn with are exported, because **a floor a consumer has to beat is part of the contract
rather than an implementation detail**.

## The fourth measurement was missing, and it is the arms

Width, clearance and arch clearance are a handhold, a body and a head. Ryan's list has four things
in it, and the fourth is what decides how wide an arm turn is: two dancers gripping forearms stand
where their arms put them. `gripRadius` is that, and an Allemande Left is now the one call in the
catalog sized by something that is not a clearance.

That distinction turned out to matter more than a field. Everything else here is **room a figure
has to find** — pass at least this far apart — and the safe reading of a small number is to ignore
it. A grip radius is a **placement**: it is where two people's hands actually are, and ignoring a
small one draws a circle the pair cannot reach. So ADR-0021 has exactly one exception, and it is
the whole reason that rule is a decision rather than a clamp.

## The generalisation had to leave the output alone

The claim "every call is sized to its dancers" is worth nothing if the calls came out different.
So the shape of the change is: a measurement is spread into a block's params **only when it asks
for more than the block's own default**, which is `beauHalf`'s idiom from ADR-0016 generalised into
one `sized()` helper. `chainAt(DEFAULT_PAIR_SHAPE)` therefore emits the hand-written chain,
argument for argument.

All 193 existing tests passed unchanged, and not one spec fixture moved. That is the only evidence
worth having that a generalisation did not quietly become a change, and it is asserted rather than
observed — `test/shape.test.ts` pins the three static chains and then pins that `chainAt` at the
default shape equals them.

## Two things fell out that nobody was looking for

**`turn-under` had been reporting the wrong handhold since `arch` existed.** Its own first line is
*"two dancers with joined hands rotate about them, one passing beneath the other's raised arch"*
and its grip span said `forearm` — a hold at elbow height, on a figure defined by walking under it.
The value was written before ADR-0017 added `arch` to `GripStyle` and nothing caught it, because
this block has never had a consumer. It is a parameter now, defaulting to `arch`. **A block with no
consumer is a block whose defects are still there.**

**A couple's fourth measurement joined the carried side of `reformCouple` before it had a
reader.** ADR-0019's whole lesson was that a field with a producer and no consumer sits wrong
quietly, and that clearance was dropped at a call boundary on the day it got its first one. So
`gripRadius` went into that argument list in the same commit it was invented in, with the test
beside it, rather than waiting to be found missing.

## What is not done

Nothing on screen changes. The engine now *accepts* the four measurements for every call; the-lot
supplies two of them, for one formation, and its hands-free clearance is deliberately withheld
pending a render watch that ADR-0018 named and this chunk did not take. Switching any of the new
ones on is a look, not a number:

- **the-lot passing the pair calls a clearance** would open a Pass Thru's lane and could stop the
  square scaling itself up for one wide dancer. Both are figures Ryan has watched and accepted at
  the current spacing.
- **the-lot measuring a grip radius** would make an Allemande Left's circle the cast's own. It has
  `armMetrics` and has never needed this number.
- 🔴 **the-lot cannot import the new exports until square-one is tagged.** Its dependency is
  `github:randallard/square-one#v0.2.0` and only the local symlink makes today's build work.
