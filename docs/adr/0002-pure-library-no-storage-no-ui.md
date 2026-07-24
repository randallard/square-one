# ADR-0002: Pure library — no storage, no UI, no IO
- Status: Accepted
- Date: 2026-07-24
- Deciders: Ryan

## Context
The template's default persistence stance (browser storage with export/import) assumes
the project is an *application*. square-one is not: it is a library consumed by the-lot
and hash-n-patter, which each own their own persistence, rendering, and player data.
The planning effort's ADR-0004 already fixed the seam: square-one emits choreography
and state as pure data; consumers do everything worldly.

## Decision
square-one has **no persistence layer, no UI, and no IO of any kind**. Its public
surface is types and pure functions. Anything a consumer wants to save (learned calls,
drill scores, square state) it serializes itself — square-one's types must therefore be
plain-data (JSON-serializable), but square-one never touches storage.

## Alternatives considered
- **Template default (IndexedDB + export/import)** — rejected as not applicable:
  there is no user data here; putting storage in the engine would drag IO into the
  functional core and couple two games' save formats.
- **Engine-provided save/load helpers** — rejected for now: serializable plain-data
  types make consumer-side persistence trivial; helpers can be added as pure
  encode/decode functions later without an architectural change.

## Consequences
- Keeps the entire library inside the provable-lite core (ADR-0001) — this is what
  makes the property tests meaningful.
- Both consumers must handle their own migration/versioning of anything they persist;
  square-one's contribution is stable, versioned plain-data types.
- No promotion condition foreseen; if the engine ever wants caching or asset loading,
  that's a new ADR because it breaks "no IO".
