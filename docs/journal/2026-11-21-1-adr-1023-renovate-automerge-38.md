# 2026-11-21 (1): template ADR-1023, Renovate automerge — 38

Follows [journal 37](2026-11-01-4-node-26-floor-37.md). Template ADR-1023 (GitHub `04a73e3`):
routine Renovate updates merge themselves once CI passes; majors stay manual. It came from clearing
26 Renovate PRs by hand in cycle-in and branching-video. Ryan: *"do 1, 2, and 3"* (template, cycle-in
branch protection, adopt downstream).

- `docs/adr/1023-…`, copied byte-identical, plus its index row.
- `renovate.json` gets the template's two rules. Minor and patch updates of 1.0+ packages automerge, and
  so do digest, pin and lockfile-maintenance updates. Majors and 0.x minors stay manual.
  `renovate-config-validator` passes.

**The precondition (ADR-1023):** `main` had no branch protection; it now requires 7 checks (`detect languages`, `docs hygiene`, `ts fast gates`, `ts supply chain`, `SBOM`, `OSV scan / osv-scan`, `secret scan`), branches up to date, a PR (0 approvals), conversations resolved; admins not bound. Local `main` was one Renovate merge behind GitHub (#8, checkout v7.0.1), fast-forwarded first. This repo has no `origin` remote, so GitHub is pushed by URL.

Open Renovate PRs (11, including #19 vitest 5, #18 setup-node v7 and #15 cargo-deny-action v2.1.3) are
not triaged here. After this merges, the green non-major ones should merge themselves on Renovate's next
runs. The majors still need a person.
