# Allemande Left

_Status: draft (2026-07-24). Third per-call spec; introduces the
[`arm-turn`](../blocks/arm-turn.md) block. Sources: CALLERLAB Basic Program
Definitions + timing chart (local, `reference/callerlab/`) and
`mix-a-hoot-n-hollar/docs/moves.md` (`al`)._

## Identity

| Field | Value |
|---|---|
| Canonical name | Allemande Left |
| Legacy app abbreviation | `al` |
| Program | Basic Part 1 |
| Role dependence | None mechanically (a left arm turn between any two dancers); *conventionally* danced with the *corner* |

## Formations

- **Starting:** dancer and corner (or any two dancers angled toward each other
  with left arms free). From a squared set or a Zero Box, the corner is at hand.
- **Ending:** released, stepping away along final facing — conventionally facing
  the partner, set up for the next action (Right and Left Grand, a courtesy turn
  home, a Weave).

## Timing

| Situation | Beats |
|---|---|
| ½ arm turn | 4–6 |
| ¾ arm turn | 6–8 |
| Full arm turn | 8 |

Timing data: Reprinted with permission of CALLERLAB (Basic/Mainstream timing
chart, rev. 2023-02-15; from point of contact — approach steps are extra).

## Dance action

Walk to the corner, join left forearms, turn once around (counterclockwise) —
or the fraction the setup calls for — release, and step away toward the partner.

## Block composition

| # | Block | Beats | Exit |
|---|---|---|---|
| 1 | [`arm-turn`](../blocks/arm-turn.md)`(left, full, step-out)` | 8 | released, departing along final facing (toward partner) |

The `fraction` is formation-dependent in practice (turn *until facing the
departure direction*): nominally `full` from a squared set, and the engine
resolves the fraction from entry/exit bearings — the chart's fraction rows are
the beat table. Approach to the corner is entry travel per the chart convention.
Mirror = Allemande Right (exists as a call at higher usage; free via transform).

## Choreography paths

The composition is the path — the `arm-turn(left, full, step-out)` fragment in
[`arm-turn.md`](../blocks/arm-turn.md), embedded at the dancer–corner pair frame
(for a squared set, the pair frame sits on the diagonal between the two).
Provisional until rendered.

## Momentum results

| Aspect | Value |
|---|---|
| Roll direction | **CCW/left** — the first starter call with a roll |
| Sweep direction | None (released, not circling as a couple) |
| Body-flow vector | Toward the partner — flows straight into a right-hand action |
| Last hand used | Left (released) — **right hand fresh: Allemande Left → Right and Left Grand is the F2 textbook pairing** |

## Rules & variants

- **Shoulder/handedness:** left forearm by definition; Allemande Right is the
  mirror.
- **Ocean Wave / Facing Couples rules:** not applicable.
- Grip styling: forearm hold, firm pivot pressure (the Guidelines' counter-dancing
  note — also why anchored rotation gets F4's lighter weighting).

## Modules & get-outs (test vectors)

- **The Zero Box get-out begins here** (ADR-0004): Zero Box ⇒ corner is the
  facing dancer ⇒ `Allemande Left` legal; resolution detector must flag
  "allemande-left-ready" on every Zero Box.
- Sequence vector: `Heads Square Thru 4, Allemande Left, Right and Left Grand,
  Promenade home` — the full triple's spine; ends at true home.
- F2 vector: Allemande Left then a *left*-hand call scores a hand-availability
  defect; then R&L Grand scores clean.

## Game notes (tentative)

The arc's canonical second gesture: an NPC teaches the arm turn as a greeting
long before it's ever called "Allemande Left" — same block, `hand` and
`fraction` introduced as play. The corner-relationship concept (who your corner
*is*) can ride in with it.
