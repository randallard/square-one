# 2026-08-18 — a California Twirl is a Partner Trade holding on

_Documents `bd93203`. Landed 2026-08-18 after Ryan watched it: "looks pretty good."_

_The Trade rewrite it sits on top of landed in the same session as `813be1f` (ADR-0014) and has
**no journal entry of its own** — this one is 15 and there is no gap left for it. What that chunk
was is in its ADR and its commit message; what is missing is the narrative, and it is owed._

Ryan, having watched the rebuilt Partner Trade and then the Twirl:

> partner trade looks good — california twirl beau might be same path but raise arm and have
> belle duck under the two held hands — belle's path might be the same as partner trade too —
> but she needs to start the turn to the left — ccw — and make it only a 180 degree turn — the
> way it's running now the belle is doing 540 degree turn cw

Four sentences, and the last one is the only complaint. The other three are the answer.

## The number he read off the screen was right, and it was the smallest of three problems

`m["belle"].momentum.rotation` was **−540**. The call was a rigid rotation of the pair about
their joined hands — both dancers diametrically opposite on a circle centred on the join,
facings turning with the body rather than following the path, and the belle carrying `spin: 1`,
a whole extra turn under a fixed arch, on top of the pair's shared −180.

The other two only show up once you ask *why* she was turning that much:

**The direction wound her arm up.** Her joined hand is her left, and she travels to her left.
Turning right through that carries her body away from her own held hand; turning left unwinds
it. The rigid-rotation model could not have this thought, because it never asked which way
anybody was travelling — the pair's shared rotation set both facings and the spin was added on
top of it. **A model that computes facing without reference to the path cannot be wrong about
the path, and cannot be right about it either.**

**And the figure had no clearance in it at all.** Held diametrically opposite at a constant
width, the two dancers never pass each other. `california-twirl.md` had written that up as a
*feature* — "nothing has to separate them, which shows the lane is a property of the figure" —
and it is the same defect ADR-0014 had found in the Trade the day before, wearing the opposite
disguise. There, two dancers in one lane. Here, two dancers who never approach because neither
crosses the floor between them. **Both were invisible for the same reason: the engine's
collision invariant is "no shared coordinate", and neither figure ever shared one.**

## The fix was to delete a figure, not to write one

`turn: "left"`, `spin: 0` would have made the number Ryan named come out right, and left the
other two alone. What he actually said is that the two calls are the same paths, and they are:

```ts
const EXCHANGE_CHAINS_AT = (hold?) => (width) => ({
  beau:  beauHalf(width, hold?.beau),   // orbit(right, 0.5, width / 2)
  belle: belleHalf(width, hold?.belle), // step-pivot(left, width, left, 0.5)
});

const TRADE_CHAINS_AT = EXCHANGE_CHAINS_AT();
const TWIRL_CHAINS_AT = EXCHANGE_CHAINS_AT(TWIRL_ARCH);
```

That is the whole of ADR-0017. Two calls, one figure, and the difference is one argument.

**And the source had said so all along.** `moves.md`: *"the lady walks forward and under the
arch while the gent stays in place or steps through."* She walks; he goes round. That is the
Trade's two halves. The rigid rotation was read *into* it in August, from the end state and
from "the hands stay joined", and it survived two builds and a passing equivalence test.

## The thing worth keeping

**A declared equivalence is a place to look for a duplicate.** Partner Trade and California
Twirl were confirmed equivalent on 2026-08-15 — the first member of ADR-0004's equivalence
suite, and the suite's first *result* is that one of its two members was a second copy of the
other's geometry. The test proved they ended in the same place, which is exactly the claim that
is true both when two figures are genuinely different and when they are the same figure.

The replacement compares **every waypoint of both dancers**, position and facing. It is the
stronger claim and it is the one that could have caught this in August: an equivalence test
passes on two different figures by design, so it can never tell you that you have written one
figure twice.

Same shape as the week's other recurring find in the-lot — *what is the renderer actually
drawing, and is that what I measured?* Here: **what is the test actually claiming, and is that
what I believe?**

## And a hold is not a spin

The extra turn existed to get a dancer around a **fixed** arch. Once the arch travels with the
beau there is nothing to get around, and the whole of "the belle turns under" is that she steps
across while his hand is over the middle of her path. Nothing in the call turns anyone more
than exchanging places turns them.

`GripSpan.grip` gains `arch` beside `forearm` to say it — palms joined and raised clear of the
head, high enough to walk beneath. `orbit` and `step-pivot` gain an optional `hold`, which emits
the span and sets `lastHand` and **moves no waypoint**; both blocks assert that directly, because
it is the load-bearing claim under the call spec's waypoint-for-waypoint comparison.

## What this leaves

- 🔴 **`turn-under` has no consumer.** It was ADR-0005's showcase — "California Twirl, Star Thru
  and Box the Gnat are all this block with different parameters" — and the one call that used it
  does not. The bet is open again rather than lost: **Star Thru** is from a facing pair, where
  the two dancers genuinely do rotate about their joined hands, and it will settle whether the
  arch family has a block or the arch is a hold on figures we already have.
- 🔴 **the-lot cannot draw an arch**, and has been left honest rather than approximate: it reports
  the span and does not pose it. Routing it to the forearm grip would draw an Allemande. The
  reason it is a decision and not a fallback is that **every hold that module can pose is built
  on its ADR-0027 — the humerus of a *hanging* arm stays in the plane of its own shoulder** —
  which is the right anatomy for a couple standing hand in hand and the wrong one for a raised
  arch. Until then a Twirl renders as the Trade it is geometrically identical to.
- **How high the arch is, is not in this engine.** It is a body measurement and this library has
  no bodies (ADR-0002). "Clear of the head" is the contract, exactly as `COUPLE_WIDTH` is a
  body-agnostic default a consumer overrides.
- **Fourth correction to this call.** The ending formation and the "illustrative" path sketch
  were both caught on paper. The paths themselves were caught by Ryan watching a dancer turn one
  and a half times in four beats.
