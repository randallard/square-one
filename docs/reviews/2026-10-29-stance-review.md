# Stance review — 2026-10-29
- Reviewer: Claude, for Ryan
- Previous: first

Run the same day as the first compliance review ([compliance 2026-10-29](../compliance/2026-10-29.md)),
whose fixes brought in the template's standards batch. This review checks the standing decisions
against current sources after those fixes.

## Checked

1. **Promotion conditions, every ADR (0001–0028).** Grepped `docs/adr/0*.md` for promotion
   conditions and "until / revisit / not yet" claims; read each hit.
   - ADR-0001 (provable-lite, promote the geometry kernel to Rust + Kani if an invariant resists
     `fast-check`): no invariant has resisted. 254 tests pass, 19 `fc.assert`s. **Unchanged.**
   - ADR-0012, 0014, 0015, 0016, 0019, 0021, 0022, 0025, 0026 (geometry and sequence scope): none
     of their triggers (a role-dependent call, a Trade family call danced by non-couples, a
     non-measurement in `chainsAt`, a second figure needing outside clearance, a body that changes
     mid-sequence, a tighter-than-drawn call, non-linear interpolation, a persisting override, a
     wave or line ending) has arrived. **Unchanged.**
   - **ADR-0020: "Star Thru needs an arch height."** Star Thru is the next call (the-lot 10-29,
     Ryan). The trigger is about to fire, as designed: the field arrives with the call that reads it.
   - **ADR-0024: "a call whose two dancers rotate together under the arch."** Star Thru's turn in
     opposite directions (its spec), so not this one. **Unchanged.**
   - ADR-0018 ("two is not yet" a third thing in the gap): still two. **Unchanged.**
   - ADR-0008, 0009 (spec markdown as fixture; parsing brittleness): no brittleness reported in
     journals 26–29. **Unchanged.**
2. **"Not available yet" claims, against current sources.**
   - ADR-1010's exit trigger (a): `npm view typescript-eslint@latest peerDependencies.typescript` →
     `>=4.8.4 <6.1.0` (8.72.1). TypeScript 7.0.2 is out but the lint gate still can't run it.
     **Trigger not met; stay on 6.0.3.**
   - ADR-0011 (1440-minute age gate where pnpm reads it; "revisit if pnpm changes its recommended
     default"): pnpm 12's release notes (github.com/pnpm/pnpm/releases/tag/v12.0.0) list no change
     to `minimumReleaseAge`. **Unchanged.** Its rider, "drop the brace-expansion override once the
     toolchain no longer pulls `minimatch@3`": `pnpm-lock.yaml` still has `minimatch@3.1.5`. **Keep.**
3. **Config vs the tool's recommended baseline.** `pnpm-workspace.yaml` now states
   `minimumReleaseAge`, `trustPolicy: no-downgrade`, `blockExoticSubdeps` and `allowBuilds`
   (ADR-1016), and `trustPolicy` caught one entry on first run (`hosted-git-info@6.1.3`, npm's own
   hand-published 6.x backport, excepted by exact version with a retirement condition).
4. **Advisories.** `pnpm audit` before the fixes: 7 (1 high), all vite / `@vitest/mocker`, dev-path.
   Fixed by pinning `vitest` 4.1.12 and `vite` 8.1.6 directly (vite is vitest's *peer*, so an
   override didn't reach it). After: `No known vulnerabilities found`; `pnpm audit signatures`:
   236 verified; licence allowlist passes; gitleaks 8.30.1 over history: no leaks. Not run:
   osv-scanner (Docker isn't available to this user here); CI runs it.
5. **Rigor tier.** Still provable-lite, honestly: no Rust, and every invariant claimed is a
   `fast-check` property in `pnpm test`.
6. **Template drift.** After the compliance fixes, `docs/adr/1000–1017`, `project-conventions`,
   `stance-review`, `ci.yml`, both other workflows, `docs-hygiene.py`, `CLAUDE.md` and the
   `.gitignore` secret block match `template/main`. Not taken: `.kiro/agents/project.json` (a Kiro
   agent; this repo isn't worked in Kiro), `.cargo/config.toml` (no Rust).
7. **Last review's deferrals.** First review.
8. **Package-manager majors.** **pnpm 12 is out** (12.16.1, 2026-10-27); `packageManager` is
   `pnpm@11.5.3`. See Actions.

Also current, not stances: ESLint 10 (typescript-eslint 8.65 accepts `^10`), vitest 5, fast-check
4.10. Version bumps, not decisions.

## Findings

- **pnpm 12 needs evaluating before `packageManager` moves (ADR-1016).** Its major changes that
  touch this family: git dependencies on GitHub now resolve to HTTPS and the lockfile never records
  an SSH URL, and unrecognized `pnpm-workspace.yaml` keys warn or fail. The-lot consumes square-one
  as a pinned git dependency with a tarball-keyed `allowBuilds` entry, so the move belongs to both
  repos at once.
- Nothing else is stale.

## Actions

- **Deferred: pnpm 12.** Evaluate it in the-lot and square-one together, when the next release of
  square-one is pinned in the-lot; check that the-lot's git dependency and its `allowBuilds` key
  survive the HTTPS change, and that neither workspace file has a key pnpm 12 rejects.
- No new ADRs from this review. ADR-0027 (cast registry) and ADR-0028 (no a11y lint) came from the
  compliance review and are **Proposed**, for Ryan.
- Next look: 30 days (2026-11-28), or sooner if typescript-eslint accepts TS 7.
