# 2026-10-28 (3) — heads ahead of their bodies

🧪 Exploratory, no ADR. **Uncommitted, waits for Ryan's look** (released, it would be 0.9.0: a new
optional field, so additive).

Journal 27 left one Pass Thru clipping: townage's ember carries its head **28 cm forward** of its
body. Two embers facing each other meet head first: bodies 109 cm apart, heads 72 cm, 92 needed.
A side-by-side clearance can't see that.

## What changed

- **`FigureShape.forward`** (optional, default 0): how much nearer two dancers' widest parts come
  than their centres when facing, each body's forward offset added. `shapeOf` and `partnerUp`
  accept it (it may be 0, where the others must be positive). `reformCouple` carries it across a
  call, as the clearances are carried (ADR-0019). `reformCouple` now builds its couple with the
  shape-object form of `partnerUp`, since the positional form has no slot for it.
- **`pass`'s `forward` parameter, and `centeredGap(c, s, f)`**: the heads travel the bodies' line
  shifted by `f`, so their closest is `G·(s − f) / √(G² + s²)`, and the gap at the crossing is
  `G = c·s / √((s − f)² − c²)`. With `f = 0` it is journal 27's formula. The bodies, behind their
  heads, are then further apart than `c`.
- **Pass Thru's chain passes it** when it's above 0. Other figures don't read it yet. Dosado
  passes back to back, and townage's Dosados are clean.

## Checks

Two tests in `facing-couples.test.ts`: the heads (and the bodies) keep the clearance at
`(c, f)` = (0.44, 0.25), (0.6, 0.1), (0.3, 0.2), sampled continuously; a couple keeps `forward`
across a Partner Trade, and one without it has none. 253 tests; `tsc`, lint, build, docs-hygiene
clean.

In townage (its journal 2026-10-28-10): ember ×4's Pass Thru is clean (clip 5.1 → 0 cm, the beau's
step 26 → 3), and baked.

## Next

Ryan looks → commit, 0.9.0, townage's pin.
