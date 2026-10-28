# 2026-10-27 — a wait between calls

townage's floor joins two California Twirls into one unbroken arch (its 10-27-4 and 10-27-5).
The next thing it needed was a pause: Ryan, 10-27: *"during the chain they don't go all the way
to hand hold between moves but if there's a beat or more after the next call should be called
then they go to handhold"*. The engine's sequences had no gaps, since every call started on the
beat the last one ended. So only the end of a dance could wait. Ryan chose to put the wait in
the engine rather than splice it in on the floor.

## What changed (`sequence.ts`)

- **`danceSequence` and `danceCoupleSequence` take `waits`**, which is the beats waited before
  each call, by index. Missing means none. A negative or non-finite wait throws a `RangeError`.
  A wait belongs to no call. It shows only as the gap between one step's end and the next step's
  `startBeat`, and in `Sequence.beats`.
- **`flattenSequence` stands the dancers still through a gap.** The next call's leading
  waypoint is kept when it doesn't touch the previous exit. Without a gap it's still dropped as
  before, and a wait before the first call adds a copy of its first waypoint at beat 0.
- **`WAIT_BEATS = 1`** is exported. A gap this long or longer is a wait: the hold live at the
  call's end is trimmed by `HOLD_RELEASE_BEATS`, exactly as at the end of the dance. A shorter gap
  merges the spans across it, so the hold carries on and the dance flows.

This extends ADR-0026's decision ("the dance releases a hold, not the block") from the final beat
to any wait. It's the same rule ADR-0026 states: the sequence knows the call list, so the
sequence decides. **No ADR yet:** townage's posing work is exploratory (no ADRs until the product
settles). When it settles, ADR-0026 wants a successor that names waits.

| two Twirls, wait before the second | arch spans |
|---|---|
| none | 0 → 7.5, one span |
| 0.5 beat | 0 → 8, one span (held across the gap) |
| 1 or 2 beats | 0 → 3.5, then (4 + wait) → end − 0.5 |

Where nobody goes changes nothing: the zero is the same zero with or without a wait.

## Verified

- **231 tests** (was 224; 7 new under "a wait between calls").
- `tsc`, lint and build are clean. Prettier flags the same 22 files it did at HEAD; CI doesn't
  run it.
- **townage**, linked to this checkout, with its new `#dance=two-twirls-wait` and
  `#dance=two-twirls-half` (NPC Ryan / NPC Ryan): the couple stands in the handhold through the
  2-beat wait and holds the arch through the half beat. Its suite has the same 38 known failures
  as before.

## Not done

- **Not released.** This needs a version (0.6.0: additive, but `flattenSequence`'s waypoints
  change for any gap) and townage's pin moved. Ryan approves both.
- **What the wait looks like is still the consumer's**, as ADR-0026 says: a couple waits in the
  handhold, and a wave or a line is S2's formation recognition.
