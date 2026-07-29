# 2026-07-29 — two scanners, and a gate that had never once passed

*Documents commit `df89ec8`. Continues from
[first render validation](2026-07-26-first-render-validation-9.md).*

Ryan asked a one-line question — "can you see if the run is failing on github?" — and the
answer was yes, in both repos, for two independent reasons, neither of which any local
command had ever reported.

## The gate that had never passed

`osv-scan` has failed on **every run in this repository's history**. Not since a regression:
always. The `v0.2.0` push was simply the most recent instance.

The finding was `brace-expansion` GHSA-mh99-v99m-4gvg — the same advisory
[ADR-0011](../adr/0011-configure-the-age-gate-where-pnpm-reads-it.md) reasoned about and
deliberately ignored, with a reason that is still correct: no patched version is compatible
with `minimatch@3`'s API, the path is dev-only, and this package ships `dist/` so it never
carries the vulnerable code to a consumer. Nothing about the posture was wrong.

What was wrong is *where it was written*. `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml`
is read by `pnpm audit` and by nothing else. osv-scanner has its own config file and its own
database, and CI runs it with `fail-on-vuln: true`. One posture, two programs, and only one
of them had been told.

The sibling repo makes this sharper rather than softer. `the-lot` **discovered this exact
fact on 2026-07-25** and wrote it in its journal — "osv-scanner reads its own config file,
not pnpm's. Two ignores for one advisory, in two tools, over two databases" — then deleted
its `osv-scanner.toml` later the same day, on the principle that one advisory deserves one
ignore in one place. The principle is a good one. It just wasn't available here: those two
files are not two records of one decision, they are configuration for two different
programs. So the correct insight was found, written down, and then reasoned away within a
day.

## Why nobody noticed for three days

This is the part worth keeping.

The local signal actively said the opposite. `pnpm audit --audit-level=high` reports
`1 high (1 ignored)` — which reads as *the posture is configured and working*. It was, for
`pnpm audit`. The gate that disagreed was one nobody could see.

And both repos had explicitly recorded *why* they couldn't see it: the OSV job is a reusable
workflow, and the 2026-07-25 CI notes say it "can't be exercised from a local checkout."
**That is true of the workflow and false of the scanner**, and the scanner is what decides
the job. The container the reusable workflow pulls is an ordinary public image:

```
docker run --rm -v "$PWD:/src" -w /src ghcr.io/google/osv-scanner:v2.3.8 -r ./
```

Run against a clean `git archive` export — so a local `node_modules` couldn't change the
answer — it reproduced CI exactly before the fix: 236 packages scanned, the same two
brace-expansion rows, exit 1. After adding `osv-scanner.toml`: `Loaded filter from:
/src/osv-scanner.toml`, `No issues found`, exit 0.

Ten minutes. Three days of red CI, and one sentence of inherited belief standing between
them.

This is 2026-07-28's lesson from the other side. That day it was *run what CI runs, not a
hand-rolled approximation* — an approximation that was too lenient. Today a gate was skipped
altogether because it had been written off as unreachable. The general form covers both:
**a gate you cannot run is a gate you cannot trust, so find out whether you really can't.**

## The other failure: links that only resolve on one machine

`docs hygiene` was failing on four links — three in `docs/PROGRESS.md` pointing at
`../../work/square-dance-planning/adr/…`, one in
[journal 9](2026-07-26-first-render-validation-9.md) pointing at `../../../the-lot/docs/…`.

They resolve perfectly on Ryan's machine. `~/Development/` holds all three checkouts side by
side, so `../../work/…` is a real file, `scripts/docs-hygiene.py` says `docs hygiene clean`,
and a fresh clone — which is what CI is — has no siblings at all.

Same shape as the `node_modules/square-one → ../square-one` link that made 2026-07-28's test
runs unverifiable: **a developer's directory layout quietly standing in for the repository.**
Running what CI runs doesn't help here, because the command was never the difference; the
checkout was.

So the check itself changed. `check_links` now tests whether a link escapes the repo root
*before* testing whether it exists:

```python
if resolved == ".." or resolved.startswith(".." + os.sep):
    rep.error(f"{path}: link escapes the repo -> {shown} ...")
elif not os.path.exists(resolved):
    rep.error(f"{path}: broken link -> {shown}")
```

Order is the entire point. Existence-first passes exactly where the link is least
trustworthy. Escape-first fails on the author's machine, where it can be fixed, instead of
only in CI. Verified both ways — an escaping link and an ordinary broken link appended to a
doc produce two distinct errors, then the file was restored.

The fix for the links themselves was constrained by something worth writing down: **the
planning effort has no GitHub remote.** `~/Development/work` lives on `acer-ts`/`acer-lan`
only. So a cross-repo URL was available for the one the-lot reference and not for the three
planning references, which became unlinked inline code — the style `docs/PROGRESS.md` was
already using for these same paths a few lines away.

`scripts/docs-hygiene.py` is byte-identical in both repos and came from
`cr-ci-cd-rust-typescript-template`. The guard belongs upstream; it hasn't been sent there
yet.

## State

Both gates green locally in both repos. square-one: lint 0, 44 tests, build clean, audit
`1 high (1 ignored)`, docs hygiene clean, and osv-scanner exit 0 against a clean export.
Nothing pushed at the time of writing — `the-lot` is 11 commits ahead of its origin and its
whole M4 arc has still never run in Actions, which is what will actually prove this.
