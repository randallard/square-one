# ADR-0008: Runtime call data is code plus plain data — the spec markdown is not a source
- Status: Accepted
- Date: 2026-07-25
- Deciders: Ryan, Claude

## Context

PROGRESS has carried an open question phrased as "whether `docs/spec/` call files or
generated JSON become the runtime call data (spec-as-source vs
spec-as-documentation)". The engine-core milestone forces it: the three specced
blocks have to become something executable.

Reading the specs settles it, because the binary was false — the markdown was never
a candidate source:

- **Blocks are parameterized generators, and the specs contain only worked
  instantiations.** `pass` has 8 parameter combinations and two waypoint tables;
  `slide` has 2 and one table; `arm-turn` has 12+ and one table. Every other
  combination is covered by a *prose rule* — "`shoulder: left` mirrors x",
  "`direction: backward` negates the y-progression", "fractions truncate the orbit
  and exit from that point". A parser cannot extract data that isn't there; the
  generator has to be implemented either way.
- **Most call specs contain no geometry at all.** `pass-thru.md` and
  `allemande-left.md` have zero waypoint tables — they are pure block reuse.
  Dosado has one, and it states in the file that it is "the composition's
  embedding into the pair frame": derived from its four-block chain, not authored.
- **[ADR-0005](0005-building-blocks-first-class.md) already forces a runtime
  authoring format.** The custom-move workshop lets players compose moves from the
  block catalog at runtime — a path with no markdown anywhere in it — and that
  ADR's consequence is that blocks, moves and sequences serialize as versioned
  plain data. Markdown-sourced built-in calls plus plain-data custom moves would be
  two representations of the same thing, breaking that ADR's "identical mechanism"
  promise.

## Decision

Blocks are implemented as **parameterized generator functions in TypeScript**.
Calls are **declarative block chains as JSON-serializable plain data** — the same
structure the custom-move workshop emits and the social layer will share. The
`docs/spec/` markdown is not in the build path and nothing is generated from it.

Dosado's runtime definition is its chain — `pass(fwd,R,lane) · slide(R) ·
pass(back,L,lane) · slide(L)` — carrying no waypoints of its own.

## Alternatives considered

- **Spec-as-source: parse the markdown tables into runtime data at build time** —
  rejected. It cannot work as stated: the tables cover a small fraction of each
  block's parameter space, and the generative rule is English prose. It would also
  put doc formatting in the build path of a published library.
- **Hand-author duplicate waypoint data per call alongside the specs** — rejected:
  that is the drift this question was really about, multiplied by nine calls.

## Consequences

- ADR-0005's identical-mechanism promise becomes real: a built-in call and a
  player's custom move are the same kind of object.
- Calls get cheaper, not more expensive, as the block catalog grows — two of the
  three specced calls are already pure reuse with no geometry to author.
- The markdown is freed to hold what data can't: CALLERLAB citations and the
  reprint permission, `provisional until rendered` status, the open F4 nuance,
  "related but distinct call" warnings, game notes.
- **The cost is drift** — nothing yet stops the specs and the code disagreeing.
  That is addressed separately by [ADR-0009](0009-spec-markdown-is-the-conformance-fixture.md),
  which is what makes this decision safe rather than merely convenient.
- **Promotion condition:** if a future block turns out to be pure authored data
  with no generative rule (a fixed, unparameterized figure), it can be authored as
  plain data directly without revisiting this — the decision is about where the
  *source of truth* lives, not about banning data.
