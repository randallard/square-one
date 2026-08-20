# California Twirl

A couple turns around under a raised arch, ending facing the opposite direction with the two
dancers on each other's sides.

Planning ADR-0011's S1.

## 🔴 The salvaged source is wrong about the ending, and Ryan corrected it

`mix-a-hoot-n-hollar/docs/moves.md` records:

> **Ending formation:** Couple facing the same direction, lady and gent sides swapped.

**The facing reverses.** Ryan, 2026-08-15: *"California twirl does change direction facing."*
That is what the call is *for* — it is the standard way to turn a couple around.

Kept visible rather than silently corrected, because
[ADR-0009](../../adr/0009-spec-markdown-is-the-conformance-fixture.md) makes these specs the
fixtures and [ADR-0001](../../adr/0001-typescript-provable-lite.md)'s salvage is a source
rather than an authority. This is the third error the salvage has produced; the pattern is
worth more than any one correction.

🔴 **And on 2026-08-18 the salvaged *description* turned out to be wrong too** — it has the
belle turning **CW**, and she turns CCW. The sentence below that used to read "the salvaged
description is retained below and is believed correct, only the ending formation line was wrong"
is kept as an example of how that belief reads right up until it fails. The description is
retained, and it is a source rather than an authority; see **Dance action** for the correction
and [ADR-0017](../../adr/0017-a-california-twirl-is-a-partner-trade-holding-on.md) for why.

## Identity

| Field | Value |
|---|---|
| Canonical name | California Twirl |
| Spoken variants | California Twirl; (historically) Frontier Whirl |
| Legacy app abbreviation | `catw` (from `moves.md`) |
| Program | Basic Part 1 |
| Position dependence | **Yes** — the beau walks round, the belle steps across under the arch. First call in the catalog to set `positionDependent` |

## Formations

| | |
|---|---|
| **Start** | A couple — beau on the left, belle on the right ([ADR-0012](../../adr/0012-calls-key-off-couple-position-not-role.md)) |
| **End** | A couple facing the **opposite** direction, each dancer standing where the other started |

## Timing

| Situation | Beats |
|---|---|
| From a couple (point of contact) | **4** |

## Dance action

Salvaged from `moves.md`, translated out of gendered terms per ADR-0012 with the original kept
alongside:

> **Original:** "Gent raises a joined right–left hand arch; the lady walks forward and under
> the arch (turning CW from her perspective) while the gent stays in place or steps through.
> They end side-by-side, having reversed which side each dancer is on."

**Positional:** the **beau** raises the joined inside hands into an arch and walks forward round
the belle; the **belle** steps across under the arch, turning 180° to her own left. They end side
by side, on each other's former sides, facing the opposite direction.

🔴 **The translation says *left* where the original says CW, and that is a second correction to
the salvage, not a translation slip.** Ryan, 2026-08-18, watching it turn the other way: *"she
needs to start the turn to the left — ccw — and make it only a 180 degree turn. The way it's
running now the belle is doing 540 degree turn cw."* Her joined hand is her **left** and she
travels to her **left**; turning right through that step wraps the arm across her body, turning
left unwinds it. See [ADR-0017](../../adr/0017-a-california-twirl-is-a-partner-trade-holding-on.md).
The original stays above because the translation is the substantive work ADR-0012 asks for, and
it is where an error would hide — as one just did.

## What it is, geometrically

The couple ends where a 180° rotation about its own centre would put it: both dancers in the
other's spot, both facing reversed.

🔴 **The paths are a [Partner Trade](partner-trade.md)'s, exactly — and that is now the whole
account of the figure** (ADR-0017). The beau walks one forward semicircle round the belle, on the
circle the couple is standing on. The belle steps the couple's whole width to her left, pivoting
180° left through the step, going nowhere forward. What the hands are doing is the only thing
that distinguishes this call from that one.

**Because his hand is over the middle of the diameter she crosses, her step across *is* the duck
under.** Nothing has to be arranged for it. That is the sense in which the arch is a **hold**
rather than a figure: the dancers are not doing anything they would not do without it.

## Position dependence, concretely

| | beau | belle |
|---|---|---|
| Hands | Raises the joined inside hands; keeps the grip | Passes under, keeps the grip |
| Path | One forward semicircle round the belle, on the couple's own circle | A step the couple's whole width to her left, going nowhere forward |
| Own rotation | 180° CW, tangential — he is walking forward | 180° CCW, pivoting through the step |

