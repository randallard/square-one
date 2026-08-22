# ADR-0023: A pass walks just far enough to clear
- Status: Accepted
- Date: 2026-08-21
- Deciders: Ryan, Claude

## Context

Ryan, watching a Dosado once the pair calls were sized to bodies:

> dosado pass by too far though — should watch body / head size and pass by just enough to clear
> and slide to the right far enough to step back

[ADR-0020](0020-every-call-is-sized-to-the-bodies-that-dance-it.md) made the **lane** a body
measurement and said, in as many words, that the travel was not one:

> **Let `shape.width` supply an `arm-turn`'s standoff.** … A facing pair's separation is a
> *frame* fact rather than a body one, so it is deliberately not a field.

That reasoning is right about the *separation* and it silently carried a second thing with it: the
`lane` and `close` exits walked a flat **0.80**, a number with no derivation anywhere. Measured on
townage's cast at the back-to-back beat of a Dosado, the two dancers were **1.562 world units**
past each other — against the **0.710** their heads and torsos take to clear. More than twice as
far as anybody needed, in a call whose lane had just been fitted to the millimetre.

The right distance is not a matter of taste, and the reason is the beat that follows. During the
`slide`, the two dancers **swap lanes** — each crosses the other's `x` — so nothing lateral is
holding them apart and the entire separation is the gap they walked out. It has to be at least the
clearance. It need not be any more.

## Decision

**`pass` derives its travel instead of stating it.**

| exit | walks | why |
|---|---|---|
| `centered` | the whole `separation` | a Pass Thru finishes on the counterpart's former spot — that is what the call *is*, and no body changes it |
| `lane`, `close` | `(separation + clearance) / 2` | far enough that the two finish exactly `clearance` past each other, which is where a Dosado is back to back |

The waypoint schedules are written as **fractions of the travel** rather than as distances, so
each exit's shape is stated once and sizing it is one multiplication.

`PAIR_SEPARATION` is named and exported. It stays **1** and stays a fact about the floor — ADR-0020
is not reversed on that point. What changes is that the travel now reads it rather than having it
baked into a literal, which is what made the flat 0.80 unauditable.

## Alternatives considered

- **Keep 0.80 and let the frame scale absorb it.** The status quo, and it is what produced the
  complaint: the scale is fitted to the *lane*, so a lane that is right leaves a walk that is
  wrong by whatever the two constants happen to disagree by.
- **Make the travel a `FigureShape` field.** It is not a body measurement — it is a *consequence*
  of one, and of the separation. A field would let a consumer set it inconsistently with the
  clearance they also passed, and the two would then disagree about where "past" is.
- **Walk to back-to-back exactly — `separation / 2`, no clearance term.** Geometrically the
  dancers' centres would be level, which is a collision at any body size. The clearance term is
  what makes it a pass rather than a meeting.
- **Give `close` its own, shorter travel.** Tempting because backing is slower than walking, and
  wrong: the return has to cover the outbound or the call stops being a zero. The pace difference
  is already in the beat schedule (backing takes 3 beats for the same ground), which is where it
  belongs.

## Consequences

- **A Dosado walks 2.083 → 1.692 world units and passes 1.562 → 0.781 past**, against 0.710
  wanted. It is still a zero to the last decimal, and still 6 beats.
- 🔴 **Spec fixtures moved, which is the first time in this repo.** `blocks/pass.md`'s `lane` and
  `close` tables and `calls/dosado.md`'s full-call table are rewritten, and the ADR-0009 suite is
  what forced them to be — the docs are the fixtures, so a figure that changes changes them. The
  old numbers are named in both files with the measurement that retired them, not deleted.
- **Pass Thru is untouched**, fixture and all: its travel is the separation, which no body moves.
- 🔴 **This is the second decision in two days to find a constant nobody could derive.** ADR-0022
  found the arc sampled at a spacing chosen before anything measured against it; this found a walk
  of 0.80. Both were invisible because they were *plausible* and the things around them were
  fitted. **A number in this catalog should say where it comes from, or be a parameter.**
- **Promotion condition:** `arm-turn`'s `ENTRY_RADIUS` 0.5 and `STEP_OUT_RADIUS` 0.42 are the two
  remaining literals of this kind. The step-out is already expressed as a fraction (ADR-0020); the
  standoff is the pair frame's half unit and is derived. If a third undeivable constant turns up,
  the rule above should become a review item rather than an ADR.
