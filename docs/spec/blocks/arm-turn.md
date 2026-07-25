# Block: `arm-turn`

_Status: draft (2026-07-24). First used by [Allemande Left](../calls/allemande-left.md).
The first block with rotation, and the first with hands engaged — roll, F3/F4
accounting, and F2 hand tracking all activate here. Also townage's second taught
gesture: the NPC-taught arm turn **is** this block._

Two dancers join forearms and walk forward around their common pivot.

## Parameters

| Parameter | Values | Effect |
|---|---|---|
| `hand` | `right` / `left` | Which forearms join. **Left = counterclockwise** pair rotation (the pivot is on your left as you walk forward); right = clockwise |
| `fraction` | quarter multiples (½, ¾, 1, 1½ …) | How far around; sets beats and total facing rotation |
| `exit` | `step-out` / `hold` | `step-out`: release and blend a departure step along the final facing into the last beat (the call is over — Allemande Left). `hold`: stay at orbit radius, grip kept (composite calls that chain turns, e.g. Do Paso — future) |

## Entry contract

A counterpart dancer facing this one (or angled toward, e.g. corner from a
squared set) within reach, the named forearm free (F2: that hand must be
available). Approach steps to the point of contact are entry travel, counted
outside the block per the timing chart's convention.

## Timing (per the chart's arm-turn row)

| Fraction | Beats |
|---|---|
| ½ | 4 |
| ¾ | 6 |
| full | 8 |

## Waypoint fragment (local pair frame: dancer at `(0, −0.5)` facing `+y`, grip at origin)

`arm-turn(left, full, step-out)` — 8 beats; orbit radius 0.3:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | 0.00 | −0.50 | +y | entry |
| 1 | 0.00 | −0.30 | +y | step in, left forearms join |
| 3 | +0.30 | 0.00 | +x→rotating | quarter around (CCW orbit — dancer sweeps to the east side moving north… pivot on the left) |
| 5 | 0.00 | +0.30 | −y | halfway — on the counterpart's side |
| 7 | −0.30 | 0.00 | −x | three quarters |
| 8 | 0.00 | −0.42 | +y | full around; released, departure step blended out along final facing |

- Facing stays tangential to the orbit — total facing rotation = `fraction` ×
  360°, **CCW for left, CW for right** (signed rotation is the momentum delta).
- Mirror transform gives the other hand; fractions truncate the orbit and exit
  from that point.
- Counterpart is the 180° rotation, as always.

## Exit pose

`step-out`: off the orbit ~0.1 beyond entry radius, facing per fraction, grip
released. `hold`: on the orbit at radius 0.3, grip engaged.

## Momentum results

| Aspect | Value |
|---|---|
| Rotation delta | `fraction` × ±360° (left: +/CCW, right: −/CW) — the catalog's first real **F4 accumulator** |
| Roll direction | The turn direction (left arm turn → roll CCW/left) |
| Last hand used | The named forearm, released at `step-out` — so the *other* hand is the fresh one (left arm turn → right hand fresh: the classic Allemande Left → Right and Left Grand pairing is F2-perfect) |
| Body-flow vector | Along final facing (step-out) |

## Flow-modeling note (open nuance for F4)

A single full arm turn is 360° of same-direction rotation — over the Guidelines'
270° threshold — yet standard and comfortable. The Guidelines' own kinesiology
section explains why: grip-anchored turns give dancers a physical reference
("counter dancing" — firm pressure at the pivot), so anchored rotation
disorients far less than free-body rotation. **F4 should therefore weight
anchored rotation lighter than unanchored, and count accumulation across
transitions rather than within a single anchored turn.** Flagged for the
flow-checker design; recorded here because this block is what forces the issue.
