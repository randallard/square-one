# 2026-07-25 — M1: the engine core, and what the conformance suite caught

_Documents commit `566deed`._

First code in the repo. Blocks as parameterised generators, calls as plain-data
block chains, composition, the degenerate stepper, and the ADR-0009 conformance
loader. Lint clean, typecheck clean, 35 property/conformance tests green, build
emits `dist/`.

The headline isn't the code. It's that **the conformance suite found two real
defects in the specs on its first run** — which is the entire argument of ADR-0009,
arriving about six hours after the ADR.

## Defect 1: `arm-turn`'s facings rotate the wrong way

Its positions orbit CCW for a left turn — south → east → north → west, angles
`270 → 360 → 450 → 540`. That matches "left = CCW" and the momentum row's
`fraction × ±360°`. The Facing column reads `+y → +x → −y → −x → +y`, which is
`90 → 0 → 270 → 180`: clockwise. The two disagree.

What convinced me it's the column and not my reading: the "Doing" cell on that same
row says the dancer "sweeps to the east side **moving north**". Moving north is
`+y`. The Facing cell next to it says `+x`. The row contradicts itself, and the
half and full rows only look fine because they're 180° apart and symmetric under
the error.

This is the same direction-slip family the journal already recorded once for this
block.

**Corrected later the same day, and my first fix was also wrong.** Re-deriving it
for Ryan turned up the decisive evidence, and it was in the spec all along: the
`hand` parameter is defined as *"the pivot is on your left as you walk forward"*.
That's a testable constraint, and head-on facing fails it at every row — it puts the
counterpart in **front** of the dancer, not on the named side. The correct rule is
`facing = position angle ± 90°` (genuinely tangential). My generator had fixed the
*direction* and inherited the *phase*, so it was wrong at beat 1 in the same way the
table was. Five rows changed, not two.

Lesson worth keeping: I reported "the table is wrong, my code is right" when the
truth was "both are wrong, differently". The conformance test told me they
disagreed; it could not tell me which was correct, and I filled that gap with an
assumption instead of going back to the definition. The spec's own parameter
description settled it in one line.

Total rotation is unchanged at `fraction × ±360°`, so momentum, roll and the
Allemande Left → R&L Grand F2 pairing are untouched. New thing documented: the 90°
turn-in at contact is entry travel, not accumulation — the chart counts timing from
point of contact, so the settle from head-on into the tangent sits outside the
block. Spec and generator moved together and the tripwire flipped back to a passing
test, which is the ADR-0009 loop working end to end.

## Defect 2: Dosado — the table was right and my block was wrong

I got this one backwards first, and the way I got it backwards is the lesson.

Initial diagnosis: the table's x-deltas don't balance, the closing `slide(left)`
moves 0.15 where the opening `slide(right)` moved 0.30, so composing the chain lands
0.15 short of home. Confident, specific, and wrong on both counts.

When Ryan asked about it I ran the composition and printed it side by side with the
table instead of reasoning about deltas. The chain resolves to `(0, −0.50)` — exactly
home. Five of the six documented rows match to the digit. The single disagreement is
**beat 4**, in x only: composed `+0.30`, documented `+0.15`.

The cause: `pass`'s `direction: backward`. I implemented the spec's literal words —
"negates the y-progression" — which kept the lane veer on the first beat. Backing up
should be a full **time-reversal** of the forward pass: travel straight, and the veer
lands on the *closing* beat. Fixing that makes every tabulated row match.

What makes this a nasty class of bug: **the exit pose is identical either way.** Both
versions leave the dancer in the same lane at the same spot, so the endpoint tests,
the beat sums, the chaining check, and the return-to-home property all pass. Dosado's
beat 4 is the only waypoint in the entire starter set where the difference is
observable. Without the documented mid-block waypoint there was nothing to catch it,
and it would have shipped to M4 as a subtly wrong-looking backup.

So the spec was more correct than the code, and more correct than the spec's own
prose — the table encoded a truth the parameter description hadn't spelled out. I've
written the time-reversal rule into `pass.md`, because the next asymmetric block will
have the same trap.

Two lessons I want to keep:

1. **The conformance suite proves a disagreement, not a culprit.** Twice now I've
   filled that gap with an assumption, and once it was wrong. The tie-breaker both
   times was a definition already in the spec — `arm-turn`'s "pivot is on your left",
   Dosado's own table.
2. **Compose it and print it.** Reasoning about coordinate deltas produced a
   confident wrong answer; running the thing and diffing against the table produced
   the right one immediately. Which is just the house rule about running the thing,
   applied to geometry.

## What the property tests found that review wouldn't have

`Motion.entry`. I'd assumed every block's local frame was dancer-at-origin, and
`checkChain` immediately produced a counterexample: `arm-turn` then `slide` opened
a 0.5-unit gap. `arm-turn`'s frame is **grip-centred** — the shared pivot is the
origin and the dancer stands at `(0, −0.5)` — because the grip is what the two
dancers have in common. `pass` and `slide` are dancer-centred.

Both conventions are right for what they describe, so blocks now declare their
entry pose and composition aligns on that instead of the origin. fast-check shrank
it to a two-block counterexample in under a second. I would not have spotted it by
reading.

Also worth recording: the rigid-motion property failed at 6dp because I round
waypoints to 6dp for tidiness. The invariant is rigidity, not bit-exactness, so the
assertion moved to 5dp rather than the rounding coming out. Rounding is a display
concern that had leaked into a maths assertion.

## Supply chain — the policy became config, and immediately conflicted with itself

square-one is the first TS project instantiated from the template, so there was no
`.npmrc` to inherit and the abstract policy had to become real settings.
`minimum-release-age=10080` and `ignore-scripts=true`.

I checked the age gate rather than trusting it: re-resolving from scratch pinned
`typescript-eslint` to 8.64.0 instead of 8.65.0. It's live.

Then it collided with the audit gate on the first run. `brace-expansion` has a high
DoS advisory and the **only** patched release is 5.0.8, published two days ago —
inside the gate. Two house rules pointing opposite ways.

The framing that made it decidable: the rules don't disagree about values, they
disagree about which risk is bigger *in this window* — a known published DoS, or an
unvetted two-day-old publish of a package sitting under most of the JS tooling
ecosystem. Once you ask "can the vulnerable code reach a consumer?", it isn't close.
It arrives via devDependencies only and this package ships `dist/`, so it can't.
Meanwhile a fresh publish of a deep transitive dependency is the textbook attack
shape the age gate exists for.

So: wait (**ADR-0010**). 5.0.8 ages in around 2026-07-30. CI's audit job is red
until then and that redness is *correct* — I'd rather have an accurate red gate than
a configured-green one. Ryan chose this over both alternatives; the one I'd have
argued hardest against was overriding, which would spend the strong guarantee to buy
off the weak one.

The precedent matters more than the incident: the age gate doesn't yield to the
audit gate by default. An advisory on a runtime dependency — something reaching
townage or hash-n-patter — flips it, and that's written into the ADR as the
promotion condition.

I also had to add `license-checker-rseidelsohn` as a devDependency: CI invokes it
via `pnpm exec` and it was never in anyone's dependency list, so that job would have
failed on the first push regardless.

## Not built, deliberately

Formation recognition, FASR records, collision-freedom across a full square,
breathing. No starter call needs them and building them now would be guessing at
shapes the remaining six calls will constrain.
