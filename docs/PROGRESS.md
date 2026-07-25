# Progress & Status

_Last updated: 2026-07-24_

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

**Next:** Ryan reviews the **Allemande Left** spec
([`spec/calls/allemande-left.md`](spec/calls/allemande-left.md)) and the
[`arm-turn`](spec/blocks/arm-turn.md) block — the catalog's first rotating,
hands-engaged block (exit parameter `step-out | hold` per Ryan's call; left =
CCW; fraction table from the chart; carries an open **F4 nuance**: anchored
rotation should weight lighter than free-body rotation, accumulation counted
across transitions). Then, talk-first per the working cadence, the next move:
**Right and Left Grand** — introduces `pull-by` and the **first 8-dancer circle
frame**. Remaining after that: Promenade (`promenade-step`), Square Thru
(`face-turn` + reuse), Partner Trade (`arc-walk`), California Twirl + Star Thru
(`twirl-arch`; first role-dependent). Then core types + property seeds (chaining
checks, the performance anchor invariant). Call-model review still open: Layer-4
v1 scope, two-couple-safe types, concepts.

## Architecture

square-one is the engine seam of the square-dance game family planned in
`~/Development/work/square-dance-planning/` (its ADR-0003 set the repo split, ADR-0004
the paths-as-data seam). This repo's own decisions:

- Rigor tier: provable-lite, TypeScript — [ADR-0001](adr/0001-typescript-provable-lite.md)
- Storage: none — pure library; consumers own persistence — [ADR-0002](adr/0002-pure-library-no-storage-no-ui.md)
- Roles: boy/girl canonical, pluggable presentation labels — [ADR-0003](adr/0003-roles-boy-girl-with-alternative-labels.md)

## Provability

Nothing verified yet — no code. The property-test targets are already named in
[`spec/call-model.md`](spec/call-model.md) (collision-freedom, path/formation
round-trips, timing sums, roll/sweep derivation consistency, symmetry preservation,
zero-module identity, breathing bounds) so the invariants precede the implementation.

## Worklist

1. ~~Pick the starter scope~~ — **done 2026-07-24**: the Zero Box triple + Square
   Thru equivalence set, nine Basic calls (ADR-0004, [`spec/starter-set.md`](spec/starter-set.md)).
2. Migrate the nine starter calls from `mix-a-hoot-n-hollar/docs/moves.md` →
   per-call specs under `docs/spec/` (Layer-3 fields: timing, paths, roll/sweep,
   hands, parts, standard applications; role tokens per ADR-0003). Partner Trade is
   net-new. Track in the starter-set status table.
3. Core types: dancer, formation, FASR, call record — two-couple-safe (don't
   hard-code 8 dancers).
4. Formation recognition + call application for the starter formations (static
   square, facing/back-to-back couples, eight-chain-thru, R&L-grand circle,
   promenade).
5. Property-test harness (`fast-check`) seeded with the starter-set vectors
   (Dosado identity, the equivalences, working-zero classification, triple-ends-home)
   plus the published flow vectors in [`spec/flow-and-variety.md`](spec/flow-and-variety.md)
   (Dosado scores clean on rotation rules; the Guidelines' 540° example trips
   overflow for heads only; `Star Thru → R&L Thru` passes hand availability while
   the reverse order fails).
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

- **Distribution**: how the-lot and hash-n-patter consume square-one — published npm
  package, git dependency, or pnpm workspace. Deliberately undecided until
  hash-n-patter exists; a git dependency is the likely v1.
- The four model questions listed at the end of [`spec/call-model.md`](spec/call-model.md).
- Whether `docs/spec/` call files or generated JSON become the runtime call data
  (spec-as-source vs spec-as-documentation).
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
