# Progress & Status

_Last updated: 2026-09-12_

## Status / next

**▶ RIGHT NOW (2026-09-12) — 🔴 A HOLD IS NOW RELEASED BY THE DANCE, NOT BY THE BLOCK. THE PIN HAS
TO MOVE WITH IT.** Ryan, reviewing townage's pose chart: *"the ending position is always hands back
down in a normal handhold."* It was not — `orbit` and `step-pivot` gripped to the last beat, so a
California Twirl ended with the couple standing in their finishing places with their hands over
their heads. [ADR-0026](adr/0026-the-dance-releases-a-hold-not-the-block.md) ·
[journal](journal/2026-09-12-the-dance-ends-the-hold-not-the-block-22.md)

🔑 **The engine already agreed with him everywhere else.** `arm-turn`'s `exit: "step-out"` has
released half a beat early since it was written. The arch became a hold (ADR-0024) months after
that rule and never got it.

🔴 **The first fix was wrong and Ryan caught it.** I trimmed in the blocks, which made the single
Twirl right and made *every call boundary* a release: two Twirls came out as two arches with a
half-beat hole between them, the couple lowering their hands at the join and raising them again.
*"Hands don't always go down in the middle of a sequence."* A block cannot tell a boundary from an
ending, so the release moved to **`flattenSequence`**, which can: adjacent spans on the same hand
in the same grip **merge**, and a span still live at the **final beat** is trimmed by
`HOLD_RELEASE_BEATS`.

| sequence | arch span |
|---|---|
| one Twirl | 0 → 3.5 |
| two Twirls | **0 → 7.5, one span** |
| Twirl → Trade | 0 → 4, untrimmed — that edge is the choreography's |
| bare `applyCallToCouple` | 0 → 4 — one call is not a dance |

🔑 **Where it deliberately stops.** Ryan: *"sometimes they'll end in a wave and the hands will be
up, but sometimes they'll end in a line and the hands will be down."* Which formation a set landed
in is **S2's** — this layer says *when* a hold is given up and never *what* replaces it. When waves
arrive the consumer asks the formation; **do not** widen a span to keep hands up.

**224 tests** (was 221), `tsc` / lint / build clean. Landed in `ea94f98`, documented in `a202064`,
**released as `0.5.0`** — breaking for a consumer asserting the old whole-call span, hence a minor
bump. 🔴 **A tag is local until it is pushed to `origin`**, which is what townage's pin resolves
against.

#### Do these, in this order

1. 🔴 **LOOK AT THE TWIRL'S ENDING** in townage — `#review=california-twirl/end/*` — and at
   `#dance`'s `2×`, which should now read as **one continuous arch** with no dip at the join. The
   engine is linked and `dist` is rebuilt, so both show this now.
2. 🔴 **RELEASE `0.5.0` AND MOVE townage's PIN.** townage pins `v0.4.0` (which *is* on `origin`,
   unlike what the 08-22 note below feared) and has a test asserting its `end` step falls outside
   the arch span — **that test fails against v0.4.0.** The co-development symlink is hiding it and
   CI will not be fooled. Breaking for a consumer asserting the old span, so a minor bump.
3. ⏳ **A looping consumer gets a release every lap.** townage's `#dance` repeats its sequence, and
   each lap's end is an ending as far as this layer is concerned, so the hands settle and lift
   again. Defensible — the set does arrive and restart — but nobody asked for it, and if it reads
   wrong the fix belongs to the consumer, which knows it is looping.

---

**▶ PREVIOUS (2026-08-22) — ✅ THE TWO TWIRLS ARE WATCHED WITH BOTH ACCOMMODATIONS AND ACCEPTED.
🔴 AND `main` HAS MOVED PAST THE TAG the-lot PINS.** Ryan: *"I watched two twirls and it looks good
with both the resize and the break accommodations."* That was the last thing held for his eyes, in
either repo. **Nothing on screen is waiting.** **221 tests**, lint / typecheck / build clean.

🔴 **The engine the-lot runs on is not the engine it pins.** the-lot pins
`github:randallard/square-one#v0.3.0` and imports **`ShapeAt`**, which
[ADR-0025](adr/0025-a-sequence-can-size-each-call-to-its-own-shape.md) added **after** that tag —
`git show v0.3.0:src/sequence.ts` has no mention of it. Its suite is green because its ADR-0034
relinks the engine to the sibling checkout whenever one exists. **A fresh clone or CI resolves the
pin and gets a package without `ShapeAt`.** The co-development link and the tag validation are the
same mechanism, so the check is only as good as the last time somebody turned the convenience off.

✅ **RELEASED AS `0.4.0`, and the-lot's pin moves with it.** Two of the nine commits since v0.3.0
change the API — **`turn-under` is deleted**
([ADR-0024](adr/0024-the-arch-is-a-hold-and-turn-under-is-deleted.md), breaking) and **`ShapeAt` is
added** (ADR-0025, additive) — so a minor bump. 🔴 **The tag is local until it is pushed to
`origin`**; until then a fresh clone or CI still resolves the old pin, and the `SQUARE_ONE_NO_LINK=1`
check against the published tarball cannot run.

✅ **[ADR-0025](adr/0025-a-sequence-can-size-each-call-to-its-own-shape.md) — a sequence can size
each call to its own shape**, landed `c0ee981` on 08-21. `danceCoupleSequence` takes an optional
`ShapeAt`: a per-step `Partial<FigureShape>` override.

- 🔑 **The asymmetry at the boundary is the whole decision.** The couple that comes out of an
  overridden call is reformed from the couple that went **in**, never from the overridden one, so
  an accommodation cannot outlive the execution it was drawn for. Letting it flow through would be
  [ADR-0019](adr/0019-a-couples-clearances-are-carried-across-a-call-boundary.md)'s bug one field
  over: that rule carries **measurements of dancers**, and an override is a fact about one
  *performance*.
- 🔴 **Two executions of one call can differ now**, deliberately, and every test that assumed
  otherwise was right until that commit. `isCoupleZero` still holds — an override changes the
  figure between the ends, not the ends — asserted rather than assumed.
- **What it bought did not survive the day, and the mechanism is untouched by that.** townage's
  reshaped Twirl went 0.951 → **0.685** of the couple's width, then back to **0.897** when its
  ADR-0038 found the *arm* in the gap that a break's low join had been paying for by accident. The
  figure follows the draw either way; what shrank is how much of the difference the beau's **bow**
  carries.
- ✅ **[Journal entry 21](journal/2026-08-22-a-shape-that-belongs-to-one-performance-21.md)** —
  written 08-22, a day after the ADR. It was not on any owed list, which is worse than being on one.

### ⚠️ Owed — reconciled 2026-08-22

🔴 **The 08-21 reconciliation had drifted again by the end of the same evening.** The list below was
written at 18:24 and three more chunks landed after it, each stopping at the ADR. Items 1 and 2 of
the previous list were finished **by the chunk that wrote them down as open**. Reconciling a list is
not the fix; a chunk ending at the ADR is the cause.

**✅ Closed since.** ✅ **The two Twirls, watched with both accommodations and accepted** — the last
held item in either repo. ✅ **`turn-under` deleted** (ADR-0024) — the catalog is five blocks and
every one has a live consumer. ✅ **the-lot's frame-scale hack retired** (its ADR-0035) — a wide pair
widens the call they are in rather than everybody's; the engine's body measurements finally bind.
✅ **`ShapeAt`** (ADR-0025) and ✅ **journal entry 21**.

**🔴 Still open, in the order Ryan set:**

1. **Release `0.4.0` and bump the-lot's pin** — see above. The only item with a broken thing behind
   it rather than a question.
2. **To discuss:** the standing touch-hands handhold has no accommodation (the third hold, and its
   hands meet *in front of* the pair rather than between them); `arm-turn` still samples every
   quarter turn with the sag ADR-0022 removed from `orbit`; the-lot's hold `forward` is still 0.320
   on the default cast, flagged 2026-08-17.
3. **Should the bow carry more of the difference between the two accommodations?** New, and Ryan's
   to judge — the-lot's ADR-0038 left the two Twirls at 0.897 against 0.952, where the draw is
   plainly visible in the reshaping torsos and barely visible in the beau's bow.
4. **Star Thru**, on its two questions below — and on **two couples in `#dance`**, which is planning
   ADR-0011's S2 and is the real prerequisite. `applyCallToPair` cannot express a formation change,
   which ADR-0012 named as "the next thing" and still is. the-lot's ADR-0037 lands in the same
   place: a call that legitimately changes the formation is a formation change and not an
   accommodation.
5. **A shape a call does not read is silently ignored** (ADR-0020). Standing caution rather than a
   task: assert on the figure, not the argument.

