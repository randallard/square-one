# 2026-10-28 (4): the Allemande walks its circle — 29

🧪 Exploratory, uncommitted, for Ryan's look. townage's whole-move solve couldn't hold the Allemande
Left's forearm grip for any pairing; two of the reasons were here.

## What townage measured

Placing the floor's own grip pose on the engine's paths, the elbow each dancer's upper arm had to
reach was 1.16–3.06× the arm away. Split by phase:

- **During the turn, the pair breathed.** `arm-turn` emitted a mark every quarter turn and
  `sampleMotion` runs a straight line between marks, so mid-quarter the dancers were on the chord:
  `cos 45° = 0.707` of the grip radius. Measured on ryan ×2: separation 0.905–1.280, ratio 0.707
  exactly. The-lot's `arm-pose.ts` had called this design ("the bodies breathe … the undrawn upper
  arm takes up the difference"), but it is ADR-0022's defect, found in `orbit` in August, in the one
  rotating block that didn't get the fix.
- **The step out began with the grip still held.** The radius opened from the last quarter mark
  (beat 7) while the forearms held to 7.5: up to 4.2× an upper arm in the step-out.

## What changed

- `blocks/arm-turn.ts`: the spec's rows (contact, each quarter, the end) are anchors; between
  them a mark every 1/48 turn, angle, radius and facing linear in the beat. Integer beats stay on
  marks, so the spec fixtures read the same. `step-out` gets one more anchor at the release, on the
  circle, at the same angular pace, so the radius only opens once the grip is let go.
- `test/shape.test.ts`: the old `gripRadii` helper took the largest radius over *all* interior
  marks, which now include the step-out's; it reads the turn proper (beat 1 through `beats − 1`).
  A new test samples the walked path continuously through the grip: within 0.5% of the radius
  (7.5° marks still sag `1 − cos 3.75°`, 0.2%; the chords sagged 29%) and never outside it, and the
  grip lets go at `beats − 0.5`.

254 tests; typecheck, lint and docs hygiene clean.

## Left

- One radius per pair stays (ADR-0020). Mismatched arms aren't a reason to change it: the solver
  only needs the two elbows a forearm apart, which a shared radius allows. townage now sizes the
  radius from its skeletons (`armTurnGrip`).

⏳ **Next:** Ryan looks → commit, release **0.10.0**, townage's pin moves.

## Released

Ryan: *"commit it, release and pin"*. Released as **0.10.0**; townage's pin moves to it.
