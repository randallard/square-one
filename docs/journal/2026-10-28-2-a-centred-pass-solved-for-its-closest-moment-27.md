# 2026-10-28 (2) — a centred pass, solved for its closest moment

🧪 Exploratory, no ADR. **Uncommitted, waits for Ryan's look** (released, it would be 0.8.0:
additive in behaviour only for consumers passing a body clearance above the figure's own).

townage's `solve-all` (its journals 2026-10-28-8 and -9) solved Pass Thru for all 25 pairings of
its cast. Ember ×4 clipped head to head at t = 0.3, 10.4 cm, **before** the crossing.

## What it was

A `centered` pass is a V: each lane opens straight to the crossing and closes straight after it,
while the two close the separation. Between those lines the closest they get is the distance from
the origin to the line through `(0, s)` and `(G, 0)`: `G·s / √(G² + s²)`, less than the gap `G` at
the crossing, and reached on the way in. `pull-by` (journal 26) and the Trade's bow
(`laneForClearance`) had the same finding.

`shape.test.ts` asserted the Pass Thru's lane was *"exactly the clearance asked for"*, measured at
the waypoints, where the crossing is. That's how it passed.

## What changed

- **`centeredGap(c, s) = c·s / √(s² − c²)`** (`blocks/pass.ts`): with a body clearance above
  `PASS_CLEARANCE`, the gap at the crossing is this, so the closest moment is the clearance. Capped
  at 95% of the separation, where no lane can deliver.
- **The figure as drawn is untouched** (ADR-0021): at `PASS_CLEARANCE` it dips to 0.287 at its
  closest, and `pass.md`'s table, a live fixture, stays as it is.
- `shape.test.ts` measures the wide Pass Thru continuously, along `sampleMotion`, not at
  waypoints. New tests: the closest moment equals the clearance at 0.4, 0.6, 0.8; the default is
  unchanged.
- `spec/blocks/pass.md`: a section on it.

251 tests; `tsc`, lint, build, docs-hygiene clean.

## What it doesn't fix

townage's ember ×4 still clips 5.1 cm: ember's head sits **28 cm forward** of its body, so two
embers facing each other meet head first. A side-by-side clearance can't say that; a body's forward
reach would be a new measure in `FigureShape`. Not done.

## Next

Ryan looks → commit, 0.8.0, townage's pin.
