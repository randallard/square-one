# 2026-09-12 — the ignore was standing on a reason that had expired

_Uncommitted at the time of writing — config, so it waits on Ryan._

Ryan, after v0.5.0 went out: *"check those runs."* The release's CI was red, and had been red
since **v0.4.0's release on 2026-08-22**. `ts fast gates` passed — typecheck, lint and all 224
tests — so the engine was never the problem. `ts supply chain` and `osv-scan` were, and nothing
in this repo had noticed for three weeks because nobody had looked at a run whose code gates
were green.

## 🔴 The interesting failure is not a version, it is an ignore

`auditConfig.ignoreGhsas` carried `GHSA-mh99-v99m-4gvg`, with this reason:

> *"No patched version is compatible with minimatch@3's API; dev-only path, never shipped in
> `dist/`."*

That was **true when it was written and is not true now.** brace-expansion has since been patched
**per line** — 1.1.18 for the 1.x consumers reached through minimatch@3, 2.1.4 for 2.x, 5.0.9 for
the rest — so an override reaches everywhere and the ignore reaches nothing. townage removed the
same ignore for the same reason on 2026-08-15. This repo kept it for another month, because
**nothing fails when an ignore nobody needs is still there**: osv-scanner just quietly reports
that it filtered two vulnerabilities an override would have fixed outright. An ignore is a claim
about the world, and this one had stopped being checkable without anybody touching it.

So the ignore is gone from both config formats — `pnpm-workspace.yaml` and `osv-scanner.toml`,
which have to move together and say so in each other's comments.

## The overrides, and why every one is bounded

This repo had a single unbounded `"brace-expansion@5": ">=5.0.8"`. townage's equivalent block
carries a warning this repo lacked, learned by measuring it twice:

> `">=1.1.18"` on its own does not mean *"the 1.x line, patched"*. Semver compares across majors,
> so pnpm satisfies it with **5.0.9**, and every 1.x consumer gets the 5.x export shape —
> brace-expansion 1.x exports the function itself and 5.x does not. `pnpm lint` then dies with
> `TypeError: expand is not a function` the moment a config pattern contains braces.

The old comment here even admitted the near miss: *"a blanket override passes CI here only
because this repo's eslint globs happen to have no braces in them — a latent break, not a fix."*
Bounding the ranges removes the latent break as well as the advisory.

| package | was | now | advisory |
|---|---|---|---|
| brace-expansion 1.x | ignored | `>=1.1.18 <2` | GHSA-rgw5-rvv9-x895 |
| brace-expansion 2.x | ignored | `>=2.1.4 <3` | GHSA-rgw5-rvv9-x895 |
| brace-expansion 5.x | `>=5.0.8` unbounded | `>=5.0.9 <6` | GHSA-rgw5-rvv9-x895 |
| js-yaml | — | `>=4.3.2 <5` | GHSA-5p4m-2wfm-xmqj (4.3.1) **and** GHSA-2883-xcg3-v3hh (4.3.2) |
| nanoid | — | `>=3.3.18 <4` | GHSA-2v37-7h3g-55p8 |
| vitest / @vitest/mocker | 4.1.10 | **4.1.11** | GHSA-82fw-gwwq-j7x9 |

🔑 **js-yaml is the one to learn from.** Two advisories land on the same package, fixed one patch
apart. A range satisfying only the first passes the day it is written and goes red when the second
arrives — which is what took townage's supply-chain job red on its first push after 08-22, on a
bound that had been correct for a month. Satisfy the later fix, not the one in the ticket you are
reading.

## Verified

`pnpm audit --audit-level=high` → **no known vulnerabilities found**. 224 tests, `tsc`, lint and
build all clean; brace-expansion resolves to **1.1.18, 2.1.4 and 5.0.9 side by side**, which is
the per-line patching the old stance said did not exist.