---

**▶ 2026-08-21 — ▶ STAR THRU IS DERIVED AND SPEC'D, AND IT IS WAITING ON TWO
ANSWERS.** `docs/spec/calls/star-thru.md`, draft for review. **No code** — this is the talk-first
artifact (ADR-0009), and the figure has two questions in it that geometry should not guess at.

- 🔑 **The derivation.** In the pair frame, the man's right and the lady's left are on the *same*
  side only for one assignment of the two dancers, and that fixes everything else: both finish
  facing 180°, they **swap sides**, and each walks `(separation + width) / 2` = **0.6667**
  straight along their own facing while pivoting a quarter — one left, one right. A `step-pivot`
  each, mirrored, with a forward component the block does not have yet.

- ✅ **It settled `turn-under`, and the answer was delete it** — done, ADR-0024. Star Thru's two
  dancers turn in **opposite directions**, so no rigid rotation of the pair can produce this figure.
  **Two calls predicted to need it, neither needing it: the arch is a hold, not a block.**

- 🔴 **And it breaks an assumption the clearance machinery rests on.** The two dancers are level
  at **t = 0.75**, not halfway — they walk toward each other and finish a couple-width apart, so
  the crossing is three quarters through. Every lane in this catalog is `sin²`, peaking at the
  middle, because for a Trade the pass *is* the middle. Delivering a clearance at 0.75 through
  that profile costs **twice** the bow, spent in the wrong place.

### ⚠️ The two questions for Ryan, before any geometry

1. **Where does the joined hand sit?** The derivation puts it at the pair's midpoint, so the
   couple finishes centred where the pair was. The physical answer may be that it sits off to the
   named-hand side and the couple ends **displaced** toward it — a real Star Thru's "you end up
   over there". This changes where every subsequent call happens.
2. **What carries the lateral clearance at the crossing?** A `sin²` bow sized to deliver at 0.75
   (simple, wasteful); a profile that peaks *at* the crossing (right-looking, new shape); or
   **no bow at all** — they pass on opposite sides of the join because one is *under* it, and the
   clearance is **vertical**, not lateral. The third is probably what a dancer would say, and it
   is the one the-lot cannot currently draw.

---

**▶ 2026-08-21, third chunk — a pass walked a flat 0.80 that nobody could derive.
LANDED as `d584a74`.** **225 tests** (from 223), lint / typecheck / build clean. Narrative in
[the nineteenth journal entry](journal/2026-08-21-a-pass-walks-just-far-enough-19.md). Ryan, watching the sized Dosado:
*"dosado pass by too far though — should watch body / head size and pass by just enough to clear
and slide to the right far enough to step back."*

- ✅ **[ADR-0023](adr/0023-a-pass-walks-just-far-enough-to-clear.md) — a pass walks just far
  enough to clear.**
  - 🔑 **ADR-0020 fitted the lane and left the walk.** It reasoned correctly that a facing pair's
    *separation* is a frame fact and not a body one — and the `lane`/`close` exits were walking a
    flat **0.80** with no derivation anywhere. Measured on townage's cast at the back-to-back
    beat: the pair were **1.562 world units** past each other against the **0.710** their heads
    and torsos take to clear.
  - 🔑 **The right distance is forced by the beat that follows.** During the `slide` the two
    dancers **swap lanes** — each crosses the other's `x` — so nothing lateral holds them apart
    and the whole gap is the one they walked out. It must be the clearance, and need be no more.
  - `lane` / `close` walk `(separation + clearance) / 2`; `centered` still crosses the whole
    separation, because finishing on the counterpart's spot is what a Pass Thru *is*. Schedules
    are fractions of the travel now, so each exit's shape is stated once.
  - **Landed: 2.083 → 1.692 world walked, 1.562 → 0.781 past.** Still a zero to the last decimal,
    still 6 beats. ✅ **Watched and accepted** — Ryan, `#dance=dosado`: *"dosado looks good."*
  - 🔴 **Spec fixtures moved for the first time in this repo.** `blocks/pass.md`'s `lane` and
    `close` tables and `calls/dosado.md`'s full-call table are rewritten — the docs are the
    fixtures (ADR-0009), so a figure that changes changes them. Old numbers kept with the
    measurement that retired them.
  - 🔴 **Second decision in two days to find a constant nobody could derive** — ADR-0022 found the
    arc's 45° sampling, this found the 0.80 walk. Both plausible, both invisible because the
    things around them were fitted to them. **A number in this catalog should say where it comes
    from, or be a parameter.**

---

**▶ 2026-08-21, second chunk — the bow was solved against a curve nobody walks.
LANDED as `8d436cd` and released as **v0.3.0**, still awaiting Ryan's verify in the scene.** **223 tests** (from 220), lint / typecheck / build clean;
the-lot 627 (from 626), lint 0 errors, build clean. Ryan, watching the generalisation: *"I looked
at `#dance=two-trades` and it's still too tight — if we're generalizing correctly it should be
like `#dance=two-twirls`."*

- ✅ **[ADR-0022](adr/0022-the-waypoints-are-the-path-so-the-arc-is-sampled-to-be-one.md) — the
  waypoints are the path, so an arc is sampled fine enough to be one.** Narrative in
  [the eighteenth journal entry](journal/2026-08-21-the-solver-was-right-about-a-curve-nobody-walks-18.md).
  - 🔑 **`laneForClearance` measures the arc; the dancers walk a polyline.** `orbit` marked a
    waypoint every 45° and `sampleMotion` runs straight lines between them, so the chords sag
    `r(1 − cos 22.5°)` — **7.6% of the radius** — inside the curve. A Trade solved to exactly the
    0.710 its heads want **delivered 0.670**.
  - 🔑 **ADR-0018 was underneath this the whole time.** That chunk hardened the bow from arithmetic
    into a bisection because a **3%** error was "a hand inside a head". This was 5.6%, and the
    bisection could not see it — it was bisecting the wrong curve.
  - 🔑 **Every instrument was blind in the same place.** All three suites pair the dancers **by
    beat**, at the marks the generators emit; the sag lives strictly between them, so more checks
    of that kind would have returned the same wrong number with more confidence. The new guard runs
    `sampleMotion` — what a consumer calls. **Measure with the thing the consumer uses.**
  - 🔑 **The obvious fix was wrong.** Solving the bow against the chords is exact and broke five
    tests that were all right: the body-agnostic couple's default clearance *is* the arc's own
    radius, so chord-solving put a bow on a pair who asked for nothing — making the beau swing
    wider forever to conceal a polygon. The defect was the emitted path, not the solver.
  - `orbit` and `step-pivot` now sample every **7.5°** (a forty-eighth of a turn), where the sag is
    `3.4e-4 × r` — under `round`'s own sixth decimal. A half turn carries 25 marks instead of 5.
    Density chosen so **whole beats stay on sample boundaries** (the ADR-0009 fixtures look rows up
    by exact beat), and marks are built as `k / n` rather than accumulated.
  - `step-pivot` has no sag of its own — she moves linearly in the beat — but was refined to match
    for the **beat alignment**: leaving her at 45° would have cut the clearance instrument to five
    samples per call. `arm-turn` is deliberately untouched (render-validated; nothing solves a
    clearance against it).
  - **Landed: 0.709 against 0.710 wanted.** A residual remains — up to 0.32% at the heaviest bow —
    asserted as a bound rather than as strict clearance, because the latter would be a test tuned
    to a sampling constant.

- ✅ **the-lot passes the hands-free clearance** (its ADR-0031), which is the other half of Ryan's
  observation and closes owed item 2 from the chunk below. Its three pinned tripwires all fired,
  including the one claiming wide bodies were *structurally* unable to dance a Trade at
  handholding distance.

### ⚠️ Owed

1. 🔴 **Watch `#dance=two-trades`, then `#dance=two-twirls`.** The Trade bows **less** than the
   Twirl and should: same bodies, but only the Twirl has a joined hand up between two heads. The
   beau's path over four beats runs **1.789** world with no bodies → **2.033** for a Trade →
   **3.387** for a Twirl. If the Trade reads right the generalisation is landed; if he reads as
   hurrying, that is two-twirls' sprint question at 14% rather than 89%.
2. 🔴 **square-one is not tagged**, so the-lot cannot import ADR-0020's new exports. Its dependency
   is `github:randallard/square-one#v0.2.0` and only the local symlink makes today's build work.
   Needed before the-lot can retire its hand-copied `ENGINE_LANE_OFFSET` or size its pair calls.
3. 🔴 **`arm-turn` still samples every quarter turn**, with the same sag ADR-0022 removed from
   `orbit`. Harmless today because nothing solves a clearance against it; the day something does,
   ADR-0022 applies to it.
