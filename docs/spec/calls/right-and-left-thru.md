# Right and Left Thru

_Status: 🧪 draft (2026-10-28), exploratory, no ADR. The first call for four. Code:
`rightAndLeftThru` in `src/facing-couples.ts`. Sources: CALLERLAB Basic Program Definitions §22,
§15 (Courtesy Turn) and the Pull By glossary entry; the 2023 timing chart (local,
`reference/callerlab/`)._

## Identity

| Field | Value |
|---|---|
| Canonical name | Right and Left Thru |
| Program | Basic Part 1, §22 |
| Starting formation | [Facing couples](../formations/facing-couples.md) |
| Ending formation | Facing couples, each couple on the other's line |
| Dance action | *"Right Pull By; Courtesy Turn"* |
| Position dependence | Beau and belle dance different halves of the Courtesy Turn |

CALLERLAB restricts the Courtesy Turn to *"a man turning a woman"* at Basic and Mainstream. The
engine keys it off **position**, beau backing and belle walking forward (ADR-0012), as every call
here does; which arrangement a caller may call it from is a legality question, not a path one.

## Timing

| Situation | Beats |
|---|---|
| **Facing couples** | **6** |
| Squared set, heads or sides | 8 |

Pull By 2, as the Pass Thru it is; Courtesy Turn 4, as the chart's own row for it. Timing data:
Reprinted with permission of CALLERLAB (Basic/Mainstream timing chart, rev. 2023-02-15).

townage's hand-written version danced it in 8 (its journal 2026-10-27-8): the squared-set
figure, which includes moving into the middle. From facing couples it is 6.

## Blocks

| # | Block | Beats | Who |
|---|---|---|---|
| 1 | [`pull-by`](../blocks/pull-by.md)`(right, separation, gap, drift)` | 2 | everyone |
| 2 | [`orbit`](../blocks/orbit.md)`(left, 0.5, width / 2, −close, backward, holds)` | 4 | the beau |
| 2 | [`orbit`](../blocks/orbit.md)`(left, 0.5, width / 2, −close, hold)` | 4 | the belle |

Beats sum to the chart's 6 ✓.

## The Pull By: three pairs pass

Each dancer walks straight across to the other couple's line, right hands joined with the
opposite, let go a quarter beat before they are level. Three pairs pass each other, and each
gets a **clearance at its closest moment**:

1. and 2. **Each beau and the opposite belle**, right shoulders, about the middle of their two
   lines, so couples of different widths still pass straight.
3. **The two belles**, side by side in the middle of the set: each pair's lane moves its belle
   inward. When that leaves them too close, **both couples spread** outward by the same amount,
   which costs neither crossing pair any of its own gap. This is the pull-by's `drift`.

🔴 **The gap at the crossing is solved, not assumed.** With a lane that is wide beside the walk,
two dancers are closest a little *before* they are level, so a gap of exactly the clearance at
the crossing delivers less (the property test: 0.507 for 0.518). Each gap is bisected for its
closest moment, which is `laneForClearance`'s finding for the Trade's bow, here again.

## The Courtesy Turn: close, and back out

*"A couple works as a unit and turns around with the left-side dancer backing up and right-side
dancer walking forward. The turning point is halfway between the dancers."* Half way round, to
the left. His left holds her left (`palm`), and his right is in the small of her back (`back`):
the styling the definition gives when her right hand is on her skirt.

**They turn close.** The circle bows **in** from their standing width to their clearance, as
near as two bodies can be side by side with his arm round her, and back out by the end, so the
couple finishes at its own width. That's `orbit`'s lane, negative. townage found it by solving
the arms (its journal 2026-10-27-8): at a standing width the hand on her back could not reach.

🔴 **For review:** CALLERLAB says nothing about closing up. It's a fact about bodies and arms,
taken from townage's solve. And the clearance is the measure of "as near as they can be"; nothing
more specific is carried.

## Hands (F2)

| Dancer | Beats 0–0.75 | Beats 2–6 |
|---|---|---|
| beau | right, `palm`, the opposite | left `palm` and right `back`, his partner |
| belle | right, `palm`, the opposite | left `palm`, her partner |

Beats 0.75–2: hands free, between the two holds. The hold at the end of the dance is the
consumer's, as for every call (ADR-0026). A couple ends in the ordinary handhold, which is not a
grip.

## Momentum

| Aspect | Value |
|---|---|
| Rotation | +180° for everyone (left) |
| Roll | `ccw`. CALLERLAB allows "Right and Left Thru and a Quarter More": the Courtesy Turn's direction continued |
| Body flow | belle forward; the beau's is behind him: he backed round |
| Last hand used | left |

## Checked (`test/facing-couples.test.ts`)

- Six beats; each dancer's blocks meet.
- Ends in facing couples, each couple on the other's line, beau and belle unchanged, at its own
  width.
- Everybody turns 180° to the left; mid-turn the beau faces away from his travel and the belle
  into hers.
- The right hand is with the opposite and let go before the crossing; the courtesy holds are
  with the partner.
- **Property, over any widths, clearances and spacing:** every passing pair keeps its clearance
  at its closest moment, and both couples end at their own widths.

## Not yet

- The **Ocean Wave Rule** (danced from right-hand waves), **Full Turn** and **and a Quarter More**.
- Squared-set timing (8): moving into the middle is a formation change S3 owns.
- A body-aware **lady ahead** in the Courtesy Turn: townage's solve put her a little in front of
  him, his arm round her. The engine turns them side by side.
