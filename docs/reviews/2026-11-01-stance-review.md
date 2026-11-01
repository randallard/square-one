# Stance review — 2026-11-01
- Reviewer: Claude, for Ryan
- Previous: [2026-10-29](2026-10-29-stance-review.md)

A full pass, three days after the first, run alongside the-lot's
([the-lot 2026-11-01](https://github.com/randallard/the-lot/blob/main/docs/reviews/2026-11-01-stance-review.md))
and after today's compliance review ([compliance 2026-11-01](../compliance/2026-11-01.md)). Its
main job is the pnpm 12 deferral, whose condition has now been met.

## Checked

1. **Promotion conditions in every ADR (0001–0028).** No ADR is new since 10-29. Since then, only
   Star Thru (`df24c29`), Standard Applications and the 0.11.0 release have touched `src/`.
   - **ADR-0020, "Star Thru needs an arch height":** the trigger came and was answered in
     [journal 10-29 (2)](../journal/2026-10-29-2-star-thru-built-31.md) (lines 41–43). The arch is
     a hold the engine doesn't shape, and the path reads only `width` and `clearance`, so the field
     "still waits for a call that reads it". The ADR's example names a call that turned out not to
     need it. The condition itself (a call that reads an arch height) still stands, and nothing in
     `src/` reads one: `grep -iE 'archHeight' src` is empty, and `archClearance` (`couple.ts:102`)
     predates it. **Unchanged; the example is out of date, and the journal records why.**
   - ADR-0024 (two dancers rotating together under the arch): Star Thru turns them in opposite
     directions. **Unchanged.**
   - ADR-0001 (promote the geometry to Rust + Kani if an invariant resists `fast-check`): none has.
     272 tests pass. **Unchanged.**
   - ADRs 0012, 0014–0016, 0018, 0019, 0021, 0022, 0025, 0026: none of their triggers (a
     role-dependent call, a Trade-family call danced by non-couples, a third thing in the gap, a
     body that changes mid-sequence, a wave or line ending, and so on) came with Star Thru or
     Standard Applications. **Unchanged.**
   - ADR-0027 (cast registry), ADR-0028 (no a11y lint): too new to have fired.
2. **"Not available yet" claims, against current sources.**
   - ADR-1010 (TypeScript 6 until the lint gate supports 7): `npm view typescript-eslint@latest
     peerDependencies.typescript` gives `>=4.8.4 <6.1.0` (8.72.1), and `typescript@latest` is
     7.0.2. **Still blocked; stay on 6.0.3.**
   - ADR-0011 (one-day age gate): unchanged, set in `pnpm-workspace.yaml`.
   - **The minimatch ignore (GHSA-g3hv-75wg-m249), as written in `pnpm-workspace.yaml` and
     `osv-scanner.toml`:** "Retire when eslint and typescript-eslint depend on minimatch >= 11.0.1."
     That is still literally false: `eslint@latest` depends on `^10.2.6`, and `@typescript-eslint/typescript-estree`
     on `^10.2.2`. But **every minimatch 3 here comes from eslint 9** (`pnpm why minimatch@3`:
     `@eslint/config-array@0.21.2`, `@eslint/eslintrc`, `eslint@9.39.5`). On eslint 10 the tree's
     lowest line is 10, and 10 → 11 is a plain override: `api-standards` did exactly that today
     (eslint 10.13, `"minimatch@10": ">=11.0.1 <12"`, lint and tests green, `pnpm audit` clean).
     **There's now a route to retiring the ignore before the condition as written comes true.**
3. **Config against the tool's recommended baseline.** `pnpm-workspace.yaml` is unchanged since
   10-31: `minimumReleaseAge: 1440`, `trustPolicy: no-downgrade` (one reasoned exclusion),
   `blockExoticSubdeps: true`, `allowBuilds: {}`. pnpm 12 accepted all of it (item 8).
4. **Advisories.** `pnpm audit`: 1 moderate, ignored (minimatch, above). OSV wasn't run locally:
   Docker needs the `docker` group here, and CI runs it.
5. **Rigor tier.** provable-lite, honestly. No new invariant wants a proof.
6. **Template drift.** `git fetch template && git log --oneline HEAD..template/main -- docs/
   .github/ .claude` heads with **`dcb2924` "Sync: ADR-1018, OSV-Scanner v2.7.0…"**. ADR-1018 isn't
   here, and `ci.yml:204` is still on v2.3.8 (compliance 11-01). Item 8 shows why it matters. Also
   on the way: template **ADR-1019** (HTTP APIs linted against a vendored `api-standards` ruleset).
   It's written but not yet committed in the template. It's n/a here (no HTTP API), but square-one
   should copy the ADR when it lands so the inherited set stays complete.
7. **Last review's deferrals.** The **pnpm 12** deferral's condition ("when the next release of
   square-one is pinned in the-lot") was met on 2026-10-30 (`v0.11.0`). It was evaluated today, as
   item 8.
8. **Package-manager majors: pnpm 12, evaluated.** `pnpm@latest` is 12.16.1. In a throwaway
   worktree with `packageManager` set to `pnpm@12.16.1`:
   - `install --frozen-lockfile` passes, and "Lockfile passes supply-chain policies (301 entries)".
     No workspace key is rejected and there are no warnings, apart from a store-location note from
     the worktree being on `/tmp`.
   - A plain `install` adds **158 lines: a second YAML document** for pnpm's own packages
     (`grep -c '^---'` gives 2). This is the layout ADR-1018 is about: OSV v2.3.8 would scan only
     that document and still report clean.
   - `pnpm lint` passes. `vitest run` gives 272 passed. `build` passes. `pnpm audit` gives the same
     1 ignored. `audit signatures`: 316 verified.
   - the-lot's half (the git dependency and its `allowBuilds` entry) passes too. See the-lot's
     review.

Also current, not stances: eslint 10.14 (ties into item 2), vitest 5.0.5, vite 8.3.5, fast-check
4.10.2.

## Findings

1. **pnpm 12 is ready, but ADR-1018 has to land first.** Under pnpm 12 the lockfile becomes two
   documents, and `ci.yml`'s OSV v2.3.8 would go blind while staying green.
2. **The minimatch ignore has a route to retirement (eslint 10 plus a bounded override)** before
   its written condition comes true.
3. ADR-0020's example trigger (Star Thru) is out of date. The condition stands, and the journal
   already says so. No new ADR is needed.

## Actions

None applied. These are proposals for Ryan.

- **Adopt template ADR-1018** (copy it, bump `ci.yml:204` to `b1d267a… # v2.7.0`, take the skill
  hunk). Do this before anything else here.
- **Then move to pnpm 12** (ADR-1016's evaluation is above): `packageManager: pnpm@12.16.1`, let
  `pnpm install` add the second lockfile document, and check that CI's OSV package count matches
  `audit signatures` (316). No new ADR: ADR-1016 already covers an evaluated major bump. Do it in
  the same session as the-lot's, as planned.
- **Proposed: eslint 10, then override minimatch 10 → 11, and retire GHSA-g3hv-75wg-m249** from
  both scanners in the same commit (the two-scanner rule). That updates the ignore's recorded
  reason, not an ADR.
- Copy ADR-1019 once the template commits it.
- Next review: 30 days (2026-12-01), or sooner if typescript-eslint accepts TypeScript 7.
