# 2026-10-29 (1): the standards batch comes in — 30

🧪 Uncommitted, for Ryan's look. No engine code changed (one inline comment on a cast).

Ryan asked for square-one's first compliance review before starting Star Thru, then *"do them
all"*. [Compliance 2026-10-29](../compliance/2026-10-29.md) found the docs in good order and the
gates green, but the template's 2026-10 standards batch had never come in. All nine gaps fixed:

- **Inherited ADRs 1000–1017** copied in unchanged, indexed under their own heading; the
  template's `project-conventions` and `stance-review` skills and `CLAUDE.md` taken whole (never
  edited here).
- **CI** (`ci.yml`, `docs-hygiene.yml`, `stance-review.yml`, `docs-hygiene.py`) taken from the
  template: `timeout-minutes` on every job, the **gitleaks secret scan** (no leaks in 77 commits,
  run locally with the pinned binary), Node 24. `engines` `>=24`. The-lot's CI still runs Node 22;
  it doesn't set `engineStrict`, so that's a warning there, not a failure.
- **TypeScript 6.0.3** (ADR-1010): typecheck, lint, 254 tests and the build pass with no change.
- **Lint:** `switch-exhaustiveness-check` plus the other two named rules at error, `--max-warnings 0`.
- **Exact pins** on every dev dependency.
- **pnpm explicit** (ADR-1016): `trustPolicy: no-downgrade`, `blockExoticSubdeps`, empty
  `allowBuilds`. 🔴 `trustPolicy` failed the frozen install on its first run:
  `hosted-git-info@6.1.3`, npm's hand-published 6.x backport the day after 8.0.1 shipped with
  provenance. Excepted by exact version (the-lot's `semver@6.3.1` is the same shape).
- 🔴 **The audit was already red:** 7 advisories (1 high), vite 8.1.5 and `@vitest/mocker`
  4.1.11, dev-path. vitest → 4.1.12; vite is vitest's **peer**, so an override (by `vite@8`, then
  by name) changed nothing: the installed peer stayed 8.1.5 with an "unmet peer" warning. Pinned
  `vite` 8.1.6 as a direct dev dependency instead. Audit clean, signatures verified, licences pass.
- **ADR-1012's answers**, as **Proposed** ADRs for Ryan: [0027](../adr/0027-every-cast-is-registered.md)
  (cast registry: yes; [`docs/any-registry.md`](../any-registry.md) has the one `src` cast and the
  test's two) and [0028](../adr/0028-no-accessibility-lint-in-a-library-with-no-ui.md) (a11y lint: no UI, no).
- `.env.example` (empty, says why) and the template's secret block in `.gitignore`.
- **First stance review:** [2026-10-29](../reviews/2026-10-29-stance-review.md). Nothing stale but
  **pnpm 12**, deferred to be evaluated with the-lot (its git dependencies now resolve to HTTPS).
  ADR-0020's trigger, "Star Thru needs an arch height", is the next call.

⏳ **Next:** Ryan looks → commit (and accepts or changes 0027/0028). Then Star Thru.
