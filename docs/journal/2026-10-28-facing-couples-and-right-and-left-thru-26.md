# 2026-10-28 — facing couples, and Right and Left Thru

🧪 Exploratory, no ADR. **Uncommitted, waits for Ryan's look** (the-lot's `#review2` draws it).

townage solved the arms of Right and Left Thru for four bodies on paths it wrote itself (its
journals 2026-10-27-8 to 2026-10-28-4). Ryan, picking the next step: *"go with 2"*: spec facing
couples and Right and Left Thru here, and swap townage's paths for the engine's. Planning
ADR-0011's **S2** starts here.

## What was built

- **`src/facing-couples.ts`**: the first formation of four. `FacingCouples` (two couples and the
  set's own clearance); `faceCouples` checks a set is one and throws otherwise;
  `setFacingCouples` stands one up; `roomToFace`; `relative` (partner, opposite);
  `applyCallToFacingCouples`; `reformFacingCouples`. A catalog of its own,
  `FACING_COUPLES_CALLS`, apart from the two-dancer `CALLS`, whose properties are about two
  dancers.
- **`rightAndLeftThru`**: *"Right Pull By; Courtesy Turn"*, **6 beats** from facing couples
  (the chart; townage's was the squared set's 8).
- **`pull-by`**, a new block: a Pass Thru's walk with right hands joined, let go at
  `PULL_BY_RELEASE` (0.75), a quarter beat before the two are level. The glossary says *"hands
  should be dropped before bodies cross a common plane"*. It owns its grip span because a `Hold`
  is joined for a whole block. Lane `sin²`, plus a `drift` the neighbours ask for.
- **`orbit` grew three things**: `direction: "backward"` (the beau backs round a Courtesy Turn),
  `hold` as a list (his left in her left and his right on her back), and `unit: true` (below).
- **Grips name whose hand.** `GripStyle` gains `palm` and `back`, and `GripSpan` gains `relation`
  (`partner` / `opposite`, from the block) and `with` (the key, from the formation). A pair or a
  couple never needed it.

## What running it found

Each of these was found by running something; none came from reading.

1. **A gap at the crossing isn't a clearance at the closest moment.** With a lane wide beside the
   walk, two dancers are nearest a little *before* they draw level (property test: 0.507 for
   0.518). It's `laneForClearance`'s finding for the Trade's bow, here again, and has the same
   fix: bisect each passing pair's gap for its closest moment (`gapAtCrossing`). The bracket
   first ran out on a clearance nearly as long as the walk, so it now doubles until it holds.
2. **The polyline sag, again (ADR-0022).** At a quarter beat the pull-by's chords cut 5 mm inside
   a 0.3 lane, and at a sixteenth they still lost 0.5% of a wide one. It now samples every
   thirty-second of a beat.
3. **Facing couples need room: a clearance and half of each couple's width** (`roomToFace`). Two
   couples turning back to back each swing a dancer along the line between them. The property
   test found 0.950 for 0.955, and townage's hand-written version had already stood its couples
   exactly this far apart (`W + lane`). `setFacingCouples` never stands them closer.
4. **The default set's belles would have passed 3 cm apart.** The pull-by floors its lane at a
   Pass Thru's 0.3 (ADR-0021), and the spread for the belles was first worked from the unfloored
   clearance.
5. **One clearance couldn't do both jobs.** townage passed its arm-aware passing lane as the
   couples' clearance, and the Courtesy Turn, which closes in to the couple's clearance, never
   closed: his right arm crossed her forearm. So the **set** has its own clearance (dancers of
   different couples passing) beside each **couple**'s (partners side by side).
6. **A couple turning as a unit stays square to the line between them.** `orbit` faces the path
   walked, which is right for a dancer walking. On a circle that bows in and out it turned the
   couple 4° in the half beat at the middle and 67° in the last beat, and townage's solve flipped
   the gent's arm over trying to keep a hand on her back. `unit: true` faces the circle's tangent.

## Checks

`test/facing-couples.test.ts` covers:
- the formation, the refusals, partner and opposite;
- 6 beats; the chain meets;
- it ends in facing couples on each other's line at their own widths;
- everyone turns 180° left, with the beau backing;
- the grips and who they're with;
- **a property over any widths, clearances and spacing**: every passing pair keeps the set's
  clearance at its closest moment, each couple closes to its own mid-turn, and ends at its width.

`blocks/pull-by.md`'s table is a live fixture (ADR-0009). There are 249 tests (231 before), and
`tsc`, lint, build and docs-hygiene are clean.

Watched in townage at `#review2=right-and-left-thru/ryan-ryan`. At beat 0 both couples are in a
handhold. At 0.6 the right hands reach across. Through 2.4–4.2 each couple turns close, side by
side, square to each other, the lady a little ahead. At 6 both couples are in the handhold on
the other's line. All 25 of townage's sets solve clean on these paths (its journal 2026-10-28-5).

## For review

- **The Courtesy Turn closes in.** CALLERLAB doesn't say so. It's townage's solve: at a standing
  width the hand on her back cannot reach.
- **The lady is level with him**, not ahead. townage puts her ahead itself, as a body-sized
  offset; whether the figure should is open.
- **6 beats, not 8.** The chart says so for facing couples, and townage's figure is now 6.

## Not yet

Recognition (finding facing couples among poses); sequences of four, with the end-of-dance
release; the Ocean Wave Rule, Full Turn, and "and a Quarter More"; the squared set's 8 beats.
