# 2026-11-26 (1): compliance review, and its two fixes — 40

Follows [journal 39](2026-11-22-1-adr-1024-explicit-deny-toml-39.md). The template was synced from
`data` first (`5dc34f5`), then reviewed alongside the-lot and the square-dance-planning effort
([note](../compliance/2026-11-26.md)). The result: meets the standard apart from 2 small gaps, both
docs. Ryan: *"go with all your suggestions"*.

- **`project-conventions` `SKILL.md:240`:** this repo took ADR-1024's ADR and `deny.toml` on 11-22 but
  missed the skill's one-line change (`deny.toml`'s `[bans]` `deny` list). Copied from the template;
  `diff` is now empty.
- **PROGRESS's next step:** #24 merged (`29ecdde`) and Renovate's #15 (cargo-deny-action v2.1.3) merged
  too. `main` was fast-forwarded to `origin/main` (`52c4db6`, 15 Renovate merges, CI green) before
  this commit.
- **Kiro:** the template's `.kiro/agents/project.json` stays out. Ryan: *"These projects never use
  Kiro - Kiro is only for court work"*. Template drift checks can skip `.kiro/` here.

`main` is protected, so this goes in on branch `compliance-2026-11-26`. No code change, no release.