4. 🔴 **No journal entry for the ADR-0014 chunk.** Carried; entries 15–18 are the four since.
5. 🔴 **`turn-under` still has no consumer.** **Star Thru** settles whether the arch family has a
   block or the arch is a hold on figures we already have.
6. 🔴 **A shape a call does not read is silently ignored** (ADR-0020). Assert on the figure, not
   the argument.

---

**▶ 2026-08-21, first chunk — every call in the catalog is sized to the bodies dancing it. LANDED
in the same commit `8d436cd` as the chunk above.** **220 tests** (from 193), lint / typecheck / build clean;
the-lot builds and its 626 tests pass against the rebuilt engine. 🔴 **Nothing on screen changes
by default** — this chunk opens the seam, it does not switch anything on. The watches it opens are
in the owed list.

- ✅ **[ADR-0020](adr/0020-every-call-is-sized-to-the-bodies-that-dance-it.md) — every call is
  sized to the bodies that dance it.** Ryan: *"we've got california twirl working great and
  allowing for head and arm and body where beau path is pushed out but we need to generalize that
  to all the moves we have created — make sure they all allow for varying body, head and arm and
  handhold where necessary."* Narrative in
  [the seventeenth journal entry](journal/2026-08-21-every-call-takes-a-body-17.md).
  - 🔑 **The seam reached two calls out of five.** `chainsAt` was declared on Partner Trade and
    California Twirl; Dosado and Pass Thru passed at a fixed `LANE_OFFSET` 0.15 and Allemande Left
    gripped at a fixed `ORBIT_RADIUS` 0.3. The only lever for the other three was **make the floor
    bigger** — the-lot's own `minScaleForGap`, which divides by a hand-copied duplicate of this
    repo's private constant and spends one pair's accommodation on the whole square.
  - **`CoupleShape` → `FigureShape`, in its own `shape.ts`**, because a facing pair dances a
    Dosado and a facing pair is not a couple. Four fields, and they are Ryan's four things:
    `width` (handhold), `clearance` (body, and the head that makes it widest), `archClearance`
    (head with a joined hand between two of them), **`gripRadius` (arm — new)**.
  - **`CallDef.chainAt(shape)`** beside `chainsAt`; every call declares one or the other, asserted
    over the catalog rather than call by call. `chainsAt` wins where present; `chainAt` is what
    lets a *couple* dance a Pass Thru at their own clearance.
  - **Blocks take the measurement, not the figure**: `pass.clearance`, `slide.distance`,
    `arm-turn.gripRadius` / `.standoff`, `turn-under.grip`. Their constants are **exported** now —
    `PASS_CLEARANCE`, `LANE_OFFSET`, `SLIDE_DISTANCE`, `ORBIT_RADIUS`, `ENTRY_RADIUS`,
    `STEP_OUT_RADIUS`, `STEP_OUT_FRACTION` — because a floor a consumer must beat is contract.
  - 🔑 **The output is unchanged and that is asserted, not observed.** A measurement is spread into
    a block's params only when it asks for more than the block's own default (`beauHalf`'s idiom
    from ADR-0016, generalised into `sized()`). All 193 existing tests passed untouched and not one
    spec fixture moved.
  - 🔑 **Beats are untouched at every size.** A wider pass is a longer stride inside the chart's
    timing — ADR-0013's bow riding inside the arc, ADR-0014's step riding inside its rotation.
  - `partnerUp`'s width slot now also takes a `Partial<FigureShape>`; passing both forms throws
    rather than picking a winner. `reformCouple` carries `gripRadius` (ADR-0019's rule, applied to
    the new field **before** it had a reader).

- ✅ **[ADR-0021](adr/0021-a-body-widens-a-figure-and-never-narrows-it.md) — a body measurement
  widens a figure and never narrows it.**
  - 🔑 **A small measurement is ignored, and that is what makes a shape safe to pass anywhere.**
    Read naively a shape is an instruction, and two children's clearance would shrink a Dosado's
    lane to 0.1 — geometrically legal under "no shared coordinate", and the shape of no call at
    all. `laneForClearance` has behaved this way since ADR-0016; it is a rule now, as
    `atLeast(figure, wanted)`, in every block that takes one.
  - 🔑 **`gripRadius` is the single exception.** A clearance is room a figure has to *find*; a
    grip radius is where two people's arms actually *put* them. Flooring it would draw a hold the
    pair cannot reach.

- ✅ **`turn-under` had the wrong handhold, and no consumer to notice.** It emitted `forearm` — a
  grip at elbow height — for a figure whose own first line is *"one passing beneath the other's
  raised arch"*. Written before ADR-0017 added `arch` to `GripStyle`. Now a `grip` parameter
  defaulting to `arch`; the waypoints are asserted identical either way.

- ✅ **Specs updated for the parameters**: `blocks/pass.md`, `blocks/slide.md` (the third arrival of
  `distance`, argued rather than slipped in), `blocks/arm-turn.md`, `blocks/turn-under.md`, and a
  *Sized to the pair / to the arms* section in `calls/dosado.md`, `calls/pass-thru.md`,
  `calls/allemande-left.md`.

### ⚠️ Owed at the time — see the current list at the top of this file

1. 🔴 **Watch `#dance=two-twirls`.** Unchanged from the last chunk and still the oldest open watch.
   The beau's arc is **1.152×** the couple's width where it was 0.5×, covered in the same 4 beats.
   Whether he reads as *sprinting* is the one number a render decides.
2. 🔴 **the-lot passes neither the hands-free clearance nor a grip radius, and now both are
   reachable.** Passing the pair calls a clearance would open a Pass Thru's lane and could let the
   square stop scaling itself up for one wide dancer — two figures Ryan has watched and accepted at
   the current spacing. A look, not a number.
3. 🔴 **square-one is not tagged, so the-lot cannot import the new exports.** Its dependency is
   `github:randallard/square-one#v0.2.0`; only the local symlink makes today's build work. Any
   the-lot change that uses `PASS_CLEARANCE`, `FigureShape` or `shapeOf` needs a tag first —
   including replacing its hand-copied `ENGINE_LANE_OFFSET`.
4. 🔴 **No journal entry for the ADR-0014 chunk.** Carried from the last two chunks; entries 15, 16
   and 17 are the three since, and the numbering has no gap for it.
5. 🔴 **`turn-under` still has no consumer.** ADR-0005's showcase block; **Star Thru** settles
   whether the arch family has a block or the arch is a hold on figures we already have. Its grip
   defect this chunk found is what a block with no consumer looks like.
