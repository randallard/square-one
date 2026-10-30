# ADR-0028: No accessibility lint, because square-one has no UI
- Status: Accepted
- Date: 2026-10-29
- Deciders: Ryan (proposed by Claude, from the 2026-10-29 compliance review)

## Context
[ADR-1012](1012-strictness-extras-offered-at-project-start.md) asks every project to record
whether it adopts accessibility lint (jsx-a11y, or axe checks for non-JSX UIs). square-one never
answered it ([compliance 2026-10-29](../compliance/2026-10-29.md)).

## Decision
No accessibility lint. square-one is a pure library with no UI, no DOM and no JSX
([ADR-0002](0002-pure-library-no-storage-no-ui.md)); there's nothing for it to check.

## Consequences
- Accessibility belongs to the consumers that render (the-lot, hash-n-patter), each of which
  answers ADR-1012 for itself.
- Revisit only if square-one ever ships UI, which ADR-0002 would have to be superseded to allow.