This is the first call for which `positionDependent` is `true`, and therefore the first real
use of the vocabulary ADR-0012 introduced.

## Block composition

Rebuilt 2026-08-18 (ADR-0017). Per position, one block each — the Partner Trade's own two, with a
`hold`:

| Position | Block | Beats | Exit |
|---|---|---|---|
| beau | [`orbit`](../blocks/orbit.md)`(right, 0.5, width / 2, lane, hold: right / arch)` | 4 | the belle's spot, facing reversed, having carried the arch round |
| belle | [`step-pivot`](../blocks/step-pivot.md)`(left, width, left, 0.5, hold: left / arch)` | 4 | the beau's spot, facing reversed, having stepped under the arch |

Both come from one factory in `calls.ts`, whose only parameter is the hold. A reader asking how
the two couple calls differ reads one argument.

**`width` is the couple's own**, not `COUPLE_WIDTH` — the chains are instantiated at the engine's
body-agnostic default for the workshop and the fixtures, and re-instantiated at the width of the
pair actually dancing.

### The hold

`GripSpan.grip` has a second style, **`arch`**: palms joined and raised clear of the head, high
enough to walk beneath. It is not `forearm` — a renderer that drew the arm-turn grip here would
draw an Allemande — and it is not a plain side-by-side handhold, which is not something a call
engages but what being a couple *is*.

**How high the arch is, is not in this engine.** It is a body measurement, and this library has
no bodies (ADR-0002). "Clear of the head" is the contract; the consumer that knows how tall
anybody is works out the rest, exactly as it does for `COUPLE_WIDTH`.

### The arch needs more room than the bodies do — 2026-08-19

🔴 **The two calls are the same figure and they are not the same size** ([ADR-0018](../../adr/0018-the-arch-needs-a-hands-room-between-two-heads.md)).

With hands free, two dancers passing have to clear each other. With hands joined and raised there
is a **joined hand up in the gap as well**, at head height — where a head is the widest thing
either of them has — and it belongs to neither dancer, so neither dancer's own width accounts for
it. The room a Twirl's pass needs is strictly more than the room a Trade's does, out of the same
two bodies.

The couple carries both numbers, and the figure picks by its hold: `hold?.grip === "arch"` reads
`archClearance`, anything else reads `clearance`. The hold already says which call this is, so
nothing is told twice and the two chains stay one factory with one parameter.

Measured in the-lot, in world units, against a couple who stand **1.140** apart:

| what has to fit through the gap | wants |
|---|---|
| two torsos, side by side | 0.520 |
| two heads | 0.710 |
| two heads with a joined hand between them | **1.084** |

`orbit`'s `lane` is what delivers it — the bow rides inside the arc, so a wider pass costs speed
and not beats, and a dancer still starts and finishes on their own standing spot. Two properties of
that bow are not obvious and are load-bearing:

- **It is solved, not computed.** `wanted − radius` is exactly right for the separation *at* the
  pass and wrong for the figure: the lane is `sin²` and the belle crosses at a constant rate, so a
  large bow makes them nearest each other on the **way** to the pass. On this cast the arithmetic
  left the closest approach 3% short.
- **It is capped at one couple-width.** At both ends of the call the two dancers are on their
  standing spots, so the separation there is exactly the couple's width whatever the bow does in
  between — a clearance at or above that width cannot be delivered by any bow, and one near it
  costs an unbounded one. On this cast the arch wants 0.951 of the standing width; the beau's arc
  peaks at **1.152×** it, and the pass goes from 0.570 to 1.314 world units.

A couple who ask for nothing get `clearance = archClearance = width / 2`, the arc's own radius, and
therefore no lane at all — which is why every fixture and worked example below is unchanged.

### What this replaced, and why it is worth recording

The first build (2026-08-15) was a **rigid rotation of the pair about their joined hands**: both
dancers diametrically opposite on a circle of radius `width / 2` centred on the join, facings
turning with the body rather than following the path, and the belle carrying `spin: 1` — a whole
extra turn under a fixed arch, for **−540°** accumulated.

Three things were wrong with it and only one was the number Ryan read off the screen:

