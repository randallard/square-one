# square-one

The square-dance engine library: formations, calls, choreography, and resolution as
**pure data and pure functions** — no UI, no IO. Home is where you started; square-one
is what knows where that is.

Scaffolded from `cr-ci-cd-rust-typescript-template`.

## What it is

square-one is the shared seam of a family of square-dance games planned in
`~/Development/work/square-dance-planning/`:

- **the-lot** ("townage") — the world/NPC game where square dancing is learned through
  NPC interactions; consumes square-one for every square that forms.
- **hash-n-patter** — the caller-skills drill games (sight calling, memory, figure
  recognition, patter); consumes square-one for legality, resolution, and scoring.

Applying a call yields the ending formation **and per-dancer choreography paths as
data** — waypoints in unit-square coordinates with beat timing, facing, and hands.
Consumers scale to screen and tween; nobody else writes choreography (planning
ADR-0004). Beyond paths, the engine tracks the full caller-theory state model — FASR
(Formation, Arrangement, Sequence, Relationship), roll/sweep momentum, body flow, hand
availability, home/resolution — so sequences of calls can be *evaluated*, not just
animated. The complete model: [`docs/spec/call-model.md`](docs/spec/call-model.md).

## Status

Pre-code: the repo is bootstrapped, the state model is drafted and under review. See
[`docs/PROGRESS.md`](docs/PROGRESS.md).

## Development

TypeScript, `strict` + `noUncheckedIndexedAccess`, provable-lite: the entire library is
a functional core with `fast-check` property tests
([ADR-0001](docs/adr/0001-typescript-provable-lite.md)); no storage, no UI, no IO
([ADR-0002](docs/adr/0002-pure-library-no-storage-no-ui.md)). House rules live in
[`.claude/skills/project-conventions/`](.claude/skills/project-conventions/SKILL.md);
decisions in [`docs/adr/`](docs/adr/README.md).

Check docs mechanics locally: `python3 scripts/docs-hygiene.py`.

## Licence

Dual-licensed under [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at your option.
