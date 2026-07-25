# Progress & Status

_Last updated: 2026-07-25_

## Status / next

**Status:** Bootstrapped, pre-code. Architecture decided and recorded (ADR-0001
TypeScript/provable-lite, ADR-0002 pure library — no storage/UI/IO, ADR-0003 roles,
ADR-0004 starter scope). [`spec/call-model.md`](spec/call-model.md) holds the
four-layer state model (three review questions still open);
[`spec/starter-set.md`](spec/starter-set.md) holds the first implementation target —
the CALLERLAB-listed Zero Box triple + equivalence suite over nine Basic calls.
Reference PDFs are local (git-ignored, mapped in
[`spec/reference-sources.md`](spec/reference-sources.md)). No source code yet;
`package.json` doesn't exist, so CI's language jobs self-skip.

**Course change (2026-07-25): call specs pause at three; code starts now.** The
planning effort's [ADR-0005](../../work/square-dance-planning/adr/0005-integration-first-cut-to-code-at-three-calls.md)
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

**Next:** Ryan verifies ADR-0007 and these PROGRESS edits. Then **engine core**:
`package.json`, core types (two-couple-safe), the three specced blocks as runtime
data, composition, and the degenerate stepper that yields ideal paths — scoped to
what three calls need, not nine. Property seeds first: the ADR-0006 anchor
invariant, timing sums, Dosado identity.

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
  co-development) — planning [ADR-0006](../../work/square-dance-planning/adr/0006-townage-consumes-square-one-as-pinned-git-dependency.md)

## Provability

Nothing verified yet — no code. Note that under ADR-0007 the ADR-0006 anchor
invariant (all coefficients off ⇒ ideal paths) changes character: it's no longer two
implementations agreeing, it's one stepper degenerating correctly. Still tested,
but it can't silently diverge. The property-test targets are already named in
[`spec/call-model.md`](spec/call-model.md) (collision-freedom, path/formation
round-trips, timing sums, roll/sweep derivation consistency, symmetry preservation,
zero-module identity, breathing bounds) so the invariants precede the implementation.

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
3. Core types: dancer, formation, FASR, call record — two-couple-safe (don't
   hard-code 8 dancers). **Now next**, scoped to what the three specced calls need.
3b. The three specced blocks (`pass`, `slide`, `arm-turn`) as **parameterized
   generator functions**, and the three calls as **JSON-serializable block chains**,
   so `applyCall` works for those three (ADR-0008). Two of the three calls are pure
   reuse and carry no geometry of their own.
3b-i. The **spec-conformance loader** (test-only): parse `docs/spec/**/*.md`, key
   each waypoint table off its `` `block(args)` — N beats: `` signature line, assert
   the generators reproduce it; fail loudly on any table that doesn't match the
   convention (ADR-0009). Dosado's derived table becomes a composition property —
   compose the chain, embed in the pair frame, assert it matches. Beat sums too.
3c. The **stepper** (ADR-0007), degenerate first: no coefficients, no externally
   driven dancers — which by construction yields ADR-0004 ideal path data. The
   externally-driven-dancer port (for the player) lands with the townage adapter.
3d. Consumable build: real `package.json` with `exports` and built types, plus a v0
   tag, so townage can install it (planning ADR-0006).
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

## Reference material

Local git-ignored `reference/callerlab/` holds the six CALLERLAB PDFs the specs are
written against (definitions, timing charts, standard applications) — see
[`spec/reference-sources.md`](spec/reference-sources.md) for the re-download map and
the copyright posture (public repo ⇒ cite and paraphrase, never commit the PDFs). No
CALLERLAB membership needed; all documents verified publicly downloadable 2026-07-24.

## Open questions

- ~~**Distribution**~~ — **decided 2026-07-25**: pinned git dependency, local link
  during co-development (planning
  [ADR-0006](../../work/square-dance-planning/adr/0006-townage-consumes-square-one-as-pinned-git-dependency.md)).
  Revisit when hash-n-patter arrives as a second consumer.
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
