# `turn-under`

Two dancers with joined hands rotate about them, one passing beneath the other's raised arch.

The arch figure. **California Twirl, Star Thru and Box the Gnat are all this block with
different parameters** — which is the prediction ADR-0005's "the catalog makes later calls
cheaper" bet is being tested on, stated here so it can be checked rather than assumed.

🔴 **No call uses this block, as of 2026-08-18.** California Twirl was its one consumer and is
now a [Partner Trade](../calls/partner-trade.md) with the hands joined — `orbit` and
`step-pivot`, each carrying a `hold`
([ADR-0017](../../adr/0017-a-california-twirl-is-a-partner-trade-holding-on.md)). The prediction
above is therefore **open again rather than won**: what looked like the arch family's shared
block turned out to be one call's rigid-rotation model, and the arch turned out to be a *hold* on
figures the catalog already had.

The block, its spec and its conformance vectors are kept because **Star Thru** is what will
settle it — a call from a facing pair, where the two dancers genuinely do rotate about their
joined hands rather than exchange sides of a couple. If Star Thru needs this, the bet is good and
the Twirl was simply not a member of the family. If it does not, this is a candidate for
deletion, on the same terms `orbit`'s `lane` has carried since ADR-0014.

## Parameters

| Parameter | Values | Meaning |
|---|---|---|
| `pivot` | `right` / `left` | Which side of **this dancer** the joined hands are on |
| `turn` | `right` / `left` | Which way the pair rotates. `left` is CCW, as in [`orbit`](orbit.md) and [`arm-turn`](arm-turn.md) |
| `fraction` | quarter multiples | How far the pair rotates together. A California Twirl is `0.5` |
| `radius` | positive | Distance from the joined hands |
| `spin` | whole turns, default `0` | This dancer's own extra rotation. `0` makes the arch, `1` goes under it |
| `hand` | `right` / `left` | The joined hand, for the F2 grip channel |

## Frame, and why it is not `orbit`'s

`orbit` assumes the dancer walks **forward** around the centre, so its facing is tangential and
the pivot is implicitly on one side. That works for a facing pair and **breaks for a couple**:
two dancers of a couple stand on opposite sides of their joined hands and face the *same* way,
so the pivot is on one dancer's right and the other's left. A tangential-facing block cannot
express both.

So this frame is stated the other way round. The dancer enters at `(±radius, 0)` facing `+y` —
the catalog's ordinary block-local forward, as `pass` and `slide` use — and `pivot` says which
side the hands are on. **Facing rotates rigidly with the body**, not along the path, which is
what "the couple turns around" means and is the substantive difference from walking a circle.

## The spin is the whole difference between the two dancers

Both end facing the same way and in each other's spots. The one going under the arch takes an
extra full turn getting there, and a full turn cancels in the end facing — so the difference
shows up in `momentum.rotation` and nowhere else. That is where F4 wants it, since accumulated
same-direction rotation is what the flow rules watch.

## No lane is needed, unlike a Trade

The two dancers stay **diametrically opposite** across the joined hands for the whole rotation,
so nothing has to separate them. [Partner Trade](../calls/partner-trade.md) needs a lane
because both of its arcs pass through the same side of the couple; this one does not. Worth
noting because it shows the lane is a property of the *figure* rather than of exchanging places.

## Flow

| Field | Value |
|---|---|
| Hands | The named hand, joined for the whole block |
| Last hand used | That hand |
| Rotation (F4) | `(fraction + spin) × ±360°`, signed by `turn` |
| Body-flow vector | Along the final facing |
| Roll | Available |

## Worked examples

The two halves of a California Twirl, at the couple's own half-width.

`turn-under(right, right, 0.5, 0.5, 0, right)` — 4 beats; the arch dancer, the beau:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | −0.5 | 0 | +y | standing as beau, hands joined on the right |
| 2 | 0 | 0.5 | +x | a quarter of the shared rotation, round the front |
| 4 | 0.5 | 0 | −y | in the belle's spot, the couple reversed |

`turn-under(left, right, 0.5, 0.5, 1, left)` — 4 beats; the dancer going under, the belle:

| Beat | x | y | Facing | Doing |
|---|---|---|---|---|
| 0 | 0.5 | 0 | +y | standing as belle, hands joined on the left |
| 2 | 0 | −0.5 | −x | round the back, already three-quarters through her own turn |
| 4 | −0.5 | 0 | −y | in the beau's spot, having turned under once on the way |

Note the two dancers are at `(0, +0.5)` and `(0, −0.5)` at beat 2 — opposite sides, which is the
no-lane-needed property stated as coordinates.
