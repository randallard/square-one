# Project instructions

Scaffolded from `cr-ci-cd-rust-typescript-template`.

**Read `.claude/skills/project-conventions/SKILL.md` before writing an ADR, a journal entry, or
any code in the core.** It carries the house rules: functional core / imperative shell, the
provability tier, ADR immutability, the supply-chain posture.

Quick reference for the things most often got wrong:

- **One decision per ADR.** If you're writing a numbered list of decisions, split the file.
- **Never edit an accepted ADR's body.** Changing your mind means a *new* ADR that supersedes
  it. No "amended" blocks.
- **The journal is append-only.** Correct in a later entry, don't rewrite an old one.
- **No IO in the core.** That's what makes the property tests and proofs possible.
- **In Rust, `#![forbid(unsafe_code)]`** at every crate root. Introducing unsafe requires its
  own ADR.
- **Run the app before calling something done.** Tests passing is not evidence a feature works.
- **Update the docs when you finish a chunk of work** — README, PROGRESS, journal, ADRs — so
  the effort can be resumed from the docs alone after a cleared context.

Check the mechanical docs rules locally with `python3 scripts/docs-hygiene.py`.
