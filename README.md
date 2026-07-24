# cr-ci-cd-rust-typescript-template

An opinionated starting point for **provable** projects — Rust, TypeScript, or both — with the
documentation discipline, supply-chain posture, and continuous-review habit already wired in.

> **Use this template** on GitHub, or:
> ```bash
> gh repo create my-project --template randallard/cr-ci-cd-rust-typescript-template
> ```
> The template's name has no bearing on your project's name.

Then open the fresh clone in Claude Code and say what you're building. The `new-project` skill
in `.claude/` runs the interview, deliberates the architecture with you, and records the
decisions as ADRs. **The template is self-contained** — it doesn't depend on any personal
Claude config, so a brand-new machine with nothing but a clone works.

## What's opinionated here

**Provable at the strongest tier the language supports.** Rust gets `#![forbid(unsafe_code)]`,
`proptest`, and `kani` bounded proofs in their own CI job. TypeScript gets `strict` +
`noUncheckedIndexedAccess` and `fast-check` property tests on a pure core. TS's type system is
unsound and that's an accepted trade for ecosystem and speed — so the rigor is *engineered in*
rather than inherited.

**Functional core / imperative shell**, always. It's what makes the property tests and proofs
possible; without it there's nothing clean to test.

**Browser storage with export/import as the default persistence.** No database until you can
name why you need one. No schema migrations to get wrong, no server to secure, no distributed
state, and the user's data is genuinely theirs. The database question is a per-project
deliberation, not a default.

**Decisions get recorded, one per file, and never rewritten.** ADRs are immutable in substance;
changing your mind means a new ADR that supersedes the old one. The record of what you believed
and when is the valuable part.

**Your stance gets reviewed on a schedule.** Monthly, an issue opens asking whether the
standing decisions are still true. It never blocks a build.

## Why the review exists

A decision can stop being true without anything breaking:

> An ADR recorded "no tool exists for this yet — revisit later." The package manager shipped
> four native controls for exactly that, **ten days after** the ADR was written. CI was green
> the whole time; there was nothing to fail. It surfaced months later only because someone
> asked a passing question.

Tooling moves in weeks. `docs/reviews/` is the habit that catches it on purpose rather than by
luck, and every finding becomes a *new* ADR — which is what makes a review process compatible
with immutable records instead of in tension with them.

## Layout

```
.claude/skills/
  project-conventions/   house rules — loads automatically
  new-project/           first-run bootstrap (delete after use)
  stance-review/         the monthly review
.github/
  CODEOWNERS             review gates for instruction + CI + supply-chain paths
  workflows/
    ci.yml               both language paths, self-skipping; all actions SHA-pinned
    docs-hygiene.yml     mechanical checks — this one gates
    stance-review.yml    monthly nag — never gates
docs/
  adr/                   decisions, one per file, immutable
  journal/               dated narrative worklog
  reviews/               stance review records
  PROGRESS.md            status + next steps
scripts/
  docs-hygiene.py        stdlib-only, runs anywhere
```

## CI

One `ci.yml` with both language paths. A `detect` job looks for `Cargo.toml` / `package.json`
and the language jobs skip themselves when their manifest isn't there — a TS-only or Rust-only
project needs no edits, and neither does one that later grows a second language.

Rust gets fmt / clippy / test / cargo-deny, with **Kani proofs in their own job** so a slow
proof never delays fast-gate feedback and the check name says which tier failed. TypeScript gets
lint / test / build plus audit, `audit signatures`, and the license allowlist. Pages deploy is
opt-in per project: set the `DEPLOY_PAGES` repository variable to `true`.

**Every action is pinned to a full commit SHA**, with the version in a trailing comment. Tags
are mutable — the tj-actions/changed-files compromise (CVE-2025-30066) worked by repointing
existing version tags — and GitHub's guidance calls a SHA the only immutable reference. Note
`dtolnay/rust-toolchain@stable` is a *branch*, which moves by design; the pin matters most
exactly where it feels least necessary. Renovate can maintain SHA pins and keep the comments in
sync.

## The two review tiers

| | Mechanical | Judgment |
|---|---|---|
| **Where** | `docs-hygiene.yml`, every push | `stance-review.yml`, monthly |
| **Checks** | index accuracy, valid statuses, resolvable supersession links, broken links, journal filenames, ADR bloat tripwire | is this decision still *correct*? |
| **Gates?** | yes — only fires on objectively wrong, cheap-to-fix things | never |

A review that blocks CI gets disabled the first busy week, and then you have neither the gate
nor the habit. So the judgment tier nags and records, and that's all.

Run the mechanical tier locally any time: `python3 scripts/docs-hygiene.py` (no dependencies,
no virtualenv — it has to work in a Rust-only project too).

## Licence

Dual **MIT OR Apache-2.0** — a superset of MIT's permissiveness with a patent grant, matching
Rust ecosystem convention. Fill in `LICENSE-MIT`'s copyright line; both files ship as-is.
