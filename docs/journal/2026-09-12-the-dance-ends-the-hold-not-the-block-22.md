# 2026-09-12 — the dance ends a hold, not the block

_Documents [ADR-0026](../adr/0026-the-dance-releases-a-hold-not-the-block.md), landed in `ea94f98`
on **2026-09-12**, and released as **v0.5.0** in the commit after this one._

Ryan, reviewing townage's pose chart: *"the ending position is always hands back down in a normal
handhold."*

It was not. `orbit` and `step-pivot` emitted the arch as `from: 0, to: beats`, so a California
Twirl's last beat was still an arch and the figure ended with the couple standing in their
finishing places with their joined hands over their heads.

The interesting part is that **the engine already agreed with him everywhere else.** `arm-turn`
has released half a beat early since it was written — `exit: "step-out"` emits `to: beats - 0.5`,
*"the departure step blends into the closing beat, and the grip lets go as it begins."* So an
Allemande Left ended correctly all along. The arch became a *hold*
([ADR-0024](../adr/0024-the-arch-is-a-hold-and-turn-under-is-deleted.md)) months after that rule
was set, and `Hold`'s contract was written as "first beat to the last" without anyone comparing
the two blocks.

## 🔴 The first fix was wrong, and Ryan caught it in one sentence

I put the release in the blocks — `holdSpans` trimming every held span by half a beat — and it
made the single Twirl right. Ryan: *"hands don't always go down in the middle of a sequence, so
we need a way to distinguish between the sequence ending and dancers waiting, or the sequence
continuing and the hands position blending into the next move rather than going to the waiting
position."*

That is the whole defect in the first attempt. **A block has no idea whether anything follows
it**, so a block that trims its own span makes *every call boundary* a release. Two California
Twirls in a row came out as two arches with a half-beat hole between them — the couple lowering
their hands at the join and raising them again, which is not what dancing two Twirls looks like.
I had even written a test asserting that hole, with a comment calling it "the right one" because
they are two figures. It is not right; it is the bug, asserted.

The distinction only exists one layer up, where the call list is. So the release moved to
`flattenSequence`:

- **adjacent spans on the same hand in the same grip merge** — the sequence continuing, hold
  carried across the boundary, no dip;
- **a span still live at the final beat is trimmed** by `HOLD_RELEASE_BEATS` — the dance ending,
  the closing half beat being the hands given up, the dancers finishing *waiting*.

A span that ends mid-dance because the next call wants the hand free keeps its edge exactly:
that edge is the choreography's, and blending out of it into the next move is the consumer's
business rather than something the engine describes.

## What it comes out as

| sequence | arch span | why |
|---|---|---|
| one Twirl | 0 → 3.5 | live at the last beat, so released |
| two Twirls | **0 → 7.5, one span** | merged through the join, released at the end |
| Twirl → Trade | 0 → 4, untrimmed | the Trade wants the hand free; that edge is real |
| Trade → Twirl | 4 → 7.5 | released at the end |
| bare `applyCallToCouple` | 0 → 4 | one call is not a dance and has no ending |

## 🔑 Where this deliberately stops

Ryan also said: *"sometimes they'll end in a wave and the hands will be up, but sometimes they'll
end in a line and the hands will be down."* True, and **not implementable here.** Which formation
a set has landed in is S2's — this module's own header calls it the increment that isolates
sequence from formation, and `reformCouple` already carries a 🔴 saying recognition is not here.

So the decision says *when* a hold is given up and never *what* replaces it. For the one
formation S1 has, a couple, the answer is the ordinary handhold — which is deliberately not a
`GripStyle` at all, because a consumer that knows where two bodies are can see it. When waves
arrive, the consumer asks the formation. **Not** by widening a span to keep the hands up, which
would put the hold back on the ending pose.

**224 tests pass** (was 221), `tsc` / lint / build clean. Two of the new ones are the pair that
would have caught the first attempt: two Twirls are **one** span, and a mid-dance edge is not
moved by half a beat.

## The pin moves with it

townage pins `square-one` and is symlinked to this checkout for co-development, so the scene saw
this change before any tag existed and **CI would not have**. townage has a test asserting its
`end` step falls outside the arch span, which fails against v0.4.0 — correctly, because v0.4.0's
arch really does cover beat 4. So this is released as **v0.5.0** and townage's pin moves to it in
the same chunk of work. Ryan approved both.

Breaking for a consumer asserting the old whole-call span, which is what makes it a minor bump
rather than a patch.
