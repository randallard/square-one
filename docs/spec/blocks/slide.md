# Block: `slide`

_Status: draft (2026-07-24). First used by [Dosado](../calls/dosado.md)._

Sidestep laterally without turning — the lane-change atom (Dosado's crossing
steps; later: Dodge-family calls, adjustments).

## Parameters

| Parameter | Values | Effect |
|---|---|---|
| `side` | `right` / `left` | Sidestep toward the dancer's own right or left |
| `distance` | a distance, default `0.30` | How far to step — **a body measurement** (ADR-0020). A Dosado's slide is a full lane change, so it is exactly the room that Dosado's pass needed. Below `SLIDE_DISTANCE` (`2 × 0.15`) it is ignored (ADR-0021). See the note below: this is the third time this parameter has existed, and the first time it has had a floor |

## Entry contract

Clear lateral space on the named side (no dancer occupying the destination lane
at the crossing moment — a timing/collision check, not a formation requirement).

## Waypoint fragment (local frame: dancer at origin facing `+y`)

`slide(right)` — 1 beat:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | 0.00 | entry |
| 1 | +0.30 | 0.00 | lane changed (2 × 0.15 lane offset) |

- `side: left` mirrors x.
- A briefly-considered `span: half` variant (2026-07-26, for Dosado's closing
  step) was removed the same day: CALLERLAB's dance action blends the closing
  lateral into the backing ("walking a smooth circular path … slide slightly"),
  which is [`pass`](pass.md)'s `close` exit, not a discrete sidestep. If the
  Dodge family later needs partial slides, design the parameter then.
- 🔴 **It came back anyway, as `distance`, and was removed again on 2026-08-16.**
  Partner Trade added it on 2026-08-15 to sidestep a half lane onto its passing
  lane — the same idea as `span: half`, under a different name, in a call whose
  source says *walk forward* just as plainly as Dosado's does. The precedent was
  in this file and nobody read it. Removed by
  [ADR-0013](../../adr/0013-the-trade-lane-rides-inside-the-arc.md), which puts
  the Trade's lane inside its arc instead.

  The extra lesson, and the reason "design the parameter then" is not enough on
  its own: `distance` arrived without touching **`BEATS`**, which is flat. A
  half-lane slide therefore took the same beat as a full lane change and moved at
  a sixth the speed. **Design a distance parameter and its timing together, or
  not at all.**
- 🔴 **And it is back, under the same name, on 2026-08-21 —
  [ADR-0020](../../adr/0020-every-call-is-sized-to-the-bodies-that-dance-it.md).**
  Written here rather than quietly, because a parameter removed twice and
  restored a third time is exactly the kind of thing a spec should make somebody
  argue for.

  The standing instruction — *design the parameter and its timing together* — is
  answered by a floor rather than by a timing change. `distance` cannot ask for
  **less** than `SLIDE_DISTANCE`
  ([ADR-0021](../../adr/0021-a-body-widens-a-figure-and-never-narrows-it.md)), so
  the failure both previous versions had is unreachable: what killed them was a
  *shorter* step charged a full beat, which is a crawl. A **longer** step in the
  same beat is a longer stride, which is what a bigger dancer covering more
  ground actually looks like, and it is the identical trade
  [`step-pivot`](step-pivot.md) makes — a wider couple's belle covers more ground
  in the same four beats and nobody calls that a defect.

  The 1-beat `BEATS` is therefore still flat, still untouched, and now correct in
  the only direction the parameter can move.
- Facing constant — **momentum delta: rotation 0**; exit flow vector is lateral
  (which arms the F6 lateral-motion rule: the next block must not move this
  dancer against that lateral direction).
- Hands: none.

## Exit pose

`distance` units to the named side — `0.30` in the fragment above and in every fixture — same
depth, facing unchanged.

## Flow notes

The lateral exit vector is exactly the condition F6 watches
([flow-and-variety.md](../flow-and-variety.md)): a composition following
`slide(right)` with leftward motion is a flow defect the checker can catch
statically — first concrete example of block-level flow analysis.