6. 🔴 **A shape a call does not read is silently ignored** (ADR-0020's own note). Passing an arch
   clearance to a Dosado gets a Dosado, correctly — but "I passed the number" is not evidence the
   number was used. Assert on the figure, not the argument.

---

**▶ The arch got a hand in the gap (2026-08-19), and the second Twirl had lost the bow. Both
LANDED, committed as `b3a02eb`.** **193 tests** (from
176), lint / typecheck / build clean. `pnpm dev` in the-lot, **`#dance=two-twirls`** — that is
the watch this chunk is waiting on.

- ✅ **[ADR-0018](adr/0018-the-arch-needs-a-hands-room-between-two-heads.md) — an arch needs a
  hand's room between two heads, so a couple carries a second clearance.** Ryan, on the arch:
  *"the beau's hand clips through the belle's head — it shouldn't push into the beau's own head
  either though."* Narrative in
  [the sixteenth journal entry](journal/2026-08-19-the-hand-in-the-gap-and-the-second-twirl-16.md).
  - 🔑 **The gap has a third thing in it.** Hands free, two dancers must clear each other;
    hands joined and raised, there is a **joined hand up between their heads** — where a head is
    widest — belonging to neither of them. On the-lot's cast, against a couple standing **1.140**
    apart: torsos want 0.520, heads 0.710, **heads with a hand between them 1.084**.
  - `Couple.archClearance` beside `clearance`, defaulting to it. `beauHalf` picks by the hold —
    `hold?.grip === "arch"` — so the two calls stay one factory with one parameter. The three
    sizeable measurements are named `CoupleShape`, which is what `chainsAt` now takes.
  - 🔑 **The bow is solved, not computed.** `wanted − radius` is exact for the separation *at*
    the pass and wrong for the figure: the lane is `sin²` and the belle crosses at a constant rate,
    so a large bow makes them nearest on the **way** to the pass. It left the closest approach 3%
    short — a hand inside a head. Bisected on the minimum over the whole call.
  - 🔑 **And capped at one couple-width.** Both dancers stand on their spots at the ends, so the
    minimum only *approaches* the couple's width — unsatisfiable requests had the beau orbiting at
    **73×** it. On this cast the arch wants 0.951 of the width: inside the cap, only just, and the
    arc peaks at **1.152×** the width (pass 0.570 → 1.314 world).

- ✅ **[ADR-0019](adr/0019-a-couples-clearances-are-carried-across-a-call-boundary.md) — a
  couple's clearances are carried across a call boundary, not measured.** Ryan, watching
  `#dance=two-twirls`: *"it looks like the first california twirl is good but the second still has
  the smaller path."* Measured: Twirl #1 passed at 0.333 (clearing the 0.317 the arch wants),
  Twirl #2 at **0.167** — the bare radius.
  - `reformCouple` called `partnerUp` with a width and nothing else, so both clearances came back
    at their body-agnostic defaults. **ADR-0015's own bug, one field over, on the day that field
    got its first reader.**
  - 🔑 **Width is measured because two exit poses contain it; clearance is carried because they
    never will.** Clearance is a fact about *bodies*, and dancers do not get narrower between
    calls. Not a compromise between two policies — it is what the two fields are.
  - 🔑 **Measure the thing you are going to watch.** The bow was measured end to end the day
    before — beat by beat, both accommodations — and the harness walked **one call**. Ryan was
    watching a sequence. `isCoupleZero` passed throughout, because the bow is zero at both ends and
    a home check is blind to the middle of a figure.
  - 🔑 **A default that is also the right answer everywhere you test hides its own loss.** Every
    test in this repo dances the body-agnostic couple, where the dropped number and the default are
    the same number. True of the original width bug too.

- ✅ **The two owed ADRs are written** —
  [0015](adr/0015-a-call-is-sized-to-the-couple-that-dances-it.md) (a call is sized to the couple
  that dances it) and [0016](adr/0016-a-couple-carries-the-clearance-its-bodies-need.md) (a couple
  carries the clearance its bodies need, and the beau's arc bows out to meet it). Reconstructed
  from the code, `813be1f` and `3c8ed43`, and marked as such at the top of each file.

- ✅ **`docs/spec/calls/partner-trade.md` is current again**, from *Dance action* down: the belle
  steps and pivots, the beau orbits, the figure is sized to the couple, and the pass is sized to
  the clearance. The superseded readings are kept as history with banners rather than deleted.
  `california-twirl.md` and `blocks/orbit.md` updated for the arch clearance and for the lane
  having a consumer again.

### ⚠️ Owed at the time — see the current list at the top of this file

1. 🔴 **Watch `#dance=two-twirls`.** The beau's arc is now **1.152×** the couple's width where it
   was 0.5×, covered in the same 4 beats. Whether he reads as *sprinting* is the one number a
   render decides, and no test can answer it.
2. 🔴 **the-lot still does not pass the Partner Trade's own clearance.** The mechanism now exists
   to close ADR-0014's head overlap (0.570 delivered against 0.710 wanted), and switching it on
   would bow a figure Ryan has already watched and accepted. A look, not a number — flagged on
   `useDancePerformance`'s `archClearance` doc.
3. 🔴 **No journal entry for the ADR-0014 chunk.** Entry 15 is ADR-0017's and 16 is this one; the
   numbering has no gap for it. What that chunk was is in its ADR and `813be1f`; the narrative is
   what is missing.
4. 🔴 **`turn-under` still has no consumer.** ADR-0005's showcase block; **Star Thru** settles
   whether the arch family has a block or the arch is a hold on figures we already have.
   `orbit`'s `lane` is off this list — ADR-0016 made it load-bearing again.

---

**▶ The two couple calls turned out to be one figure (2026-08-18). Both chunks LANDED** —
`813be1f` (ADR-0014, the Trade) and `bd93203` (ADR-0017, the Twirl) — **and watched**: Ryan, on
the pair of them plus the-lot's arch, *"looks pretty good."* **176 tests** (from 148), lint /
typecheck / build clean. `pnpm dev` in the-lot, `#dance=two-twirls`, and `#dance=trade-twirl` for
the pair.

- ✅ **[ADR-0017](adr/0017-a-california-twirl-is-a-partner-trade-holding-on.md) — a California
  Twirl is a Partner Trade danced holding on.** Ryan: *"california twirl beau might be same path
  but raise arm and have belle duck under the two held hands — belle's path might be the same as
  partner trade too — but she needs to start the turn to the left, ccw, and make it only a 180
  degree turn — the way it's running now the belle is doing 540 degree turn cw."* Narrative in
  [the fifteenth journal entry](journal/2026-08-18-a-california-twirl-is-a-trade-holding-on-15.md).
  - The Twirl was a **rigid rotation of the pair about their joined hands**, with the belle
    carrying `spin: 1` — a whole extra turn under a fixed arch. It is now `EXCHANGE_CHAINS_AT`,
    one factory whose only parameter is the hold, instantiated twice.
  - 🔑 **The 540° was the smallest of three defects.** The direction wound her arm up rather than
    unwinding it, and the figure had **no clearance in it at all** — two dancers held
    diametrically opposite never pass each other, which this spec had written up as a *feature*.
    Both invisible because the engine's collision invariant is "no shared coordinate" and neither
    figure ever shared one.
  - 🔑 **A declared equivalence is a place to look for a duplicate.** The Trade ≡ Twirl
    equivalence was ADR-0004's first suite member; the suite's first result is that one member
    was a second copy of the other's geometry. An equivalence test compares end states, which is
    the one claim that is true both when two figures differ and when they are the same figure
    written twice. Replaced by a **waypoint-for-waypoint** comparison of both dancers.
  - `GripSpan.grip` gains **`arch`** beside `forearm`; `orbit` and `step-pivot` gain an optional
    `hold` that emits the span, sets `lastHand`, and **moves no waypoint** — asserted at both
    blocks, because it is what the call-level comparison rests on.
  - 🔴 **`turn-under` has no consumer.** ADR-0005's showcase block; **Star Thru** now settles
    whether the arch family has a block or the arch is a hold on figures we already have. Same
    status `orbit`'s `lane` has carried since ADR-0014.

- ✅ **[ADR-0014](adr/0014-the-belles-half-of-a-trade-is-a-step-and-a-pivot.md) — the belle's half
  of a Partner Trade is a step and a pivot.** Ryan: *"for the belle this is really a step left and
  pivot 180."* Watched and accepted: *"partner trade looks good."* New `step-pivot` block; the
  lane and its three constants deleted; pass separation 0.3 → 0.5 of the couple's width.
  🔴 **This chunk is under-documented** — see owed, below.

### ⚠️ Owed at the time — see the current list at the top of this file

1. 🔴 **ADR-0015 and ADR-0016 are referenced in `couple.ts`, `calls.ts` and `sequence.ts` and
   have never been written.** 0015 is *the chains are sized to the couple actually dancing them*
   (the width flows through `chainsAt`); 0016 is *a couple carries the clearance its bodies
   need*. Both decisions are made and implemented; only the files are missing. The numbers are
   reserved for them, which is why this chunk took **0017**.
2. 🔴 **`docs/spec/calls/partner-trade.md` is behind the code from *Dance action* down** — it
   still describes two dancers on one circle separated by a bowed lane. A staleness banner is at
   the top of the file naming ADR-0014 and the block specs as the authorities until it is
   rewritten.
3. 🔴 **No journal entry for the ADR-0014 chunk.** Entry 15 is this chunk's; the numbering has no
   gap for it. What that chunk was is in its ADR and `813be1f`; the narrative is what is missing.
4. ✅ **the-lot draws the arch** as of its ADR-0028 — and found that on the default cast the pair
   cannot physically make one, so they either reshape their torsos or let go, drawn at random per
   execution. Nothing in this repo changes: how high an arch is remains a body measurement, and
   this library has no bodies (ADR-0002).
5. 🔴 **The pass still does not clear the heads**, unchanged by today and now true of both couple
   calls: half the couple's width is 0.55 world units on the default cast against the 0.71
   `lateralClearance` wants. Pinned by tests in the-lot's `dance-performance.test.ts`.

---

**▶ Partner Trade is 4 beats and one block per dancer (2026-08-16).** Ryan, watching
`#dance=two-trades` in townage: *"I'm wondering about the sway when just standing — it seems 2x
too wide and 2X too slow."* Narrative in
[the fourteenth journal entry](journal/2026-08-16-the-sway-was-the-lane-14.md).
**148 tests** (from 137), lint 0 errors, typecheck, build and docs-hygiene clean.
**Watched and accepted** — Ryan, on `#dance=two-trades`: *"looks ok — a step in the right
direction."* Which is the right weight for it: the sway is gone and the timing is the chart's,
and the pass is still a collision (below).

- **[ADR-0013](adr/0013-the-trade-lane-rides-inside-the-arc.md)** — a Trade's passing lane
  rides **inside** the arc, not as steps around it. `orbit` gains an optional `lane` that bows
  the radius along the arc (`sin²`: zero at both ends, peaking at the pass), and Partner Trade
  is a single `orbit` per dancer again.
- 🔴 **There was no sway.** Nothing in the dance path has an idle animation. It was the Trade's
  own `slide` blocks — the closing sidestep of one Trade against the opening sidestep of the
  next, two beats of pure lateral translation with facing, `y` and separation all constant.
- 🔴 **The timing was wrong against two sources.** Basic Program Definitions §35.b says
  `Timing: 4`; the 2023 timing chart says `Partner Trade: 4`. We said 6, by reading the chart's
  4 as the *rotation's* budget and adding a beat per lane step. The chart measures **from point
  of contact** and a couple is already in contact — they are holding hands, which is why the
  styling note is about *releasing* a handhold. **The two extra beats were ours.**
- **Both halves of Ryan's observation were one thing.** Halving a distance and its duration
  leaves the speed unchanged; the complaint was that the sidestep existed. And `slide` charges
  a flat beat whatever the distance, so the Trade's half-lane step moved at **a sixth the speed
  of every other slide in the catalog**.
- **One word rescued yesterday's proof.** "No single **constant-radius** arc both lands on the
  standing spots and separates the dancers" is true; the conclusion "so the lane must be its
  own motion" is not. A varying radius does both.
- 🔴 **`slide`'s `distance` parameter is removed.** This block's spec had already rejected the
  same idea once (`span: half`, 2026-07-26, for Dosado) and the Trade reintroduced it three
  weeks later without reading the precedent. **Design a distance parameter and its timing
  together, or not at all.**
- **The Trade ≡ Twirl equivalence got stronger.** Both are 4 beats now, which is what makes the
  substitution usable inside a phrase. Its test had asserted `chartBeats + 2`.
- 🔴 **The clearance problem is untouched and wants its own ADR.** At townage's default cast the
  pass puts dancers **0.260** world units apart against a needed **0.710** — the bodies
  interpenetrate, and did before this change. `TRADE_LANE` is a proportion of the couple's
  width with nothing about bodies in it.

---

**▶ A couple stands hand in hand (2026-08-15).** Ryan, after S1 was wired into townage:
*"they should hold hands — we say touch hands — beau right palm up and belle's left palm
down … the characters need to be a bit closer together when partnered up."* Narrative in
[the thirteenth journal entry](journal/2026-08-15-touch-hands-13.md). **137 tests**, all gates
green.

- 🔴 **"A bit" was a factor of three.** Measured against townage's default cast at its derived
  frame scale of 2.60: a `COUPLE_WIDTH` couple stood **2.60 world units** apart while their
  inside hands meet at **0.82**. The constant was `1` — the same as a facing pair — because
  that was the obvious default when the formation was invented that morning and nothing had
  looked at it since. Now **a third**.
- **The engine cannot know the real answer**, since the touching distance depends on shoulder
  offsets that run 0.2 to 0.46 across the cast. `partnerUp` takes an optional width; a third
  is the body-agnostic default. The ADR-0004 seam doing its job — the engine says *hand in
  hand*, a consumer with bodies says *how far*.
- 🔴 **`TRADE_LANE` had been carrying a ratio in disguise.** It was the flat `LANE_OFFSET`,
  which is calibrated against a **facing pair's one-unit separation**. Invisible while a couple
  was a full unit wide; the moment it narrowed, the inside dancer's arc radius came out at
  **0.017** — a dancer spinning on the spot. **A constant borrowed from one formation and used
  in another is a ratio in disguise, and it stays invisible for exactly as long as the two
  happen to be the same size.**
- **`insideHands`** names which hands are joined (beau's right, belle's left). *Which* hands is
  a formation fact and lives here; *how* they are held is a rendering convention and does not.
- **`flattenSequence`** turns a sequence into one motion per dancer for the stepper. The
  dropped duplicate waypoint at each join is the part with a test on it: keeping it puts two
  waypoints on one beat, and interpolating across a zero-length interval divides by zero.

---

**▶ S1's calls are done (2026-08-15) — and 🔴 none of it is rendered.** Ryan's framing:
*"define 'partner up' … then we can just do two partner trades for a zero, then two California
twirls."* Both zeros now come back `home` from `isCoupleZero`. Narrative in
[the twelfth journal entry](journal/2026-08-15-couples-and-two-zeros-12.md).
**122 tests** (from 44 this morning), lint clean, typecheck and build clean.

- **[ADR-0012](adr/0012-calls-key-off-couple-position-not-role.md)** — calls key off couple
  position (**beau**/**belle**), never role. ADR-0003 is not superseded: a role is who you are,
  a position is where you are standing. `CallDef.roleDependent` renamed `positionDependent`.
- **`src/couple.ts`** — `partnerUp` **takes** the arrangement rather than inferring it, so two
  dancers of the same role can partner up and no call breaks.
- **Two new blocks.** `orbit` (walk forward around a shared centre, hands free) and
  `turn-under` (the arch). Ryan chose "cleaner" over a `grip` parameter on `arm-turn`.
- **Two new calls**, both position-dependent, both zeros when doubled.
- 🔴 **Equivalence confirmed:** Partner Trade and California Twirl land the couple in exactly
  the same place, and either can follow the other and still come home. First member of
  ADR-0004's equivalence suite.

**🔴 Four things the building corrected, none of them by reading.** The list matters more than
any entry on it — every one read perfectly well, and only composing blocks and running the
result caught them:

1. Partner Trade is **not** a rigid rotation; under one, a dancer walks sideways.
2. It **is** position-dependent (the spec said `false`): both arcs cross the couple's front, so
   the right-shoulder lane separates them *asymmetrically* — belle inside, beau outside.
3. **No single constant-radius arc can do it.** The centre must lie on the dancers'
   perpendicular bisector, so the only semicircle is radius 0.5 for *both* — the collision.
   This forced giving `slide` a distance parameter.
   🔴 *The geometry holds; the conclusion did not. A **varying**-radius arc does both, which is
   [ADR-0013](adr/0013-the-trade-lane-rides-inside-the-arc.md) the next day — and the `slide`
   distance parameter is gone again. Left standing here because "what the building corrected"
   is a record of what was believed, and this entry became an example of its own point.*
4. California Twirl's dancers are **not** on different arcs; they stay diametrically opposite
   at the same radius, which is why it needs no lane.

Plus: `arm-turn` **absorbs** the step-in rather than adding it — both are 8 beats and `arm-turn`
compresses its closing quarter — found by the `orbit` equivalence test.

**🔴 Still owed: a render.** California Twirl's intermediate path is marked *provisional until
rendered*; `moves.md`'s "the gent stays in place or steps through" is loose. `dosado.md` carried
the same marker before its own watch caught two defects.

---

**▶ S1 started (2026-08-15) — sequences chain, and "are we home" exists.** Planning
**ADR-0011** re-ordered the milestone table: NPCs dance a complete sequence before the player
joins one, in three increments (S1 one couple, S2 two couples, S3 the full square). S1 isolates
*sequence* from *formation*, so it needs no frame work — two dancers is what the consumer
already drives. Narrative in
[the eleventh journal entry](journal/2026-08-15-sequences-and-home-11.md). Commit `1e01a45`.
**61 tests (from 44)**, lint clean, typecheck and build clean.

- 🔴 **The finding that justified the increment: "are we home" was named but never built.**
  ADR-0004 has listed home resolution as a starter-set capability since 2026-07-24; before this
  commit the only occurrence of "home" in `src/` was a comment inside Dosado's chain. The module
  system is *made of* zeros, so a starter set that cannot check one cannot check its own specs.
- **`src/sequence.ts`** — `danceSequence` (chains calls across a set, each call entered at the
  previous one's exit), `resolveHome`, `isZero`.
- **Home is a property of the set, not of a dancer.** After Pass Thru each dancer stands where
  *the other one* started, so "everybody is on a starting position" is true and the set is not
  home. A per-dancer check passes that.
- **It reports how far off, not just whether** — "not home" is a number a spec can be wrong by.
- **Four prose claims are now checked:** Dosado is a zero (0.0000 off, and still one after
  twelve repeats); Pass Thru misses by exactly 1; Allemande Left misses by exactly
  `0.5 − STEP_OUT_RADIUS` and a quarter turn; calls chain with nothing between them.
- 🔴 **`applyCallToPair` cannot express Star Thru**, found while scoping. It derives B as A
  rotated 180°, so B's exit facing is always A's + 180° — and Star Thru ends both dancers facing
  the *same* way. First call for which `roleDependent: true` has to mean something.
  `danceSequence` already composes each dancer independently, so the room is there;
  `applyCallToPair` is where the work is.
- **Remaining in S1:** the pair-model change, then the Star Thru spec (`moves.md` carries the
  source material), then its turn-under block — the first new block since `arm-turn`, and
  ADR-0005's "calls get cheaper as the catalog grows" bet meeting its first real test.

**Status: the engine core exists.** M1 of the planning effort's milestone table.
`src/` implements the three specced blocks as parameterised generators, the three
starter calls as plain-data block chains, composition with chaining checks, and the
ADR-0007 stepper whose degenerate case emits ADR-0004 ideal paths. `test/` carries
the ADR-0009 spec-conformance loader plus fast-check property tests.

Local gate run (2026-07-29), **all green**: lint 0 problems · typecheck clean ·
**44 tests, 0 expected failures** · build emits `dist/` · docs-hygiene clean ·
`pnpm audit --audit-level=high`, `pnpm audit signatures` and the license allowlist
all exit 0 — **and now the OSV scan too**, which had never once passed in Actions
until `osv-scanner.toml` was added today. See [The ninth gate nobody was
running](#the-ninth-gate-nobody-was-running); the same section is the reason to
distrust "all gates green" when a gate is only ever observed in CI.

Architecture is decided and recorded (ADR-0001 TypeScript/provable-lite, ADR-0002
pure library, ADR-0003 roles, ADR-0004 starter scope, ADR-0005 blocks, ADR-0006
two-layer choreography, ADR-0007 stepper-primary, ADR-0008 code-not-markdown,
ADR-0009 specs-as-fixtures). [`spec/call-model.md`](spec/call-model.md) holds the
four-layer state model (three review questions still open);
[`spec/starter-set.md`](spec/starter-set.md) holds the wider target. Reference PDFs
are local (git-ignored, mapped in [`spec/reference-sources.md`](spec/reference-sources.md)).

**Course change (2026-07-25): call specs pause at three; code starts now.** The
planning effort's **ADR-0005** (`square-dance-planning/adr/0005-integration-first-cut-to-code-at-three-calls.md`)
stops the talk-first call cadence at Dosado / Pass Thru / Allemande Left and puts
the engine core + the townage choreography adapter next, because the waypoint
tables are marked "provisional until rendered" and only a consumer can validate
them. [ADR-0007](adr/0007-stepper-primary-ideal-paths-derived.md) settles what the
engine hands over: the **performance stepper** is the primary interface (any dancer
can be externally driven — the player), and ADR-0004 path data is what the stepper
produces with every coefficient off.

The **Allemande Left** spec ([`spec/calls/allemande-left.md`](spec/calls/allemande-left.md))
and the [`arm-turn`](spec/blocks/arm-turn.md) block landed in `490fb2d` — that's the
catalog's first rotating, hands-engaged block (exit parameter `step-out | hold`;
left = CCW; fraction table from the chart), and it carries an open **F4 nuance**:
anchored rotation should weight lighter than free-body rotation, accumulation
counted across transitions.

**M2 is done (2026-07-25): `v0.1.0` is tagged and townage consumes it.** the-lot pins
`github:randallard/square-one#v0.1.0` and imports `applyCall`, `applyCallToPair`,
`createPerformance` and the exported types successfully, at runtime and under `tsc -b`.

A `prepare` script was the missing piece: `dist/` is gitignored, so a git-installed
consumer has nothing to import unless the package builds itself after cloning.

**Known friction, flagged to the planning effort.** pnpm's blocked-scripts default
refuses that `prepare` until the consumer allows it, and it only accepts the full
`square-one@https://codeload.github.com/.../<sha>` key — `square-one: true` is
rejected. **The sha changes on every tag here**, so each square-one release needs a
matching edit in every consumer. If that grates, the fix is in this repo: commit
`dist/` so no build step is needed and tags become drop-in. Not done yet — committing
build output is its own trade, and one consumer is not enough evidence.

**The first render watch happened (2026-07-26) and caught two real spec defects
in Dosado's return leg.** Round one: dancers veered *outward* to twice the lane
offset after beat 4 — the "backward pass is the time-reversal of the forward
pass" model was endpoint-invisible and wrong (the pass starts already in its
lane), and the spec table had skipped exactly the beat where the bulge lived.
Round two: the first fix's straight-back-plus-sidestep had a 90° corner the
watcher (a dancer) rejected, and CALLERLAB's definition agrees — *"walking a
smooth circular path … slide slightly to the left"*. Final form: `pass` gained a
3-beat **`close`** exit (back at half walking pace, then a final-beat diagonal
onto home — the opening veer mirrored), **Dosado is a three-block chain**
(2+1+3 = 6), spec tables list **every** beat, and the definition's adverbs are
treated as geometry. **Dosado is the first call to graduate from "provisional
until rendered" to render-validated.** 41 tests green. See
[journal 9](journal/2026-07-26-first-render-validation-9.md).

**Same day: `Motion.grips` landed — F2's per-beat hand-engagement channel.**
Spans `{ hand, grip: "forearm", from, to }`; `arm-turn` emits contact→release,
`pass`/`slide` emit none (hands-free as a positive fact), composition shifts
spans with their blocks. Prompted by the render watch (Allemande read as
unconnected — townage now aims engaged forearms from this data) and doubles as
the foundation for the accessibility brief's tactile-channel analysis. townage
consumed this via the ADR-0006 local link at the time. **`v0.2.0` is now tagged,
pushed, and consumed** (2026-07-28, `660fe33`; minor not patch, since `grips` is
new API surface) — the-lot resolves it from the tarball with the link override
dropped, and pnpm runs this package's `prepare` on install because `dist/` is
gitignored.

**Next: M4** — the townage choreography adapter, which is the first thing to actually
render these paths and validate the waypoints marked "provisional until rendered".
Pass Thru and Allemande Left still await their render watch.

Deferred to after the first render (planning M6): **Right and Left Grand**
(`pull-by` + the first 8-dancer circle frame), Promenade (`promenade-step`), Square
Thru (`face-turn` + reuse), Partner Trade (`arc-walk`), California Twirl + Star Thru
(`twirl-arch`; first role-dependent). Call-model review still open: Layer-4 v1
scope, two-couple-safe types, concepts.

## Architecture

square-one is the engine seam of the square-dance game family planned in
`~/Development/work/square-dance-planning/` (its ADR-0003 set the repo split, ADR-0004
the paths-as-data seam). This repo's own decisions:

- Rigor tier: provable-lite, TypeScript — [ADR-0001](adr/0001-typescript-provable-lite.md)
- Storage: none — pure library; consumers own persistence — [ADR-0002](adr/0002-pure-library-no-storage-no-ui.md)
- Roles: boy/girl canonical, pluggable presentation labels — [ADR-0003](adr/0003-roles-boy-girl-with-alternative-labels.md)
- Public interface: the performance stepper is primary, ideal paths derive from it — [ADR-0007](adr/0007-stepper-primary-ideal-paths-derived.md)
- Distribution: consumers take a **pinned git dependency** (local link during
  co-development) — planning **ADR-0006**
  (`square-dance-planning/adr/0006-townage-consumes-square-one-as-pinned-git-dependency.md`)

## Provability

`fast-check` property tests over the invariants `spec/call-model.md` named before
any of this was implemented:

- **The anchor invariant** (ADR-0006 via ADR-0007): with every coefficient off the
  stepper reproduces the ideal path exactly. Under ADR-0007 this changed character —
  it is no longer two implementations agreeing but one stepper degenerating
  correctly, so it cannot silently diverge.
- Waypoints run beat 0 → the block's beat count, strictly monotonic, across block
  boundaries too.
- A block's final waypoint is its exit pose; a chain's beats are its blocks' beats.
- Roll direction always agrees with the sign of accumulated rotation; non-rotating
  blocks cannot roll (the structural reason CALLERLAB lists Dosado and Pass Thru as
  cannot-roll).
- Mirroring negates `x` and the rotation.
- Embedding is a **rigid motion**: distances between consecutive waypoints survive
  placement into a square.
- Accumulated rotation stays signed and unwrapped, because F4 measures
  same-direction rotation *across* transitions.
- Pair symmetry: dancer B's path is always A's rotated 180°.
- Chains never develop a positional gap (`checkChain`).

Not yet covered: collision-freedom between dancers (needs more than a pair),
breathing, and formation recognition — all beyond the three starter calls.

## Spec/code disagreements found by the conformance suite — both resolved

Two, both surfaced by the ADR-0009 suite on its first run, both fixed 2026-07-25.
**No tripwires remain: 37 tests, 0 expected failures.** They are recorded because
the *pattern* is the useful part — in each case the suite proved a disagreement but
could not say which side was wrong, and the first guess about which side went the
wrong way once.

1. ~~**`arm-turn`'s Facing column**~~ — **fixed 2026-07-25** (spec + generator
   together, per ADR-0009; tripwire flipped back to a passing test). The column
   rotated clockwise against a counterclockwise orbit. The decisive evidence was in
   the spec's own definition of the `hand` parameter — *"the pivot is on your left
   as you walk forward"* — which is a testable constraint the old column failed at
   every row: head-on facing puts the counterpart in front, not on the named side.
   Correct rule is `facing = position angle ± 90°` (tangential). The first
   implementation was also wrong: it fixed the direction but inherited the phase,
   so five rows changed, not two. Confirmation that tangential was always the
   intent: the beat-3 "Doing" cell already read "sweeps to the east side **moving
   north**" — `+y` — next to a Facing cell claiming `+x`. Total rotation is
   unchanged at `fraction × ±360°`, so momentum, roll and the F2 pairing are
   unaffected. Newly documented: the 90° turn-in at contact is entry travel, not
   accumulation.
2. ~~**`dosado.md`'s full-call table**~~ — **the table was right; the `pass` block
   was wrong.** Fixed 2026-07-25 in `src/blocks/pass.ts`, with the rule written into
   [`spec/blocks/pass.md`](spec/blocks/pass.md).

   `direction: backward` was implemented as the spec's literal words — "negates the
   y-progression" — keeping the lane veer on the first beat. It should be a full
   **time-reversal** of the forward pass: travel straight, veer on the closing beat.
   Dosado's beat 4 is the only waypoint in the whole starter set where the
   difference is observable, because **the exit pose is identical either way**. The
   endpoints matched, the call returned home correctly, and one intermediate
   waypoint was 0.15 off.

   Worth keeping: the first diagnosis of this said the chain "nets −0.15 instead of
   returning home" and blamed the table's arithmetic. Both halves were wrong — the
   chain resolved home exactly, 5 of 6 rows already matched, and the defect was in
   the code. Reasoning about the deltas produced a confident wrong answer;
   *composing it and printing the waypoints* produced the right one in seconds.

## Worklist

1. ~~Pick the starter scope~~ — **done 2026-07-24**: the Zero Box triple + Square
   Thru equivalence set, nine Basic calls (ADR-0004, [`spec/starter-set.md`](spec/starter-set.md)).
2. **Partially done, then paused by ADR-0005.** Migrate starter calls from
   `mix-a-hoot-n-hollar/docs/moves.md` → per-call specs under `docs/spec/` (Layer-3
   fields: timing, paths, roll/sweep, hands, parts, standard applications; role
   tokens per ADR-0003). **Three of nine done** — Dosado, Pass Thru, Allemande Left.
   The remaining six resume after the first render (planning M6), so they're
   written against visual feedback. Partner Trade is net-new. Track in the
   starter-set status table.
3. ~~Core types~~ — **done**: `geometry.ts` (facing is degrees CCW-positive, forced
   by `arm-turn`'s signed rotation delta) and `types.ts` (dancer identity, pose,
   waypoint, momentum, motion). Two-couple-safe: nothing assumes 8 dancers.
   Formation and FASR records are **not** built — no starter call needs them yet.
3b. ~~The three blocks as generators, the three calls as block chains~~ — **done**
   (ADR-0008). `Motion.entry` had to be added along the way: block-local frames are
   not uniform (`arm-turn` is grip-centred, `pass`/`slide` are dancer-centred), so
   composition aligns on the entry pose rather than the origin. A property test
   found that, not a review.
3b-i. ~~The **spec-conformance loader** (test-only)~~ — **done** (ADR-0009). Parses
   `docs/spec/**/*.md`, keys each waypoint table off its `` `block(args)` — N beats: ``
   signature line, and throws naming the file when a signature isn't followed by a
   well-formed table. It caught two real spec defects on its first run — see
   "Known spec defects" above.
3c. ~~The **stepper** (ADR-0007), degenerate first~~ — **done**. `createPerformance`
   ticks, honours externally-driven dancers (the player), and `idealPaths` emits the
   ADR-0004 shape. The coefficients exist as a typed, all-off record; the pursuit
   mechanics behind them land with M4, when a renderer can show what they do.
3d. Consumable build: `package.json` with `exports` and emitted types is **done**;
   the v0 tag and a real install from townage are **M2** (planning ADR-0006).
4. Formation recognition + call application for the starter formations (static
   square, facing/back-to-back couples, eight-chain-thru, R&L-grand circle,
   promenade). Only the ones the three calls touch are needed for the first render.
5. Property-test harness (`fast-check`) seeded with the starter-set vectors
   (Dosado identity, the equivalences, working-zero classification, triple-ends-home)
   plus the published flow vectors in [`spec/flow-and-variety.md`](spec/flow-and-variety.md)
   (Dosado scores clean on rotation rules; the Guidelines' 540° example trips
   overflow for heads only; `Star Thru → R&L Thru` passes hand availability while
   the reverse order fails). The ADR-0006 anchor invariant is now *structural* under
   ADR-0007 — it tests one code path degenerating, not two agreeing — but still gets
   a property test.
5b. Path representation must support signed-rotation accounting and
   rotation-center classification (flow/variety needs them — design in from the
   start, per `flow-and-variety.md` consequence 3).
6. Remaining call-model review questions (Layer-4 v1 scope, two-couple types,
   concepts) — resolve as the types force the issue, ADR anything decided.

Deferred with reasons: multiplayer/sync concerns (belongs to the games, not the
engine); higher-level concepts (As Couples, Tandem — arc doesn't need them yet).

## Supply chain

The posture in `.claude/skills/project-conventions/SKILL.md` is enforced in
[`pnpm-workspace.yaml`](../pnpm-workspace.yaml) — square-one is the first TypeScript
project instantiated from the template, so this is where the abstract policy became
concrete config. It took two attempts ([ADR-0011](adr/0011-configure-the-age-gate-where-pnpm-reads-it.md)
supersedes [ADR-0010](adr/0010-wait-out-the-age-gate-rather-than-except-it.md)):

- **`minimumReleaseAge: 1440`** (1 day) — the age gate, at [pnpm's own recommended
  value and v11 default](https://pnpm.io/settings), whose rationale is that "in most
  cases, malicious releases are discovered and removed from the registry within an
  hour." Stated explicitly rather than inherited, so a default change can't move it
  silently. **Verify with `pnpm config get minimumReleaseAge` → `1440`.**
- **`overrides: "brace-expansion@5": ">=5.0.8"`** — GHSA-mh99-v99m-4gvg /
  CVE-2026-14257 (High, CVSS 7.5, DoS). OSV gives one range, introduced `0` fixed
  `5.0.8`, so everything below it is affected. **Scoped to the 5.x line deliberately:**
  brace-expansion 5.x changed its export shape, so forcing it onto `minimatch@3.1.5`
  throws `expand is not a function` on any brace-containing pattern. A blanket override
  passes every gate here — square-one's eslint globs have no braces — and takes
  `pnpm lint` down with exit 2 in `the-lot`, whose config uses `**/*.{ts,tsx}`.
- **`auditConfig.ignoreGhsas`** carries the residual 1.x/2.x copies. Not a quarantine
  wait, not a severity call: **no patched version is compatible with `minimatch@3`'s
  API.** Dev-only path; this package ships `dist/` and never carries it to a consumer.
  Drop the override and the ignore together when the toolchain stops pulling
  `minimatch@3`.
- **[`osv-scanner.toml`](../osv-scanner.toml) carries the same ignore, and has to**
  (added 2026-07-29). `auditConfig` is read by `pnpm audit` and by nothing else; CI's
  `osv-scan` job runs osv-scanner with `fail-on-vuln: true` against its own config and its
  own database. Two scanners, two formats, one posture — each file points at the other, and
  they are dropped together. See [The ninth gate nobody was
  running](#the-ninth-gate-nobody-was-running).
- Install scripts stay blocked (pnpm's default); no exceptions have been needed — the
  vitest/esbuild toolchain runs fine unbuilt, so there is deliberately no `allowBuilds`.
- Lockfile committed; CI installs frozen. Package manager pinned to **pnpm 11.5.3**,
  matching `the-lot`, so the family shares one config location.

All supply-chain gates pass locally: `pnpm audit --audit-level=high`, `pnpm audit
signatures`, and the license allowlist all exit 0 — and, since 2026-07-29, so does the OSV
scan (below), which is the one that wasn't.

### The ninth gate nobody was running

*2026-07-29 — fixed and confirmed green in Actions (run `30486329759`, commit `fdb4bd2`).*

**`osv-scan` had failed on every run in this repo's history**, and the local
signal said otherwise the whole time: `pnpm audit --audit-level=high` reported
`1 high (1 ignored)`, which reads as "the posture is configured". It was configured for one
of the two scanners. osv-scanner never reads `pnpm-workspace.yaml`, so it saw an unignored
High and exited 1.

`the-lot` had learned this on 2026-07-25 and written it down — "osv-scanner reads its own
config file, not pnpm's" — then deleted its `osv-scanner.toml` later the same day, to keep
one ignore in one place. Good instinct, wrong target: the two files aren't two records of
one decision, they're config for two programs. Both repos were red from that point.

**The part worth keeping is how it stayed invisible.** The OSV job is a *reusable workflow*,
and both repos had recorded that it "can't be exercised from a local checkout" — true of the
workflow, false of the scanner that decides it. Reproduced and then verified against a clean
`git archive` export, so `node_modules` couldn't change the answer:

```
docker run --rm -v "$PWD:/src" -w /src ghcr.io/google/osv-scanner:v2.3.8 -r ./
```

Before: exit 1, the brace-expansion finding, 236 packages scanned — matching CI's log line
for line. After: `Loaded filter from: /src/osv-scanner.toml`, `No issues found`, exit 0. The
CI run then said the same thing from `/github/workspace/osv-scanner.toml`, which is what makes
the local command trustworthy as a stand-in rather than merely reassuring.
**A gate you believe can't run locally is worth ten minutes of trying anyway.** This is the
same lesson as 2026-07-28's — run what CI runs, not a hand-rolled approximation — arriving
from the other direction: there, the approximation was too lenient; here, a gate was skipped
entirely because it was assumed unreachable.

### The first attempt was inert — worth remembering

`minimum-release-age=10080` in `.npmrc` did **nothing**. Resolving from scratch with the
value at `0` and at `10080` produced byte-identical lockfiles, and `npm` reports
`Unknown project config`. It was the wrong key, in the wrong file, on a pnpm major whose
default was `0` — and it was reported as "verified live" on the strength of an experiment
that changed two variables at once and credited the wrong one.

The sibling repo had it right by accident: `the-lot` runs pnpm 11, which turns the gate on
by default, so it was protected the whole time while square-one was not. The review that
prompted this had the two repos exactly backwards.

Lesson kept: **a supply-chain control that isn't verified isn't a control.** The check is
one command, and it belongs in any review of this config.

## Reference material

Local git-ignored `reference/callerlab/` holds the six CALLERLAB PDFs the specs are
written against (definitions, timing charts, standard applications) — see
[`spec/reference-sources.md`](spec/reference-sources.md) for the re-download map and
the copyright posture (public repo ⇒ cite and paraphrase, never commit the PDFs). No
CALLERLAB membership needed; all documents verified publicly downloadable 2026-07-24.

## Open questions

- ~~**Distribution**~~ — **decided 2026-07-25**: pinned git dependency, local link
  during co-development (planning **ADR-0006**,
  `square-dance-planning/adr/0006-townage-consumes-square-one-as-pinned-git-dependency.md`).
  Revisit when hash-n-patter arrives as a second consumer.
- ~~**Teaching content**~~ — **decided 2026-07-29** by planning **ADR-0008**
  (`square-dance-planning/adr/0008-teaching-content-is-townage-data-engine-stays-pure.md`).
  **Standing constraint on this repo: square-one gains no teaching metadata of any kind** —
  no prerequisites, no difficulty, no lesson ordering, and it is never told that anything is
  being taught. Consumers derive prerequisite ordering from block composition and hold
  difficulty themselves, because difficulty is a tuning judgment about one game rather than a
  fact about square dance. What this repo contributes is the teachable *structure* that
  [ADR-0005](adr/0005-building-blocks-first-class.md) already built — blocks with entry
  contracts, timing, hands and composition rules. `docs/spec/blocks/arm-turn.md` already
  states the relationship: the NPC-taught arm turn **is** that block. If hash-n-patter ever
  wants the same difficulty ordering townage has, that ordering has become a shared fact and
  belongs in the block catalog — a new ADR, not a field quietly added in two places.
- **`externallyDriven` is implemented and property-tested here, and no consumer has ever
  passed it.** `src/stepper.ts` honours it and `test/properties.test.ts:330` asserts a driven
  dancer is marked as such — but the-lot declares the option and has never supplied it, so the
  player has never actually been in a square. The engine side is proven; the seam is not.
  Don't read the green tests as end-to-end evidence.
- The four model questions listed at the end of [`spec/call-model.md`](spec/call-model.md).
- ~~Whether `docs/spec/` call files or generated JSON become the runtime call data
  (spec-as-source vs spec-as-documentation)~~ — **decided 2026-07-25, and the binary
  was false**. The markdown was never a candidate source: blocks are parameterized
  generators whose specs hold only worked instantiations (`pass` shows 2 of 8
  combinations, `arm-turn` 1 of 12+), with the general rule written as prose; two of
  three call specs contain no geometry at all. Blocks are code, calls are
  JSON-serializable block chains ([ADR-0008](adr/0008-runtime-data-is-code-and-plain-data-not-spec-markdown.md)),
  and the markdown's worked examples become conformance fixtures parsed by the test
  suite ([ADR-0009](adr/0009-spec-markdown-is-the-conformance-fixture.md)).
- **Database / backend: deliberately not yet.** The engine never touches storage
  (ADR-0002); custom-move building runs client-side with file/URL sharing under
  the template's browser-storage default. The **named trigger** for the backend
  deliberation is the social layer — sharing/discovery/review of custom moves,
  sequences, and tips *between people* (the template's own threshold). The
  constraint honored *now* so that graduation needs no redesign: blocks, moves,
  sequences, and tips serialize as versioned plain data (ADR-0005 consequence).

---

_History accretes below, oldest first. See [`journal/`](journal/README.md) for the narrative
and [`reviews/`](reviews/README.md) for stance reviews._

- **2026-07-24** — Repo created from template; bootstrap + call-model research. See
  [`journal/2026-07-24-bootstrap-and-call-model.md`](journal/2026-07-24-bootstrap-and-call-model.md).
- **2026-07-24** — Roles decision: boy/girl canonical with pluggable labels
  (ADR-0003). See [`journal/2026-07-24-roles-decision-1.md`](journal/2026-07-24-roles-decision-1.md).
- **2026-07-24** — CALLERLAB reference library pulled (no membership needed);
  starter scope decided: Zero Box triple + equivalence set, nine calls (ADR-0004).
  See [`journal/2026-07-24-starter-set-2.md`](journal/2026-07-24-starter-set-2.md).
- **2026-07-24** — Flow & variety model drafted from the CALLERLAB Choreographic
  Guidelines (found + saved to `reference/`) and the challengedance.org flow rules:
  quantified flow rules F1–F7, variety rules V1–V6, delivery-timing model; Layer 4
  and the hand-availability row updated (naive hand-alternation superseded). See
  [`spec/flow-and-variety.md`](spec/flow-and-variety.md).
- **2026-07-24** — ADR-0005 building blocks first-class; Dosado recomposed
  (`pass`+`slide`); custom-move workshop + social layer added to the planning arc;
  database deferred with named trigger. See
  [`journal/2026-07-24-building-blocks-4.md`](journal/2026-07-24-building-blocks-4.md).
- **2026-07-24** — ADR-0006 two-layer choreography: ideal paths + pursuit
  simulation with toggleable dancer coefficients (incl. per-move skill and the
  Dunning-Kruger helper; demeanor deferred). Re-centering settled via `pass`'s
  `exit` parameter; **Pass Thru specced** as the first pure-reuse composition.
  See [`spec/performance-model.md`](spec/performance-model.md).
- **2026-07-25** — ADR-0007: the performance stepper becomes the primary interface,
  ideal path data derives from it. Forced by the townage integration plan — a player
  dancing inside a square can't be precomputed, and square-frame re-fitting /
  corner-rounding / helping all react to actual positions. Distribution settled
  (pinned git dep) and call speccing paused at three so the engine core and the
  townage renderer can validate the provisional waypoints. See
  [`journal/2026-07-25-integration-path-7.md`](journal/2026-07-25-integration-path-7.md).
- **2026-07-25** — ADR-0008 + ADR-0009 close the spec-as-source question: blocks are
  code, calls are plain-data block chains, and the specs' worked examples become
  test-parsed conformance fixtures. See
  [`journal/2026-07-25-spec-as-fixture-8.md`](journal/2026-07-25-spec-as-fixture-8.md).
