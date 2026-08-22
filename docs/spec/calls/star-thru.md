# Star Thru

_Status: **draft, for review** (2026-08-21). No code yet — this is the talk-first artifact
(ADR-0009): the derivation, the two things it forces, and the two questions only Ryan can settle.
Nothing in `src/` implements this call and the catalog does not list it._

The call the catalog has been pointing at since [ADR-0005](../../adr/0005-building-blocks-first-class.md).
It is named in three places as the thing that settles an open question, and it settles more than
one.

## Identity

CALLERLAB Basic. **Starting formation: facing dancers** (a man facing a lady). The man raises his
right hand and the lady her left, joining palms; using that handhold as a pivot the man quarter
turns **right** while the lady quarter turns **left**, going under the joined hands. They finish
**side by side as a couple**, facing 90° from the direction they started.

**4 beats**, per the timing chart — the same as a Partner Trade and a California Twirl.

## What makes it the call the engine has been waiting for

Three firsts, and they are why this file exists before any code does.

1. **It changes formation.** Every call in the catalog starts and ends in the formation it began
   in. This one consumes a **facing pair** and produces a **couple**, and the pair's separation
   goes from `1` to `COUPLE_WIDTH`. `applyCallToPair` and `applyCallToCouple` are both the wrong
   shape for it.
2. **It is the call ADR-0012 was written for**, and the one that ADR still lists as not
   expressible: *"`applyCallToPair` derives dancer B as A rotated 180°, so B's exit facing is
   always A's + 180°, and Star Thru ends both dancers facing the same way. Position-dependence is
   the vocabulary that call needs; the pair model is the machinery, and it is the next thing."*
3. **Its two dancers turn in opposite directions.** Not a mirror of one path, not a rotation of
   the pair — genuinely two figures, distinguished by which of them goes under.

## The derivation

Pair frame: **A** at `(0, −0.5)` facing `+y` (90°), **B** at `(0, +0.5)` facing `−y` (270°).

**Which hands.** The man's right and the lady's left. A dancer's right is their facing − 90°. If B
is the man, B's right points at 180° (`−x`); the lady A's left is 90° + 90° = 180° (`−x`) as well.
Both named hands are on the **same side**, which is what lets them join — and it is the only
assignment for which that is true. So in this frame **B is the man and A is the lady.**

**Which way they finish.** The man turns a quarter right: 270° − 90° = **180°**. The lady turns a
quarter left: 90° + 90° = **180°**. Both end facing `−x`, which is 90° from where each started and
the same as each other ✓.

**Where they finish.** A couple facing 180° has its belle at `+y` and its beau at `−y`
(`belleDirection`). The source says the gent is the **beau** and the lady the **belle**, so:

| dancer | starts | ends | turn |
|---|---|---|---|
| **A** — the lady, becomes the **belle** | `(0, −0.5)` facing 90° | `(0, +w/2)` facing 180° | +90° (left), **under the arch** |
| **B** — the man, becomes the **beau** | `(0, +0.5)` facing 270° | `(0, −w/2)` facing 180° | −90° (right) |

where `w` is `COUPLE_WIDTH`. **They swap sides**, which is the part that makes it a Star Thru and
not a pair of quarter-turns in place.

**How far each walks.** From `∓0.5` to `±w/2` is `0.5 + w/2` = **0.6667** at the default width, and
it is *straight along the dancer's own facing* — both displacements are pure forward travel in the
walker's local frame, with no lateral component at either end.

So each dancer **walks forward `(separation + width) / 2` while pivoting a quarter**, one left and
one right. That is a `step-pivot` with a forward component, mirrored — and it is the same shape
ADR-0014 found for a Trade's belle, one axis over.

## 🔴 The first thing this forces: `turn-under` has no consumer, and should go

