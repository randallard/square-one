# 2026-07-25 — the spec-as-source question dissolved

_Documents commit `af85b82` (ADR-0008 and ADR-0009)._

Took this on while the townage docs retrofit runs on another machine. It had been
sitting in PROGRESS as "spec-as-source vs spec-as-documentation" since the repo was
bootstrapped, and I'd flagged it as the first open question M1 would force.

It turned out not to be a choice. I went to read the specs properly before arguing
either side, and the markdown was never a candidate source:

- `pass` has 8 parameter combinations and **two** waypoint tables. `slide` has 2 and
  one. `arm-turn` has 12+ and one. Everything else is a prose rule — "`shoulder:
  left` mirrors x", "fractions truncate the orbit and exit from that point". You
  can't parse data that isn't written down. The generator gets implemented either
  way.
- `pass-thru.md` and `allemande-left.md` have **no waypoint tables at all**. They're
  pure reuse. I'd forgotten that when I framed the question.
- Dosado's table says in the file that it's "the composition's embedding into the
  pair frame" — derived from the block chain. I wrote that and then filed a question
  premised on it being a source.

And ADR-0005 had already settled it from the other direction without my noticing:
the custom-move workshop composes moves at runtime with no markdown in the path, and
its serialization consequence is versioned plain data. If built-in calls came from
markdown while custom moves were plain data, the "identical mechanism" promise would
have been a lie.

So: blocks are generator functions, calls are JSON-serializable block chains,
markdown is out of the build path (ADR-0008).

## The part I actually like

The drift problem that made the question feel urgent gets solved by turning it
around. The worked examples are already fixture-shaped — tables of expected
`(beat, x, y, facing)` for a named instantiation. And they already follow a
consistent convention that nobody designed: every table is preceded by
`` `blockname(args)` — N beats: ``, in all four across three files. So the test
suite parses the specs and asserts the code reproduces them (ADR-0009). The spec
work isn't documentation about the engine — it's the test suite, written before the
engine.

Dosado's derived table is the best one: compose the four blocks, embed in the pair
frame, assert it reproduces the authored waypoints. That's a real composition
property, not a duplicated constant. Same for "beats sum to the chart's 6 ✓", which
I'd checked by hand.

Markdown is authoritative, code conforms — because markdown is the artifact that
gets reviewed under the talk-first cadence. Reviewing a doc the code has quietly
diverged from is reviewing fiction.

One consequence I want on the record because it looks wrong at first: this pins the
`provisional until rendered` waypoints in tests *before* they've been visually
validated. That's intended. The tests pin what the spec currently claims, so when
M4's renderer corrects a path, spec and code have to move together and the diff
shows both. Locking in a value you expect to change is fine as long as changing it
is loud.

Formalized the table convention in `spec/blocks/README.md` — it's load-bearing now,
and six more calls are coming.
