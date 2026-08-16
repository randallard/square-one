# 2026-08-15 — sequences, and the capability that was named but never built

_Documents `1e01a45`._

First code in this repo since 2026-07-29. Planning **ADR-0011** re-ordered the milestone
table: NPCs dance a complete sequence before the player joins one, in three increments — S1
one couple, S2 two couples, S3 the full square. This is S1's first slice.

## The finding that justified the increment

**"Are we home" did not exist.** [ADR-0004](../adr/0004-starter-scope-zero-box-triple.md)
names home resolution as a starter-set capability and has since 2026-07-24. Before this
commit, the only occurrence of the word "home" in `src/` was a comment inside Dosado's chain
explaining a diagonal blend.

That matters more than a missing function. The CALLERLAB module system this repo's starter
scope is built on is *made of* zeros — a get-in reaches a formation, a zero preserves it, a
get-out resolves it. A starter set that cannot check a zero cannot check its own specs, and
the specs have been asserting zeros in prose for three weeks.

## Why a sequence is not `compose` again

`compose` chains **blocks** inside one call, in one dancer's local frame. `danceSequence`
chains **calls** across a **set**. The difference is not size:

- Composition is per-dancer and independent. A sequence is the set moving together.
- **"Are we home" is a fact about all of them at once and no individual dancer can answer
  it.** After Pass Thru each dancer stands exactly where *the other one* started — so
  "everybody is on a starting position" is true, and the set is emphatically not home. A
  per-dancer check passes that, and there is now a test named for it.

## Four claims that were prose and are now checked

| claim | result |
|---|---|
| Dosado is the geometric identity (ADR-0004) | home, **0.0000** off — and still a zero danced twelve times, drifting less than a tenth of the tolerance |
| Pass Thru exchanges places | misses by exactly **1**, the pair's own separation |
| Allemande Left is a get-out, not a zero | misses by exactly `0.5 − STEP_OUT_RADIUS`, **and** a quarter turn |
| calls chain with nothing between them | every call's entry is the previous call's exit, per dancer |

The Allemande number is the one worth recording how I got. The first probe printed `0.0800`
and my instinct was that a full arm turn should return the dancer to their own spot, so 0.08
looked like accumulated drift. It is not: `arm-turn`'s `step-out` exit finishes at
`STEP_OUT_RADIUS` 0.42 where the dancer entered at the pair radius 0.5, and 0.5 − 0.42 is
exactly the miss. **Chased before writing a test around it**, which is the difference between
a test that pins a spec and a test that pins whatever the code happened to do — and the test
now asserts against the spec's constant rather than the literal.

## The distinction I built room for, and it is about to be needed

`danceSequence` seeds the set from `applyCallToPair` and then composes each dancer
**independently** from their own exit pose. Today that is invisible, because every starter
call is 180°-symmetric and deriving B from A would give the same answer.

🔴 **`applyCallToPair` cannot express Star Thru.** It derives B as A rotated 180° about the
pair centre, so B's exit facing is always A's + 180°. Star Thru ends both dancers facing the
**same** direction — the gent turns a quarter right, the lady a quarter left, and they end
side by side. `counterpart` has no way to say that. It is the first call for which
`roleDependent: true` — a field that has existed and been `false` since 2026-07-24 — has to
mean something.

Found while scoping rather than while building, which is the cheap end to find it.

## Also

My module header linked to the planning effort at `../../work/…`, which **escapes the repo** —
the exact class of link the 2026-07-29 docs gate was built to reject. It slipped through
because `docs-hygiene.py` scans `docs/`, not `src/`. Unlinked by hand. Worth knowing that the
guard has a blind spot rather than assuming it covers comments.

61 tests (from 44), lint clean, typecheck and build clean.
