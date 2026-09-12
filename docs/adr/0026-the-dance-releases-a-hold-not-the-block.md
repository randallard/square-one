# ADR-0026: The dance releases a hold, not the block
- Status: Accepted
- Date: 2026-09-12
- Deciders: Ryan, Claude

## Context

Ryan, reviewing townage's pose chart on 2026-09-12: *"the ending position is always hands back
down in a normal handhold."*

He was describing the last beat of a California Twirl. [ADR-0024](0024-the-arch-is-a-hold-and-turn-under-is-deleted.md)
made the arch a **hold** — a parameter on the two travelling blocks — and `Hold`'s contract
said the figure *"keeps this hand engaged from the first beat to the last."* So `orbit` and
`step-pivot` emitted `from: 0, to: beats`, the arch was live at the call's final beat, and a
consumer drawing that beat drew a couple standing in their finishing places with their joined
hands over their heads.

**The engine already disagreed with itself.** `arm-turn` has released early since it was
written: `exit: "step-out"` emits `to: beats - 0.5`, with the comment *"the departure step
blends into the closing beat, and the grip lets go as it begins."* An Allemande Left therefore
ended correctly while a California Twirl ended mid-arch — not because anyone compared the two,
but because the arch became a hold months after `arm-turn` set the rule.

🔴 **The first attempt at this ADR put the release in the blocks, and Ryan caught it:** *"hands
don't always go down in the middle of a sequence, so we need a way to distinguish between the
sequence ending and dancers waiting, or the sequence continuing and the hands position blending
into the next move rather than going to the waiting position."*

That is the decisive observation, and it rules out the block. **A block does not know whether
anything follows it.** One that trims its own span makes every call boundary a release, so two
California Twirls in a row came out as two arches with a half-beat hole between them — the
couple lowering their hands at the join and raising them again, which is not what dancing two
Twirls looks like. The distinction Ryan names is only available one layer up, where the call
list is.

He also named the limit of how far this can be taken now: *"sometimes they'll end in a wave and
the hands will be up, but sometimes they'll end in a line and the hands will be down."* Which
formation a set has landed in is **formation recognition, S2's job** — `sequence.ts`'s own
header calls this module the increment that isolates sequence from formation, and
`reformCouple` already carries a 🔴 saying recognition is not here. So *what* the waiting
position looks like cannot be decided in this layer, and must not be guessed at.

## Decision

**A hold's release is applied by `flattenSequence`, not by the block that declares it.** Blocks
emit a span covering their whole length; the sequence, which knows the call list, does two
things to that channel:

- **Adjacent spans on the same hand in the same grip are merged** — the sequence continuing, so
  the hold carries across the boundary and the hands never dip mid-dance.
- **A span still live at the final beat is trimmed by `HOLD_RELEASE_BEATS`** — the dance ending,
  so the closing half beat is the hands being given up and the dancers finish *waiting*.

This says only **when** a hold is given up. **What replaces it is the consumer's**, because it
depends on the formation the set landed in, and this layer does not model formations.

## Alternatives considered

**Trim in the block** — the first attempt, rejected above: it cannot tell a call boundary from
the end of the dance, and turns every boundary into a dip.

**Special-case `2×`** — Ryan's own first suggestion, which he then talked himself out of in the
same sentence. It fixes the one sequence anybody had looked at and leaves the rule wrong: the
question is never "is this the same call twice", it is "does the hold continue".

**An `exit: "hold" | "release"` parameter on the couple blocks, as `arm-turn` has.** Rejected
*for this*: it would make the call author state what the *sequence* determines, and every call
in a sequence would have to be authored knowing its neighbours. `arm-turn` keeps its parameter
because an Allemande Left's step-out is the figure's own business — it lets go to step out
whatever follows — and `exit: "hold"` is how a composite call that chains turns says otherwise.
That is a different fact from "the dance is over".

**Emit the waiting position as a third grip style.** Rejected: an ordinary handhold is
deliberately not a `GripStyle` (see its doc) — it is what being a couple *is*, and a consumer
that knows where two bodies are can see it. Adding it would put the engine in the business of
describing a hold that no figure imposes, and would still be wrong for a wave.

## Consequences

The grip channel is now a property of the **dance** rather than a concatenation of per-call
channels, which is a real change in what `flattenSequence` means: it composes the channel
instead of only offsetting it. A consumer reading a single call's motion through
`applyCallToCouple` gets an untrimmed, unmerged span, correctly — one call is not a dance and
has no ending.

On the shipped catalog: one California Twirl runs its arch **0 → 3.5** of 4 beats; two in a row
give **one** span, 0 → 7.5; a Twirl followed by a Partner Trade keeps its edge at **4**,
untrimmed, because the next call wants the hand free and that edge is the choreography's.

`momentum.lastHand` is untouched and still names the inside hand. With the span now ending
before the call does, that field is the only thing saying the couple finish joined — the fact a
following call has to work around (ADR-0017), and what makes *released* different from *let
go*.

🔴 **A looping consumer gets a release every lap.** townage's `#dance` repeats its sequence, and
the end of each lap is the end of a dance as far as this layer is concerned, so the hands settle
and lift again. That is defensible — the set does arrive and restart — but it is a behaviour
nobody asked for, and if it reads wrong the fix belongs to the consumer, which knows it is
looping, not here.

**Promotion condition — waves and lines.** The first call that ends in a formation whose waiting
position is *not* hands-down needs S2's formation recognition, and the answer is for the
consumer to ask the formation what the hands do. Do not encode a second waiting position here,
and do not widen a span to keep hands up: that would put the hold back on the ending pose, which
is the defect this ADR exists to remove.

**Breaking for a consumer pinned to v0.4.0** that asserts the old whole-call span. townage's
review catalog is one.
