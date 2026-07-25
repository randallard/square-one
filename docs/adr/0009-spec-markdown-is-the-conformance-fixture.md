# ADR-0009: The spec markdown's worked examples are conformance fixtures, parsed by the test suite
- Status: Accepted
- Date: 2026-07-25
- Deciders: Ryan, Claude

## Context

[ADR-0008](0008-runtime-data-is-code-and-plain-data-not-spec-markdown.md) puts the
runtime source in TypeScript and plain data, and takes the spec markdown out of the
build path. That leaves the specs able to disagree with the code silently — which
matters more here than in most libraries, because the specs are the *reviewed*
artifact. The working cadence is talk-first: a call is researched, drafted in
markdown, and reviewed before anything is built. If the markdown stops describing
what the code does, the review loop is reviewing fiction.

Two things make this cheap to solve. The worked examples are already
fixture-shaped — tables of expected `(beat, x, y, facing)` for a named
instantiation. And they already follow a consistent convention without anyone
having planned one: every block waypoint table is preceded by exactly

```
`blockname(args)` — N beats[; …]:
```

across all four tables in `pass.md`, `slide.md` and `arm-turn.md`.

## Decision

A **test-only** loader parses `docs/spec/**/*.md`, extracts each waypoint table
keyed by the signature line above, and asserts the implementation reproduces it
exactly. The markdown is **authoritative** for the examples it contains — it is
the artifact that was reviewed, so the code conforms to it, not the reverse.

Nothing outside the test suite reads markdown; the published build is unaffected.

## Alternatives considered

- **Generate committed TS fixtures from the markdown, diff in CI** — rejected for
  now: a build step plus a committed derivative that is stale between
  regenerations, to solve a problem the test suite can solve directly.
- **Hand-copy the tables into TS fixtures** — rejected: reintroduces exactly the
  drift this ADR exists to prevent, across nine calls' worth of numbers.

## Consequences

- **The spec work already done becomes the test suite.** The waypoint tables, the
  beat sums ("beats sum to the chart's 6 ✓"), and Dosado's derived table all become
  assertions. Dosado's is the strongest: compose the four-block chain, embed it in
  the pair frame, and assert it reproduces the authored table — a real composition
  property, not a duplicated constant.
- **A constraint on how future specs are written**, and six starter calls are still
  to come: the signature-line convention must hold for a table to be picked up. It
  is already the house style, so this formalizes rather than changes practice.
- The loader must **fail loudly** — naming file, heading and signature — when a
  table doesn't match the convention. A silently skipped table is worse than no
  loader at all, because it looks like passing coverage.
- Test-suite health now couples to documentation formatting. Accepted deliberately:
  a docs typo failing a test with a clear message is the good failure mode, and the
  alternative is a docs typo failing nothing.
- The `provisional until rendered` waypoints get locked in by tests *before* they
  are visually validated. That is intended — the tests pin what the spec currently
  claims, so when rendering corrects a path, the spec and the code have to be
  updated together and the diff shows both.
- **Promotion condition:** if parsing proves brittle in practice, or a second
  consumer needs the fixtures outside the test run, the generated-fixtures
  alternative becomes the better trade.