[ADR-0005](../../adr/0005-building-blocks-first-class.md) bet that a block catalog makes later
calls cheaper, and `turn-under` — *"two dancers with joined hands rotate about them, one passing
beneath"* — was built as the arch family's shared block on the strength of that bet.
[ADR-0017](../../adr/0017-a-california-twirl-is-a-partner-trade-holding-on.md) took its first
consumer away when a California Twirl turned out to be a Partner Trade **holding on**: not a
rotation of the pair, but two ordinary paths with a hold. `turn-under`'s own spec has said since
that day that *"Star Thru now settles whether the arch family has a block or the arch is a hold on
figures we already have."*

**It settles it the same way.** The two dancers turn in **opposite** directions, so no rigid
rotation of the pair can produce this figure — which is exactly what `turn-under` models. Star Thru
is a `step-pivot` each, with an arch hold.

Two calls, both predicted to need that block, neither needing it. The honest conclusion is that
**the arch is a hold and not a block**, and `turn-under` should be deleted rather than kept waiting
for a third candidate. Its one live defect (it reported a `forearm` grip for a figure defined by
walking under it, fixed in ADR-0020) is the kind that only exists in code nothing calls.

## 🔴 The second thing it forces: they cross at three quarters, not halfway

Both dancers walk toward each other and end `w` apart rather than at the same spot, so the moment
they are **level** is not the middle of the call:

```
A.y = −0.5 + 0.6667·t        B.y = +0.5 − 0.6667·t
level when t = 1 / (2 · 0.6667) = 0.75
```

At `t = 0.75` their y-gap is **exactly zero**. In the engine's point model they occupy the same
place; with bodies they are a collision unless something holds them apart laterally — and that
something is the arch, with the lady passing under the join.

This is where the existing machinery does **not** transfer cleanly. `orbit`'s `lane` and the
couple exchange's solved bow are `sin²`, **peaking at the middle**, because for a Trade the pass
*is* the middle. Here the crossing is at three quarters, where `sin²` has fallen to half its peak —
so delivering an `archClearance` of `c` through that profile would cost a bow of `2c`, twice what
the figure needs, all of it spent in the wrong place.

## ⚠️ The two questions for review

1. **Where does the joined hand sit, and does the couple end on the pair's own line?** The
   derivation above puts the join at the pair's midpoint and the finished couple centred there, so
   a Star Thru leaves the pair's centre where it found it. That is the tidy answer. The *physical*
   answer may be that the join sits off to the named-hand side (`−x` here) and the couple finishes
   displaced toward it — which is a real Star Thru's "you end up over there" feel. **This changes
   where every subsequent call happens**, so it wants deciding before any geometry is written.
2. **What profile carries the lateral clearance?** Given the crossing is at `t = 0.75`, the
   candidates are: a `sin²` bow sized to deliver at 0.75 (simple, wasteful, peaks in the wrong
   place); a profile whose peak is placed at the crossing (right-looking, a new shape in the
   catalog); or **no bow at all** — the two dancers simply pass on opposite sides of the join
   because one is *under* it, and the clearance is vertical rather than lateral. The third is
   probably what a dancer would say, and it is the one the-lot cannot currently draw.

## Blocks, once the above is settled

| # | Block | Beats | Notes |
|---|---|---|---|
| 1 | [`step-pivot`](../blocks/step-pivot.md)`(side, distance, turn, 0.25, hold)` | 4 | **needs a `forward` parameter it does not have** — today it travels laterally only |

Beats sum to the chart's 4 ✓, and the quarter turn is 0.25 × the shared 8-beat rotation budget,
which is 2 beats — so the timing wants checking against the chart's own row rather than assumed
from the block.

## Not yet decided, and deliberately not guessed

- **Who says which dancer is the man.** ADR-0012 keys asymmetric calls off *couple* position, and
  a facing pair has none. The salvaged `moves.md` says *"the gent is the beau (left side of the
  resulting couple)"* — so the branch is on the **resulting** couple, and the caller supplies the
  arrangement exactly as `partnerUp` does. That is the shape this file assumes and it is not an
  ADR yet.
- **Whether `applyCallToPair` grows a formation-changing sibling** or the sequence layer learns
  that a call can hand back a different formation. S2's job, and the first call that makes it
  concrete.
