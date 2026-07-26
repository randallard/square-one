# ADR-0010: When the audit gate and the age gate conflict, wait rather than except
- Status: Superseded by [ADR-0011](0011-configure-the-age-gate-where-pnpm-reads-it.md)
- Date: 2026-07-25
- Deciders: Ryan, Claude

## Context

Adding the first dependencies to this repo turned the supply-chain policy in
`.claude/skills/project-conventions/SKILL.md` into concrete `.npmrc` settings —
square-one is the first TypeScript project instantiated from the template, so
there was nothing to inherit. Two of those rules then pointed in opposite
directions on the very first install:

- CI runs `pnpm audit --audit-level=high`. `brace-expansion` carries
  GHSA-mh99-v99m-4gvg (DoS via unbounded expansion), and the **only** patched
  release is `5.0.8`.
- `.npmrc` sets `minimum-release-age=10080` (7 days). `5.0.8` was published two days
  before this decision, so the age gate refuses it.

The rules are not actually in tension about *values* — they are both trying to keep
untrustworthy code out. They disagree about which risk is larger in this specific
window: a known, published DoS, or an unvetted two-day-old publish of a package
that sits under most of the JavaScript tooling ecosystem.

The specifics matter and they cut clearly. The advisory reaches this repo only
through devDependencies (`typescript-eslint → minimatch` and
`license-checker-rseidelsohn → glob → minimatch`). square-one publishes `dist/`
only, so `brace-expansion` never reaches a consumer of this library. The realistic
attack is someone feeding a malicious glob pattern into our own lint run. Meanwhile
the age gate exists precisely because a freshly published version of a deep,
widely-depended-on package is the classic supply-chain attack shape, and two days
is the middle of the window where such a compromise is usually still undetected.

So the question is not "which rule wins" in general. It is what to do when the fix
for a low-consequence vulnerability is itself the high-consequence risk the other
rule guards against.

## Decision

Wait. Let `5.0.8` age out of the 7-day window (≈ 2026-07-30) and pick it up in the
ordinary course, rather than overriding the version or excepting the advisory.

Neither gate is weakened and neither is bypassed. CI's audit job stays red until the
patched version becomes installable — that redness is accurate, and accepting a red
gate we understand is preferable to configuring it green.

## Alternatives considered

- **Override to 5.0.8 via `pnpm.overrides`** — rejected: it installs a two-day-old
  publish of a deep transitive dependency, which is exactly what the age gate is
  for, in order to fix a vulnerability that provably cannot reach our consumers.
  That trades a strong guarantee for a weak one.
- **Allow the advisory in the audit job until the patch ages in** — rejected as
  more machinery than the problem deserves: a time-boxed exception has to be
  remembered and removed, and "an exception that expires" is the kind of thing that
  quietly becomes permanent. Nothing ships in the interval, so the exception buys
  only a green badge.

## Consequences

- **CI's `ts-supply-chain` job fails until ≈2026-07-30.** Anyone pushing before then
  should expect it and not treat it as a new regression. This is the cost, and it is
  paid in signal rather than in safety.
- Nothing is blocked in practice: M2 is a version tag and a townage install, neither
  of which needs a green audit.
- It sets the precedent for the next collision — **the age gate does not yield to
  the audit gate by default**. What earns an exception is a vulnerability with a
  real path to shipped code, not merely a high severity score.
- The reasoning generalises past this advisory: the question to ask is always
  whether the vulnerable code can reach a consumer, not how bad the CVE looks.
- **Promotion condition:** if an advisory ever lands on a *runtime* dependency —
  something that reaches `dist/` and therefore townage and hash-n-patter — this
  decision does not apply and the trade must be made again, urgently and in the
  other direction. Equally, if waiting ever blocks real work rather than a badge,
  revisit via a new ADR rather than quietly overriding.
