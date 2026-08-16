# `orbit`

Walk forward around a shared centre, hands free.

The catalog's second rotating block and the first that rotates without engaging a hand.
Introduced for the Trade family (planning ADR-0011's S1); the Circle and Promenade families
are the same figure at other radii.

## Parameters

| Parameter | Values | Meaning |
|---|---|---|
| `turn` | `left` / `right` | Which way round. **`left` is CCW**, matching [`arm-turn`](arm-turn.md) |
| `fraction` | quarter multiples — `0.25`, `0.5`, `0.75`, `1`, … | How much of the circle |
| `radius` | any positive number | Distance from the shared centre, constant for the whole arc |

## Frame

Pivot-centred, like `arm-turn`: the shared centre is the origin and the dancer enters standing
off it at `radius`, due south (position angle 270°).

**Entry facing is tangential**, unlike `arm-turn`. There is no step-in to turn out of — a
dancer walking a circle faces the way they are going from the first beat.

## Why this is not `arm-turn` with the grip switched off

The obvious reading of a Trade is "an arm turn without the arms", and it is wrong **by a
radius**. `arm-turn` steps in from `ENTRY_RADIUS` 0.5 to `ORBIT_RADIUS` 0.3, because that is
what joining forearms costs. A Trade's dancers never close that gap — they walk the circle they
are already standing on.

So the relationship runs the other way: **`orbit` is the primitive, and an arm turn is `orbit`
plus a grip plus the step-in.** Ryan chose that shape ("go with cleaner") over adding a `grip`
parameter to `arm-turn`.

🔴 **And "plus the step-in" understates it — the step-in is *absorbed*, not added.** Both
blocks are 8 beats for a full turn. `arm-turn` spends its first beat stepping in and then fits
a whole revolution into the remaining seven, compressing the closing quarter into one beat
against `orbit`'s two. The two arcs agree at the quarter marks up to 0.75 and part company
after it. Found by writing the equivalence test rather than by reading either block, and left
as a live assertion because a refactor would have to decide what becomes of that compressed
quarter.

🔴 **`arm-turn` is deliberately not refactored onto this block.** It is render-validated
(2026-07-27, the Allemande's CCW turn), and this family does not disturb validated geometry for
a tidier decomposition. A test asserts instead that `orbit` reproduces `arm-turn`'s orbital arc
at the same radius, so the claim is checked and a future refactor would start from evidence.

## Timing

A full circle is **8 beats**, the same rate `arm-turn` uses. The Trade family's 4 beats for a
half turn is exactly this.

## Flow

| Field | Value |
|---|---|
| Hands | **None**, for the whole arc — a positive fact for F2, not an omission. A Trade leaves both hands available, which is what makes it flow into anything |
| Last hand used | `none` |
| Rotation (F4) | `fraction × ±360°`, signed by `turn` — left positive |
| Body-flow vector | Along the final facing, which is tangential |
| Roll | Available — the arc gives a definite rotation direction |

## Worked examples

**The `Facing` column is not optional here.** The loader only checks facing when the table
carries the column, and treats its absence as "constant for this block and stated in prose"
(`SpecRow.facing`). An orbit's facing *rotates* — it is the whole point — so omitting the
column would leave the facing claims as unchecked prose. It was omitted in the first draft of
this file and one of the three claims was wrong.

`orbit(right, 0.5, 0.5)` — 4 beats; the half turn a Partner Trade dancer walks:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | 0 | −0.5 | −x | standing off the centre, already tangential — no step-in to turn out of |
| 2 | −0.5 | 0 | +y | a quarter round CW |
| 4 | 0 | 0.5 | +x | opposite the start, a half turn of facing with it |

The second is a quarter at an arm turn's own orbit radius — the comparison the `arm-turn`
equivalence test is built on.

`orbit(left, 0.25, 0.3)` — 2 beats:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | 0 | −0.3 | +x | tangential to a CCW arc |
| 2 | 0.3 | 0 | +y | a quarter round CCW |
