# 2026-08-15 (2) — a couple, two calls, and two zeros that are now checked

_Documents `b494690`, `d9a32d6`, `0776e66`, `9922677`, `49f550c`, `5cbc83a`, `2757f80`._

S1's calls are done. Ryan's framing for starting single-couple moves: *"define 'partner up'
aka 'find a partner', at which point the couple determines who is on the right and who is on
the left … then we can just do two partner trades for a zero, then two California twirls."*

Both zeros now come back `home` from `isCoupleZero` rather than from a paragraph.

## The decision that had to come first

`DancerId` was `{ couple, role }` — no notion of **position within a couple**, which is what
every asymmetric call turns on. The salvaged `moves.md` already spoke the vocabulary (Star
Thru's entry names beau and belle) and nothing in the engine could represent it.

[ADR-0012](../adr/0012-calls-key-off-couple-position-not-role.md), on Ryan's call to *"use beau
belle as in modern practice"*: **beau** (left) and **belle** (right), and asymmetric calls
branch on position and never on role. ADR-0003 is not superseded — a role is who you are, a
position is where you are standing.

`CallDef.roleDependent` was renamed `positionDependent`. Mis-named rather than merely unused: a
field named for the concept it is not is how the next implementer gets it wrong.

## Four things the building corrected, and none of them by reading

This is the entry's real content. Every one of these was written down confidently and turned
out wrong, and in each case what caught it was composing blocks and running the result.

**1. Partner Trade is not a rigid rotation.** The spec said *"the couple rotates 180° about its
own centre, as a unit."* Under a rigid rotation each dancer's facing would not be tangent to
their path — one of them walks sideways for most of it — and the CALLERLAB Trade definition is
explicit that both walk *forward*.

**2. Partner Trade is position-dependent after all**, which the spec had as `false`. Both
dancers face `+y` and both walk forward, so the beau goes clockwise and the belle
counterclockwise — and both arcs pass through the front of the couple. Without something else
they occupy the same point at the same beat, which the engine's own collision-freedom invariant
forbids. Passing right shoulders separates them **asymmetrically**: belle inside, beau outside.
Two dancers walking genuinely different figures is what `positionDependent` means.

**3. A single constant-radius arc cannot do it at all.** For an arc between two dancers' spots,
the centre lies on their perpendicular bisector — and the only semicircle there has its centre
at the couple's centre and radius `0.5`, *for both of them*. That is the collision. So the lane
needs its own motion, which is what a real Trade looks like anyway: curve out, round, back in.
This is what forced giving `slide` a distance; it had a fixed `2 × LANE_OFFSET`, a full lane
change for Dosado's crossing step and twice what a half-lane offset needs.

**4. California Twirl's dancers are not on different arcs.** The spec sketched the beau outside
and the belle tighter, marked "illustrative". Wrong — they stay **diametrically opposite at the
same radius** the whole way, which is why this call needs no lane. The sketch had imported
Partner Trade's asymmetry into a figure that does not have it.

A fifth, smaller, from a test comment: a Trade's two dancers do not "accumulate alike", they
accumulate **oppositely** — equal magnitude, opposite sign. A Twirl's rotate the same way and
differ in magnitude. That is the sharper characterisation and the test carries it now.

**Every one of these reads perfectly well.** That is the thing to take from the list rather
than any individual correction.

## Two blocks, and why they are two

`orbit` — walk forward around a shared centre, hands free. Ryan chose "cleaner" over adding a
`grip` parameter to `arm-turn`, and the reason a Trade is not an arm turn is **a radius**:
`arm-turn` steps in from 0.5 to 0.3 because that is what joining forearms costs, and a Trade's
dancers walk the circle they are already on. So `orbit` is the primitive and an arm turn is
orbit plus a grip plus the step-in.

🔴 Except that "plus the step-in" understates it, which the equivalence test found. Both are 8
beats for a full turn; `arm-turn` spends its first on stepping in and **compresses** the closing
quarter into one beat against `orbit`'s two. `arm-turn` is deliberately not refactored onto
`orbit` — it is render-validated — and the test stands as the evidence a future refactor would
start from.

`turn-under` — the arch. Its frame is stated the *opposite way round* from `orbit`, and that is
the design point: `orbit` assumes forward motion, so its facing is tangential and the pivot is
implicitly on one side. Two dancers of a couple stand on opposite sides of their joined hands
and face the same way, so the pivot is on one's right and the other's left. Hence `pivot` as a
parameter, entry facing as the ordinary `+y`, and facing rotating **rigidly with the body**.

`spin` is the whole difference between the arch dancer and the one going under: both finish
alike, a full turn cancels in the end facing, so it shows up in `momentum.rotation` and nowhere
else — which is where F4 wants it.

## The equivalence, confirmed

Partner Trade and California Twirl land the couple in **exactly the same place**, and either
can follow the other and still come home. First member of ADR-0004's equivalence suite, and the
engine says how they differ: hands, rotation senses, and two beats of lane.

That was recorded in both specs as *"a question for the engine, not a claim"* before either was
built. Getting to answer it is the payoff for having written it that way.

## Where S1 stands

Done: the couple formation and beau/belle, `orbit`, `turn-under`, Partner Trade, California
Twirl, both zeros checked, the equivalence confirmed. **122 tests** (from 44 this morning),
lint clean, typecheck and build clean.

🔴 Still owed and unchanged: nothing here has been **rendered**. California Twirl's intermediate
path is marked *provisional until rendered* — `moves.md`'s "the gent stays in place or steps
through" is loose, and the rigid-rotation reading is the one consistent with the end state, but
only a watch settles it. `dosado.md` carried the same marker before its own watch caught two
defects.
