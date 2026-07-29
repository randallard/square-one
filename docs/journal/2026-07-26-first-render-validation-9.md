# 9 — The first render watch pays off: Dosado's return leg was wrong

_2026-07-26. The event ADR-0005 (planning) cut to code for: a human watched the
paths render, in townage's `#dance` debug scene. Documents `bf634c3`._

## What the watch found

Ryan verified Dosado beat by beat (townage grew pause + a beat clock for exactly
this) and reported: **"all good up to beat 4, then they go the wrong way."**

He was right, and the defect was in the spec, not the adapter. The composed chain
sent each dancer from `(±0.15, ∓0.10)` at beat 4 to `(±0.30, ∓0.50)` at beat 5 —
veering *outward* to twice the lane offset while backing up — then home with a
full two-lane slide. Real dancers back straight down the return lane and close
with a single sidestep.

## Why three layers of checks missed it

- **The endpoint maths is identical either way.** The call still ended home;
  the zero property held.
- **The spec table skipped beat 5.** The conformance suite asserts documented
  rows; the bulge lived in the one beat nobody printed. (Beat 4 caught the
  *previous* backward-pass bug the same way — the table's blind spot just moved.)
- **The mental model was plausible.** "Backward is the time-reversal of the
  forward pass" survives review; it's wrong because Dosado's backward pass
  *starts already in the lane* (the slide put it there), and time-reversing from
  a displaced entry re-applies the veer outward.

## The fix

- `pass(backward, ·, lane)` **holds its lane**: lateral schedule `[0, 0, 0]`.
  The veer into a lane is never the backward pass's job — the entry contract has
  the dancer laterally clear already.
- `slide` grew a **`span: "full" | "half"`** parameter (default `full`); Dosado's
  closing slide is `half` — one lane, 0.15, from the return lane onto home.
- Dosado's table now lists **every beat**, beat 5 included; `pass.md` and
  `slide.md` carry worked examples for `pass(backward, left, lane)` and
  `slide(left, half)`, so the loader asserts the once-hidden geometry directly.
- `spec-conformance.test.ts`'s embedding test gained beat 5.

All 41 tests green (up from 37 — the new spec tables are fixtures); lint,
typecheck, build clean.

## Standing lesson

Recorded in `pass.md` and the Dosado table's note: **waypoint tables list every
beat, and no geometry is trusted until rendered.** The same table hid two
different defects in two different skipped rows. The "provisional until rendered"
marker did its job — Dosado is the first call to graduate to **render-validated**.
Pass Thru's forward-only pass and Allemande Left's arm-turn are still awaiting
their watch (Allemande's CCW turn direction is the highest-risk item).

## Round two, same day: the return must mirror the outbound

The round-one fix (straight back, then a discrete half-slide home) rendered, and
Ryan — a dancer — read it instantly: the outbound goes *diagonal* into the lane,
so the return should "do exactly the opposite from the other side and go
diagonal back to the starting position", not "straight back and then correct".
The CALLERLAB Basic definition, checked at his request, agrees to the word:
**"Walking a smooth circular path** … slide **slightly** to the left to return
to their starting position." Smooth ⇒ no 90° corner at beat 5; slightly ⇒ one
lane, blended.

Second fix:

- `pass` gained a **`close`** exit (3 beats): travel the line at backing pace
  (half walking speed, two beats for 0.4), then blend diagonally one lane toward
  the brushing shoulder on the final beat — the opening veer mirrored from the
  other side. `pass.beats()` became params-dependent (the `armTurn` precedent).
- **Dosado is a three-block chain**: `pass(fwd,right,lane)` 2 + `slide(right)` 1
  + `pass(bwd,left,close)` 3 = the chart's 6. The definition's fourth phrase
  ("slide slightly") is the close exit's final beat, not a fourth block.
- **`slide span: half` reverted**, hours after it landed — its only consumer was
  the discrete closing sidestep the definition rules out. If the Dodge family
  needs partial slides later, design the parameter then, with a real consumer.
- Final full-call table (every beat): 4 = `(+0.15, +0.10)`, 5 = `(+0.15, −0.10)`,
  6 = home via the closing diagonal.

Also corrected from the definition's styling note: **crossed/folded arms are not
recommended Dosado styling today** (men: natural dance position; women: skirt
work) — this repo's docs never claimed otherwise, but townage's journal did and
has been corrected.

Standing lesson, round two edition: the definition's *adverbs* are geometry.
"Smooth" and "slightly" each carried a waypoint's worth of information that the
first two models dropped. 41 tests green.

## The grip channel: F2 gets its per-beat data, and Allemande gets arms

Also landed the same day, prompted by the render watch's other finding — the
Allemande read as two dancers orbiting nothing, because nobody raised an arm.
The engine half of the fix is **`Motion.grips`**: spans
`{ hand, grip: "forearm", from, to }` on the motion's beat axis. `arm-turn`
emits one (contact at beat 1; `step-out` releases half a beat early as the
departure blends); `pass` and `slide` emit none — hands-free as a positive
fact. `embed`/`compose` shift spans with their blocks; `applyCallToPair` carries
them to the counterpart unchanged (an arm turn engages the same named hand for
both dancers).

This is deliberately **F2's foundation**, not just a rendering hint: "which
calls drop the tactile channel" — the accessibility brief's Deaf-dancer
analysis — is now a query over grips rather than a hand-maintained list.
Consumers aim the engaged forearm at the shared grip point (for `arm-turn`,
the block's own frame origin). townage's driver does exactly that; the spec
note lives in `arm-turn.md`. 44 tests, including grip-span invariants and
composition shifting.

**Correction, same day, from the consumer.** `GripSpan`'s doc said a renderer
should *aim* the named forearm at the shared grip point. townage did, and it
rendered as two arms pointing sideways at each other — in an arm turn the pivot
is on the named side, so the gripping shoulder is already nearly over it and
"aim at the pivot" resolves to "point straight across". The guidance in
`types.ts` now says **place** the forearm into the grip: two horizontal,
antiparallel forearms along the line between the pair, each hand at the other's
elbow, pinned to the pivot and rotating with it. The data was right; only the
advice about consuming it was wrong. See
[the-lot's journal](https://github.com/randallard/the-lot/blob/main/docs/journal/2026-07-26-the-grip-is-horizontal-and-tracked.md).

**And one finding for this repo, deliberately not fixed.** `arm-turn` emits a
waypoint every quarter turn and the stepper interpolates linearly, so a turning
pair walks the **chords** of its orbit: separation pulses by 29% of the radius
every two beats. Ryan watched it and **likes it** — the dancers appear to breathe
in and out — so it stays. Recorded here and in townage so nobody "fixes" it on
rediscovering the arithmetic. (If it ever must go: waypoints every eighth turn
take the dip to 7.6%.)

## Consumption note

townage sees this via the ADR-0006 **local link** (`pnpm link ../square-one`,
uncommitted override in its `pnpm-workspace.yaml`; `dist/` rebuilt after each
round). Before the-lot commits anything depending on these fixes, this repo
needs a tag — **v0.2.0 now, not v0.1.1: `Motion.grips` is new API surface** —
and the-lot's pin + `allowBuilds` hash need the two-line bump. The link must
not mask a stale pin (the ADR-0006 footgun).
