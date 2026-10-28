# `pull-by`

Take hands with the dancer you are facing and walk past them, letting go on the way.

_Status: draft (2026-10-28), with [Right and Left Thru](../calls/right-and-left-thru.md), its
first consumer. Right and Left Grand and Square Thru are the same action repeated._

## Source

CALLERLAB Basic, glossary **Pull By**: *"From Facing Dancers, dancers take right hands as if they
were going to shake hands, exert a momentary, gentle pull to initiate forward motion, and perform
a Pass Thru action. As the dancers pass each other, the handhold is released and the dancers
continue the next dance action or adjust to end back-to-back."* And from the styling terms:
*"Hands should be dropped before bodies cross a common plane."*

## Parameters

| Parameter | Values | Meaning |
|---|---|---|
| `hand` | `right` / `left` | The hand taken, and so the shoulders passed: a Right Pull By passes right |
| `distance` | positive, default `1` | How far the dancer walks: to the spot the other one left |
| `clearance` | default `0.3`, floored there | The room the two need to pass, split between them, as [`pass`](pass.md)'s |
| `drift` | any number, default `0` | More sideways travel at the crossing, positive to the dancer's **right**: room asked for by the dancer's neighbours, not by the one being passed |

## Why it is a block and not `pass` with a hold

A [`Hold`](orbit.md) is joined for a whole block, and the catalog has had no figure that took
hands part way through one. A pull-by is that figure: the hand is let go **inside** the walk,
before the two are level. So the block owns its grip span: `palm`, held with the **opposite**,
from beat 0 to `PULL_BY_RELEASE` (0.75), a quarter beat before the two draw level.

townage reached the same release from the other side, solving the arms of four bodies (its
journal 2026-10-28-2): held to the crossing or past it, the joined hands trail behind both dancers
and drag them back.

## The lane

`sin²` of the walk, as [`orbit`](orbit.md)'s lane: zero and flat at both ends, so the dancer
leaves and arrives facing straight ahead, and widest at the crossing. Sampled every
thirty-second of a beat (ADR-0022): at a quarter beat the polyline cut 5 mm inside a 0.3 lane.

`pull-by(right)` — 2 beats; the default distance and clearance:

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0 | 0 | take right hands with the dancer ahead |
| 0.5 | -0.075 | 0.25 | stepping to the left |
| 1 | -0.15 | 0.5 | level with them, half the lane to the left; hands already dropped |
| 1.5 | -0.075 | 0.75 | back toward the line |
| 2 | 0 | 1 | on the spot they left, facing on |

## Flow

| Field | Value |
|---|---|
| Hands | `hand`, `palm`, with the opposite, beats 0–0.75 |
| Last hand used | `hand` |
| Rotation | 0: no Roll, as Pass Thru |
| Body flow | Straight ahead |
