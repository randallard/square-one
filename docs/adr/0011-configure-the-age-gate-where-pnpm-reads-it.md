# ADR-0011: Configure the age gate where pnpm actually reads it, at pnpm's recommended window
- Status: Accepted
- Date: 2026-07-25
- Deciders: Ryan, Claude

## Context

This supersedes [ADR-0010](0010-wait-out-the-age-gate-rather-than-except-it.md), which
decided to leave the audit gate failing and wait for `brace-expansion@5.0.8` to age out
of a 7-day quarantine. **That decision rested on a control that did not exist.**

`minimum-release-age=10080` was written into `.npmrc`. It was never honoured. Verified
by resolving from scratch with the value at `0` and at `10080` and getting byte-identical
lockfiles; `npm` itself reports `Unknown project config "minimum-release-age"`. The
earlier claim that it had been "verified live" came from a bad experiment — a dependency
was added in the same step as the `.npmrc`, and the resulting change in resolution was
credited to the gate rather than to the new dependency.

So ADR-0010's central premise was false in both directions. Nothing was holding the patch
back, so nothing would have changed on the date it named; and the repo was not making a
principled trade between two protections, it was declining a fix while protected by
neither.

Checking pnpm's own documentation settled how it should be done:

- [pnpm 11 enables `minimumReleaseAge` **by default at 1440 minutes**](https://pnpm.io/blog/releases/11.0)
  (one day). Before v11 the default was `0`.
- pnpm settings belong in **`pnpm-workspace.yaml`**; from v11, "`.npmrc` is auth/registry
  only". The setting was in the wrong file as well as the wrong repo state.
- [pnpm recommends 1440](https://pnpm.io/settings), with the rationale that "in most
  cases, malicious releases are discovered and removed from the registry within an hour."

The sibling repo `the-lot` runs pnpm 11 and therefore had a real, working one-day gate
the whole time — inherited from its package manager rather than configured. square-one,
on pnpm 10, had none. The comparison that prompted this review had it exactly backwards.

The advisory itself is real: GHSA-mh99-v99m-4gvg / CVE-2026-14257, High, CVSS 7.5. OSV
gives it a single range — **introduced `0`, fixed `5.0.8`** — so every version below
5.0.8 is affected with no per-line patch. `5.0.8` was published `2026-07-23T11:39Z` and
is now 61 hours old, long past any recommended window. Waiting was never what stood
between this repo and the fix.

## Decision

Configure the age gate where pnpm reads it, at the value pnpm recommends:
`minimumReleaseAge: 1440` in `pnpm-workspace.yaml`, with square-one moved to pnpm 11 to
match `the-lot` so the family shares one config location.

Stated explicitly rather than left to the v11 default, so that a future change to that
default cannot move it silently and so the value is visible to anyone reading the repo.

Take the patched `brace-expansion` via an `overrides` entry **scoped to the 5.x line**
(`"brace-expansion@5": ">=5.0.8"`), not a blanket one — see below.

## Alternatives considered

- **Keep waiting, as ADR-0010 said** — rejected: there was nothing to wait for. The date
  it named was derived from a gate that was not in effect.
- **Keep 10080 (7 days), now that it would work** — rejected: seven times pnpm's own
  recommendation, and the number was invented rather than reasoned. The documented
  rationale is that malicious publishes are usually caught within an hour; a day is the
  margin pnpm judges appropriate, and diverging from it upward has a real cost in delayed
  security patches — exactly the trap ADR-0010 fell into.
- **Stay on pnpm 10 and find the key it honours** — rejected: the family should share one
  package-manager major and one config location. Two repos disagreeing about where
  supply-chain settings live is how this defect survived in the first place.

## Consequences

- The gate is now **verifiable**: `pnpm config get minimumReleaseAge` returns `1440`,
  where previously it returned `undefined`. Any future claim that it works can be checked
  in one command, and that check belongs in any review of this config.
- **The override has to be scoped, and finding that out was the sharp edge.** A blanket
  `brace-expansion: ">=5.0.8"` collapses the whole tree to the patched version and passes
  every gate in this repo — but it is broken. brace-expansion 5.x changed its export shape
  (1.x exported the function itself), so `minimatch@3.1.5` throws `expand is not a
  function` the moment a pattern contains braces. It passed here only because square-one's
  eslint globs (`dist/**`, `**/*.js`) happen to contain none. The same blanket override
  took `pnpm lint` down with exit 2 in `the-lot`, whose config uses `**/*.{ts,tsx}`.
  Scoping to `brace-expansion@5` fixes the modern consumers and leaves `minimatch@3` on a
  working 1.x.
- **A residual vulnerable copy therefore remains**, and is ignored in `auditConfig` — not
  as a quarantine wait and not as a severity judgement, but because *no patched version is
  compatible with `minimatch@3`'s API*. That reason is recorded at the ignore. Dev-only
  path; this package ships `dist/` and never carries brace-expansion to a consumer.
- Both gates pass: `pnpm audit --audit-level=high`, `pnpm audit signatures`, licenses,
  lint, typecheck, 37 tests, build.
- ADR-0010's *precedent* does not carry forward as stated, because it was reasoning about
  a trade that was not actually being made. What survives is the question underneath it —
  **can the vulnerable code reach a consumer?** — which remains the right first question
  and which, here, correctly identified the exposure as low. The error was in the facts,
  not the framing.
- **Promotion condition:** if a needed security patch is ever genuinely blocked by this
  1440-minute window, prefer `minimumReleaseAgeExclude` for that one package over lowering
  the gate globally or excepting the advisory. If pnpm changes its recommended default,
  revisit this value against the new rationale rather than keeping 1440 out of inertia.
  Drop the `brace-expansion` override and its audit ignore together once the toolchain no
  longer pulls `minimatch@3`.
- **Standing check this decision earns:** a green audit is not evidence an override is
  safe. An override that changes a package's major must be exercised on the code path that
  uses it — here, one `node -e` call against a brace pattern — before it is believed.
