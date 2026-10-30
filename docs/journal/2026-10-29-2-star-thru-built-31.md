# 2026-10-29 (2): Star Thru, built — 31

🧪 Uncommitted, for Ryan's look. Exploratory, no ADR yet (the planning effort's no-ADRs-while-
exploring stance; the spec carries the derivation).

Ryan: build Star Thru the way a user-built move will be (blocks and a hold first, then a starting
shape, then his keyframes), and stop at his keyframes. This is the engine half.

## The two spec questions, answered

- **Where the joined hand sits.** Answered from the CALLERLAB references (Ryan asked me to look):
  mid-call the arch is "offset to the man's right and woman's left" (Basic definitions #24,
  styling), but the couple **finishes on the pair's own spots**. Star Thru is standard from Facing
  Lines and Eight Chain Thru, where pairs stand one spot apart, so a couple displaced toward the hand
  would land on the next one. They swap spots; the derivation's ending stands. It follows that they
  pass right shoulders, his right arm reaching over her to her left hand on her far side.
- **What carries the clearance.** Ryan: vertical, she goes under. That's the **arm's**. The
  the-lot's first solve on straight paths showed the **bodies** still need room: their centres came
  within 20 cm and the beau was shoved 77 cm aside. So each dancer bows to their own left by half
  the pair's clearance, peaking where they're level (`bowAt` = `0.5 / forward`, 0.75 at the
  engine's width) and back on the line at both ends. The spec's option 2, for the bodies only.

## What was built

- `step-pivot` gained `forward` (walk along the entry facing), `beats` (the chart's timing, when
  the walk is the larger part) and `bow`/`bowAt`. All default off: every existing fixture is
  byte-identical. A bowed step is marked 4× as often (every twelfth of a beat on a Star Thru).
- `src/star-thru.ts`: `starThru` (plain data, with CALLERLAB's standard starting formations as
  `standardFrom`), `starThruChains(shape)`, `applyStarThru(beau, shape)` → both motions and the
  `Couple` they become. Kept out of `CALLS`, as facing couples are: it starts as a pair and ends a
  couple. Either of the pair can be the man.
- Spec fixture: `step-pivot(left, 0, left, 0.25, 0.666667, 4)` in `step-pivot.md`.
- `test/star-thru.test.ts`: chart beats, the turns and the arch, swap spots into a couple facing
  the man's right, either assignment, level at 0.75, and a property over couple widths (finish
  that width apart, centre unchanged, right shoulders passing the clearance apart).

263 tests, lint, typecheck, build all pass.

## Not decided

- ADR-0020's trigger said Star Thru would bring an arch-height field. It didn't: the arch is a hold
  the engine doesn't shape, and the path reads only `width` and `clearance`. The field still waits
  for a call that reads it.
- Formations: `standardFrom` names them; placing a Star Thru in Facing Lines or a Static Square is
  the sequence layer's job, not built.

⏳ **Next:** Ryan looks (and the-lot's half: his keyframes in `#review2`) → commit, release, pin.
