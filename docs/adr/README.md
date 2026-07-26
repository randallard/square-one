# Architecture Decision Records (ADRs)

Significant decisions for **square-one**, one file per decision, with the context and
consequences — so the *why* survives, not just the *what*.

The recognized practice is the **ADR** (Michael Nygard, 2011), commonly written with the
**MADR** (Markdown Any Decision Records) template. We use a MADR-lite form.

## Conventions

- Files: `NNNN-kebab-title.md`, zero-padded, monotonically increasing.
- Status values: `Proposed` · `Accepted` · `Superseded by ADR-XXXX` · `Deprecated`.

### One decision per file

An ADR records **one** decision. If your file has a numbered list of decisions in it, you have
written a policy document, not an ADR — split it.

The test: **if you can't supersede one part of it, it's too big.** A file bundling eleven
decisions can never be superseded, because a new ADR replacing it would throw out the ten that
were fine. So the only available move becomes editing it in place — which is how bloat quietly
destroys immutability. These are not two separate failures; the first causes the second.

`docs-hygiene` warns when an ADR crosses the size tripwire. Treat the warning as a prompt to
split, not a number to tune.

### Immutable in substance

To change a decision, write a **new** ADR that supersedes the old one, and flip the old one's
status to `Superseded by ADR-XXXX`. Don't rewrite history.

Precisely what that allows and forbids:

| Part of the file | Mutable? |
|---|---|
| The `- Status:` line | ✅ that's what it's for |
| The index table in this README | ✅ it's an index |
| Typo / broken-link fixes | ✅ |
| `## Context`, `## Decision`, `## Consequences` | ❌ **frozen once Accepted** |
| Adding a new decision to an existing ADR | ❌ **write a new ADR** |
| "Amended on <date>" blocks | ❌ that's an edit wearing a hat |

If you find yourself writing "amended" inside an accepted ADR, stop: what you have is a new
decision, and it deserves its own number and its own supersession link.

### Superseding

1. Write `NNNN-new-title.md` with the new decision. In its Context, say what it replaces and
   **why the old reasoning stopped holding** — that's the valuable part, and it's the thing
   an in-place edit destroys.
2. In the old ADR, change only the Status line to `Superseded by [ADR-NNNN](NNNN-new-title.md)`.
3. Update the index below.

A superseded ADR stays in the repo, unedited, forever. Someone reading the new one needs to see
what was believed before and what changed.

## Template

Copy [`TEMPLATE.md`](TEMPLATE.md).

```markdown
# ADR-NNNN: <title>
- Status: Proposed | Accepted | Superseded by ADR-XXXX
- Date: YYYY-MM-DD
- Deciders: <names>

## Context
<forces at play, constraints, what makes this non-obvious>

## Decision
<what we chose, stated plainly — ONE decision>

## Consequences
<results, good and bad; what this commits us to>
```

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0000](0000-record-architecture-decisions.md) | Record architecture decisions (use ADRs) | Accepted |
| [0001](0001-typescript-provable-lite.md) | TypeScript at the provable-lite tier | Accepted |
| [0002](0002-pure-library-no-storage-no-ui.md) | Pure library — no storage, no UI, no IO | Accepted |
| [0003](0003-roles-boy-girl-with-alternative-labels.md) | Model roles as boy/girl, with pluggable alternative labels | Accepted |
| [0004](0004-starter-scope-zero-box-triple.md) | Starter scope — the Zero Box module triple plus the Square Thru equivalence set | Accepted |
| [0005](0005-building-blocks-first-class.md) | Calls are compositions of first-class building blocks | Accepted |
| [0006](0006-two-layer-choreography.md) | Two-layer choreography — ideal paths, pursued by simulated dancers | Accepted |
| [0007](0007-stepper-primary-ideal-paths-derived.md) | The performance stepper is the primary interface; path data is derived from it | Accepted |
| [0008](0008-runtime-data-is-code-and-plain-data-not-spec-markdown.md) | Runtime call data is code plus plain data — the spec markdown is not a source | Accepted |
| [0009](0009-spec-markdown-is-the-conformance-fixture.md) | The spec markdown's worked examples are conformance fixtures, parsed by the test suite | Accepted |
| [0010](0010-wait-out-the-age-gate-rather-than-except-it.md) | When the audit gate and the age gate conflict, wait rather than except | Superseded by [0011](0011-configure-the-age-gate-where-pnpm-reads-it.md) |
| [0011](0011-configure-the-age-gate-where-pnpm-reads-it.md) | Configure the age gate where pnpm actually reads it, at pnpm's recommended window | Accepted |
