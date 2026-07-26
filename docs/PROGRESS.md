# Progress & Status

_Last updated: 2026-07-25_

## Status / next

**Status: the engine core exists.** M1 of the planning effort's milestone table.
`src/` implements the three specced blocks as parameterised generators, the three
starter calls as plain-data block chains, composition with chaining checks, and the
ADR-0007 stepper whose degenerate case emits ADR-0004 ideal paths. `test/` carries
the ADR-0009 spec-conformance loader plus fast-check property tests.

Local gate run, all green except one: **lint 0 problems · typecheck clean · 35
tests pass (+2 expected-fail tripwires) · build emits `dist/` · docs-hygiene clean**.
`pnpm audit --audit-level=high` **fails** — see "Supply chain" below; it is a
devDependency-only advisory whose only fix is inside the age gate.

Architecture is decided and recorded (ADR-0001 TypeScript/provable-lite, ADR-0002
pure library, ADR-0003 roles, ADR-0004 starter scope, ADR-0005 blocks, ADR-0006
two-layer choreography, ADR-0007 stepper-primary, ADR-0008 code-not-markdown,
ADR-0009 specs-as-fixtures). [`spec/call-model.md`](spec/call-model.md) holds the
four-layer state model (three review questions still open);
[`spec/starter-set.md`](spec/starter-set.md) holds the wider target. Reference PDFs
are local (git-ignored, mapped in [`spec/reference-sources.md`](spec/reference-sources.md)).

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

**Next:** Ryan verifies the engine core before it's committed. Then **M2** — the
consumable package: the build already emits `dist/` with types, so what remains is
a v0 tag and confirming townage can install it over the pinned git dependency
(planning ADR-0006). Two decisions are queued for Ryan first: the two **known spec
defects** below, and the **audit-vs-age-gate conflict** under "Supply chain".

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

The posture in `.claude/skills/project-conventions/SKILL.md` is now enforced in
[`.npmrc`](../.npmrc) — square-one is the first TypeScript project instantiated from
the template, so this is where the abstract policy became concrete config:

- **`minimum-release-age=10080`** (7 days) — the age gate applied at the package
  manager, so it covers a manual `pnpm add` and not just the update bot. Verified
  live rather than assumed: re-resolving from scratch pinned `typescript-eslint`
  to **8.64.0** instead of 8.65.0, which is inside the window.
- **`ignore-scripts=true`** — install scripts stay blocked. pnpm 10 already defaults
  to this; stating it means a future default change can't silently unblock them.
  No exceptions are needed so far: vitest, esbuild and the whole toolchain run fine
  unbuilt, so `pnpm.onlyBuiltDependencies` is deliberately absent rather than empty.
- Lockfile committed; CI installs frozen.

Gate results, run locally: `pnpm audit signatures` clean, license allowlist clean
(exit 0), `pnpm audit --audit-level=high` **fails**.

### The audit gate conflicts with the age gate — decided: wait

`brace-expansion` has a high advisory (GHSA-mh99-v99m-4gvg, DoS via unbounded
expansion). Installed is 1.1.16; **the only patched release is 5.0.8, published
2026-07-23** — inside the 7-day age gate. The first collision between two house
rules that normally agree.

Exposure is genuinely low: it arrives only through devDependencies
(`typescript-eslint → minimatch` and `license-checker-rseidelsohn → glob → minimatch`),
and this package publishes `dist/` only, so it never reaches a consumer. The
realistic attack is a malicious glob pattern in our own lint run.

**Decided ([ADR-0010](adr/0010-wait-out-the-age-gate-rather-than-except-it.md)):
wait it out.** 5.0.8 becomes installable ≈**2026-07-30**; pick it up then. Neither
gate is weakened, no exception has to be remembered and removed, and nothing is
blocked in the interval — M2 is a tag and an install.

⚠️ **Until then CI's `ts-supply-chain` job fails.** That redness is accurate, not a
regression. The precedent it sets: the age gate does not yield to the audit gate by
default; what earns an exception is a vulnerability with a real path to shipped
code, not a high severity score. An advisory on a *runtime* dependency would flip
this decision — see the ADR's promotion condition.

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
