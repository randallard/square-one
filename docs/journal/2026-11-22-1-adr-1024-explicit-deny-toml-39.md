# 2026-11-22 (1): template ADR-1024, an explicit `deny.toml` — 39

Follows [journal 38](2026-11-21-1-adr-1023-renovate-automerge-38.md). Template ADR-1024 (`51b0a28` +
`a013203`, GitHub `300d4e4`): the template ships an explicit `deny.toml`, with `unmaintained = "all"`,
because cargo-deny 0.22 narrowed the default to direct dependencies. Ryan: *"Do it"*.

- `docs/adr/1024-…`, copied byte-identical, plus its index row.
- `deny.toml`, the template's, byte-identical. This repo had none. The `rust supply chain` job is
  skipped here (no Rust yet), so nothing reads it until there's a crate.
- **The pin isn't in this change.** cargo-deny-action v2.1.1 → v2.1.3 is Renovate's #15, which is green
  with automerge enabled and should merge itself on Renovate's next run. Putting the bump here as well
  would only make the two conflict. If #15 hasn't merged by the time this one does, merge it by hand.

Branch `adr-1024-explicit-deny-toml`. `main` is protected, so it goes in through a PR, set to auto-merge
once CI is green. *Allow auto-merge* is now on for this repo (Ryan: *"Yes auto merge"*), so Renovate's
green PRs, #15 included, merge as soon as their checks pass instead of on Renovate's next run.

Not taken here: the-lot's ADR-0077 (Renovate off the Vercel build quota, a Monday window). square-one
doesn't deploy to Vercel, so it has no build quota to protect.
