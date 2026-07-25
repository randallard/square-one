# Pass Thru

_Status: draft (2026-07-24). Second per-call spec — first pure-reuse composition
(zero new blocks). Sources: CALLERLAB Basic Program Definitions + timing chart
(local, `reference/callerlab/`) and `mix-a-hoot-n-hollar/docs/moves.md` (`pt`)._

## Identity

| Field | Value |
|---|---|
| Canonical name | Pass Thru |
| Legacy app abbreviation | `pt` |
| Program | Basic Part 1 |
| Role dependence | None — any two facing dancers |

## Formations

- **Starting:** facing dancers (danced pairwise).
- **Ending:** back-to-back dancers, each on the counterpart's former spot, facing
  unchanged. From facing couples: back-to-back couples.

## Timing

| Situation | Beats |
|---|---|
| Facing dancers | **2** |
| Squared set, heads (or sides) | 4 |

Timing data: Reprinted with permission of CALLERLAB (Basic/Mainstream timing
chart, rev. 2023-02-15).

## Dance action

Move forward, passing right shoulders with the facing dancer, ending back-to-back.
Facing never changes; no hands.

## Block composition

A single block from the [catalog](../blocks/README.md):

| # | Block | Beats | Exit |
|---|---|---|---|
| 1 | [`pass`](../blocks/pass.md)`(forward, right, centered)` | 2 | counterpart's former spot, back-to-back, centered |

Beats sum to the chart's 2 ✓. The `centered` exit is the ideal S-curve back onto
the center line (ADR-0006: simulated dancers cut that corner per their
coefficients — under call pressure the S flattens into exactly the rounded corner
real dancers dance). Mirror (left-shoulder) variant is the transform of the same
chain. No fractionalization (CALLERLAB lists no parts).

## Choreography paths

The composition *is* the path — see the `centered` fragment table in
[`pass.md`](../blocks/pass.md), embedded in the standard pair frame
([dosado.md](dosado.md) conventions): dancer A `(0,−0.5)` → `(−0.15, 0)` at the
pass → `(0,+0.5)`; B is the 180° rotation. Provisional until rendered.

## Momentum results

| Aspect | Value |
|---|---|
| Roll direction | **None** — CALLERLAB's Roll definition explicitly lists Pass Thru as cannot-roll |
| Sweep direction | None |
| Body-flow vector | Straight ahead — strong forward flow into the next call (classic follow-ups keep it: Wheel and Deal, Bend the Line…) |
| Last hand used | None |

## Rules & variants

- **Shoulder rule:** right shoulders (definition-inherent); left variant via
  mirror.
- **Ocean Wave rule:** applies — from a right-hand mini-wave, dancers blend the
  momentary wave and complete the action *(tentative — verify against the
  Additional Details PDF during types work)*.
- **Facing Couples rule:** not applicable (already facing-dancer-defined).

## Modules & equivalences (test vectors)

- Half of the equivalence `Square Thru Two = Star Thru, Pass Thru` (ADR-0004
  suite).
- `Dosado once and a half ≡ Pass Thru` — net-effect equivalence across two
  different block chains; the first cross-call equivalence the checker can verify.
- Not self-inverting: after Pass Thru there is no facing dancer, so it cannot be
  called twice from the same pair (a *legality* test vector, not an equivalence).

## Game notes (tentative)

Townage: the natural second "walking" gesture after Dosado — same blocks, new
outcome (you traded places instead of coming home) — a gentle first lesson that
compositions, not steps, define moves.
