# ADR-0021: A body measurement widens a figure and never narrows it
- Status: Accepted
- Date: 2026-08-21
- Deciders: Ryan, Claude

## Context

[ADR-0020](0020-every-call-is-sized-to-the-bodies-that-dance-it.md) lets a consumer hand every call
in the catalog the room its dancers need. It does not say what happens when the dancers need
**less** room than the figure is drawn with, and that case is not hypothetical: the-lot's cast runs
from children to adults, `lateralClearance` returns a real number for two small dancers, and that
number is smaller than the 0.3 a Pass Thru's lane gives.

Read naively, a shape is an instruction and a small clearance is a narrow lane. That reading makes
figures collapse. Two children dancing a Dosado would trace a lane of 0.1 — geometrically legal,
because the engine's own collision invariant is only "no shared coordinate", and not a Dosado. The
figure would shrink toward a straight walk out and back, which is the shape of no call at all.

The same question already has an answer inside one figure. `laneForClearance` — the bow the couple
exchange solves for — has returned `0` for a clearance below the arc's own radius since ADR-0016.
A couple who ask for nothing get the figure as drawn. That was written as a compatibility measure
for one function; it is a rule, and it now has four more places to hold.

## Decision

**A body measurement is a floor under a figure's own number, not a replacement for it.** Where the
figure gives more room than the bodies need, the bodies are ignored.

`atLeast(figure, wanted)` in `geometry.ts` is the whole of it, and every block that takes a
clearance or a distance runs its parameter through it: `pass`, `slide`, and the couple exchange's
bow. A consumer may hand any call any shape without first checking whether the shape is safe.

**With one exception, and it is the reason this is a decision rather than a clamp.** `gripRadius` is
*not* floored. A clearance is room a figure has to **find**; a grip radius is where two people's
arms actually **put** them. Short arms genuinely dance a tighter Allemande Left, and flooring that
would draw a circle the pair cannot reach — the engine asserting a hold that does not exist.

## Alternatives considered

- **Honour the measurement in both directions.** The consumer measured, so the consumer is right.
  It loses on what a call *is*: CALLERLAB describes a Dosado's shape, and two people being small
  does not make the call smaller. A figure has a form independent of who walks it.
- **Reject a too-small measurement with an error.** Loud, and wrong about the ordinary case — a
  consumer with small dancers has done nothing incorrect, and would be forced to compare against a
  constant this repo owns before every call. That is the hand-copied constant problem in a new
  place.
- **Floor the grip radius too, for uniformity.** Uniform and false. It would put a pair's hands
  where their arms do not reach, which is worse than a tight turn and is exactly the kind of
  geometric-but-impossible pose the-lot's arch work spent a chunk finding.

## Consequences

- **Bodies can only ever make a square looser**, which is the safe direction: no accommodation can
  produce a collision that was not already there.
- **A consumer's measurement may have no effect, and nothing says so.** Passing a small clearance
  and passing none are indistinguishable in the output. Combined with ADR-0020's own note, the
  standing instruction is the same: assert on the figure that comes out, not on the argument that
  went in.
- 🔴 **`gripRadius` being the exception has to be remembered.** It is documented at the field, at
  the parameter, and pinned by a test that a short grip radius really does shrink the circle while
  a small clearance really does not. A fifth measurement arriving later has to answer this question
  explicitly — *room to find, or a place to put a hand?* — rather than inheriting whichever
  behaviour is nearest.
- **Promotion condition:** if a call ever legitimately needs to be danced **tighter** than drawn —
  a crowded-floor mode, an eight-dancer square that has run out of room — this rule is what stands
  in the way, and it should be revisited as a new decision rather than punctured per block.