1. **540° in 4 beats** is a spin, not a walk under an arm.
2. **The direction wound her arm up** rather than unwinding it. The rigid model could not see
   this, because it never asked which way anyone travelled.
3. 🔴 **The figure had no clearance in it at all.** Held diametrically opposite at a constant
   `width` apart, the two dancers never pass each other — and this spec called that a feature.
   It was the same defect [ADR-0014](../../adr/0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md)
   had just found in the Trade, wearing the opposite disguise: there, two dancers sharing a lane;
   here, two dancers who never approach because neither crosses the floor between them.

The block it used, [`turn-under`](../blocks/turn-under.md), keeps its spec and its conformance
vectors — it was built for **Star Thru** and **Box the Gnat** as much as for this call — but it
now has **no consumer**, and ADR-0005's bet that the catalog makes later calls cheaper is open
again rather than won on it.

## Choreography paths

The two blocks' own worked examples — [`orbit.md`](../blocks/orbit.md) and
[`step-pivot.md`](../blocks/step-pivot.md) — **are** this call's two paths and are conformance
fixtures. Not restated here: a third copy is a thing that can disagree.

They are also **Partner Trade's**, and `test/california-twirl.test.ts` asserts that by comparing
the two calls waypoint for waypoint, both dancers, position and facing, rather than by comparing
end states.

🔴 The two earlier drafts of this section are both worth remembering. The first sketched the beau
on an outer arc and the belle on a tighter one, marked "illustrative, not derived", and was
wrong. The second replaced it with "the two are **diametrically opposite at the same radius** the
whole way", stated with confidence, backed by tests, and also wrong. The first draft was closer.

## Flow

| Field | Value |
|---|---|
| Hands | Inside hands joined throughout, raised — the beau's right and the belle's left, which is what [`insideHands`](../../../src/couple.ts) names |
| Last hand used | The joined inside hand, released at the end. **The one thing a Partner Trade answers differently** |
| Rotation (F4) | ∓180°: opposite senses, equal magnitude, as any pair exchanging places by walking forward |
| Body-flow vector | Along the final facing |
| Roll | Available |

## Is it a zero?

**Two California Twirls should return the couple to its start** — two 180° reversals and two
exchanges. That is the second half of Ryan's S1 sequence, and `isZero` settles it rather than
this paragraph.

## The equivalence with Partner Trade turned out to be an identity — 2026-08-18

Recorded on 2026-08-15 in both specs as a question for the engine, then confirmed as an
equivalence: two different figures landing in the same place, and the first member of
[ADR-0004](../../adr/0004-starter-scope-zero-box-triple.md)'s equivalence suite.

**It is the same figure.** ADR-0017; and it came from Ryan looking at the two renders, not from
the engine — *"california twirl beau might be same path … belle's path might be the same as
partner trade too."* The suite's first result is that one of its members was two calls' worth of
geometry for one figure.

The test is strengthened rather than deleted. An equivalence test compares end states and would
pass on two quite different figures; the replacement compares **every waypoint of both dancers**,
so it cannot.

And the difference table that used to have three rows has one:

| | Partner Trade | California Twirl |
|---|---|---|
| Hands | both free throughout | the inside pair joined and raised throughout |
| Paths | *identical* — see below | *identical* — see below |
| Beats | 4 | 4 |

🔴 **"Identical" was true of every couple in August and is now true of the body-agnostic one only**
(ADR-0018, 2026-08-19). The two calls are the same *figure* — same blocks, same belle, same beats —
and on a couple who carry real bodies the beau's arc is wider under the arch, because the joined
hand needs room the Trade's pass does not. Same figure, sized to what it carries. The
waypoint-for-waypoint test is scoped to the default couple, where the identity still holds exactly.

🔴 **Both of the deleted rows were describing defects.** The rotation row said a Trade's dancers
turn in opposite senses and a Twirl's in the same sense with different magnitudes — the second
half of which was the 540° spin. The beats row said 6 against 4, and the Trade's extra two were
ours ([ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md)). Each was written as a
characterisation of the calls and each was a symptom.

**One row is still enough to keep them two calls.** F2 asks whether the hand a following call
needs is available, and these two answer differently: a Trade finishes with both free, which is
what lets it flow into anything, and a Twirl finishes holding the inside hand. A caller
substituting one for the other inside a phrase is doing something real.
