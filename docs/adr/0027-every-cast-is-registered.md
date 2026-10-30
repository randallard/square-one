# ADR-0027: Every `any` and `as` cast is justified inline and registered
- Status: Accepted
- Date: 2026-10-29
- Deciders: Ryan (proposed by Claude, from the 2026-10-29 compliance review)

## Context
[ADR-1012](1012-strictness-extras-offered-at-project-start.md) asks every project to record
whether it adopts the `any` registry: every `any`/`as` justified inline and listed in
`docs/any-registry.md`. square-one predates that ADR and never answered it
([compliance 2026-10-29](../compliance/2026-10-29.md)).

square-one is the engine every game in the family consumes ([ADR-0002](0002-pure-library-no-storage-no-ui.md)),
and its rigor comes from the type system plus property tests ([ADR-0001](0001-typescript-provable-lite.md)).
A cast is a place the type system was told to stand down, which is exactly what a property test
can't see. Today there is **one**: `src/calls.ts:326`, in `sized`, where a computed key `{ [key]: wanted }`
widens to `{ [x: string]: number }` and is asserted back to `Record<K, number>`.

## Decision
Adopt the `any` registry. Every `any` and every `as` other than `as const` carries an inline
comment saying why it is sound, and is listed in `docs/any-registry.md` with its file, line and
reason. A new cast without both doesn't merge.

## Alternatives considered
- **No registry.** The baseline lint already forbids `any` in most positions (`strictTypeChecked`),
  so the registry would mostly police `as`. Lost because the cost is one entry today and the
  library is the shared core: a cast here is a cast in every consumer.

## Consequences
- `docs/any-registry.md` exists with one entry, and `sized`'s cast gets its inline reason.
- Nothing enforces the listing mechanically yet; it's a review check (and a compliance item).
  Promotion trigger: a cast found unregistered in review, then add a CI grep that diffs casts
  against the registry.
