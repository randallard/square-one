# 2026-10-19 — the fix sat uncommitted long enough to go stale

The 09-12 supply-chain fix ([23](2026-09-12-2-the-ignore-was-standing-on-a-reason-that-had-expired-23.md))
was still uncommitted five weeks later, and CI was still red on v0.5.0. Before committing it I
re-ran the checks the 09-12 entry says passed. The code gates still did: 224 tests, `tsc`, lint and
build all clean. **`pnpm audit --audit-level=high` did not:** 10 findings, 7 high and 3 moderate,
none of which existed when the fix was written.

| package | advisory | fixed per line |
|---|---|---|
| brace-expansion | GHSA-6j4f-fj2g-mc7p (high) — parseCommaParts recursion | 1.1.19 / 2.1.5 / 5.0.10 |
| brace-expansion | GHSA-qhr7-859c-m2p7 (high) — nested-group recursion | 1.1.20 / 2.1.6 / 5.0.11 |
| brace-expansion | GHSA-q2hr-2g5m-vwhr (moderate) — quadratic `{a},b}` rewrite | 1.1.21 / 2.1.7 / 5.0.12 |
| source-map-js | GHSA-68fv-2mgg-jv7q (high) — indexed section offsets DoS | 1.2.2 |

All of them are dev-path only. source-map-js comes in through vitest → vite → postcss.

The fix used the 09-12 pattern: raise the lower bound on each line and keep the upper bound, so
`brace-expansion@1 >=1.1.21 <2`, `@2 >=2.1.7 <3`, `@5 >=5.0.12 <6`, and add
`source-map-js@1 >=1.2.2 <2`. The bounds still matter, because a bare `>=1.1.21` resolves to the 5.x
export shape. Same lesson as js-yaml: **when advisories stack up on one package, satisfy the latest
fix.** Three of them landed on brace-expansion in five weeks.

The second lesson is about the gap itself. A fix that was verified and then left uncommitted gives
no protection, and the verification expires. Re-run `pnpm audit` before committing any
supply-chain change that has waited more than a few days.

## Verified

`pnpm audit` (all severities) → **no known vulnerabilities found**. Resolved versions are
brace-expansion 1.1.21, 2.1.7 and 5.0.12, and source-map-js 1.2.2. 224 tests pass; `tsc`, lint and
build are clean. I **did not** run osv-scanner locally because Docker isn't available to this user
on this machine. CI's `osv-scan` job is the first check against OSV.
