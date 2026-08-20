# Progress & Status

_Last updated: 2026-08-19_

## Status / next

**▶ RIGHT NOW (2026-08-19) — the arch has a hand in the gap, and the second Twirl had lost the
bow. Both LANDED, committed as `b3a02eb` — still awaiting Ryan's verify.** **193 tests** (from
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

### ⚠️ Owed

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
