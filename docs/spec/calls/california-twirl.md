# California Twirl

A couple turns around under a raised arch, ending facing the opposite direction with the two
dancers on each other's sides.

Planning ADR-0011's S1.

## 🔴 The salvaged source is wrong about the ending, and Ryan corrected it

`mix-a-hoot-n-hollar/docs/moves.md` records:

> **Ending formation:** Couple facing the same direction, lady and gent sides swapped.

**The facing reverses.** Ryan, 2026-08-15: *"California twirl does change direction facing."*
That is what the call is *for* — it is the standard way to turn a couple around.

Kept visible rather than silently corrected, because
[ADR-0009](../../adr/0009-spec-markdown-is-the-conformance-fixture.md) makes these specs the
fixtures and [ADR-0001](../../adr/0001-typescript-provable-lite.md)'s salvage is a source
rather than an authority. This is the third error the salvage has produced; the pattern is
worth more than any one correction.

The salvaged **description** is retained below and is believed correct — only the ending
formation line was wrong.

## Identity

| Field | Value |
|---|---|
| Canonical name | California Twirl |
| Spoken variants | California Twirl; (historically) Frontier Whirl |
| Legacy app abbreviation | `catw` (from `moves.md`) |
| Program | Basic Part 1 |
| Position dependence | **Yes** — the beau makes the arch, the belle turns under it. First call in the catalog to set `positionDependent` |

## Formations

| | |
|---|---|
| **Start** | A couple — beau on the left, belle on the right ([ADR-0012](../../adr/0012-calls-key-off-couple-position-not-role.md)) |
| **End** | A couple facing the **opposite** direction, each dancer standing where the other started |

## Timing

| Situation | Beats |
|---|---|
| From a couple (point of contact) | **4** |

## Dance action

Salvaged from `moves.md`, translated out of gendered terms per ADR-0012 with the original kept
alongside:

> **Original:** "Gent raises a joined right–left hand arch; the lady walks forward and under
> the arch (turning CW from her perspective) while the gent stays in place or steps through.
> They end side-by-side, having reversed which side each dancer is on."

**Positional:** the **beau** raises the joined inside hands into an arch and walks around;
the **belle** walks forward and under the arch, turning clockwise from her own point of view.
They end side by side, on each other's former sides, facing the opposite direction.

The translation is the substantive work ADR-0012 asks for, and it is where a translation error
would hide — which is why the original stays.

## What it is, geometrically

The couple ends where a 180° rotation about its own centre would put it: both dancers in the
other's spot, both facing reversed.

**The paths are not a rotation, and that is the difference from
[Partner Trade](partner-trade.md).** The belle turns under a fixed arch — a tight turn about
the joined hands — while the beau walks the larger arc around her. One dancer is turned by the
other; in Partner Trade neither is.

## Position dependence, concretely

| | beau | belle |
|---|---|---|
| Hands | Raises the joined inside hands; keeps the grip | Passes under, keeps the grip |
| Path | The outer arc around the belle | The tighter turn under the arch |
| Own rotation | Follows the arc | A full turn under the hands, CW from her own view |

This is the first call for which `positionDependent` is `true`, and therefore the first real
use of the vocabulary ADR-0012 introduced.

## Block composition

🔴 **Needs a block the catalog does not have**, and a different one from Partner Trade's.

| # | Block | Beats | Exit |
|---|---|---|---|
| 1 | `turn-under(...)` — **not yet in the catalog** | 4 | the other's spot, facing reversed, grip kept |

`turn-under` is the arch figure: two dancers with joined hands, one passing beneath while the
other walks around. It is the block **Star Thru and Box the Gnat also need**, which is why it
is worth designing once rather than per call — ADR-0005's bet that the catalog makes later
calls cheaper, stated as a prediction that can be checked:

- **California Twirl** — from a couple, ends a couple, facing reversed
- **Star Thru** — from facing dancers, ends a couple
- **Box the Gnat** — from facing dancers, ends facing dancers, having exchanged

If one `turn-under` with parameters covers all three, the bet is good. If each needs its own
block, ADR-0011's consequence applies and S2 should say so rather than absorbing it.

## Choreography paths

**Deliberately not in the conformance-fixture format yet**, for the same reason as
[Partner Trade](partner-trade.md): the loader throws on a block it cannot find, and taking the
suite red for an unbuilt block is not a defect worth signalling.

What the fixture will assert once `turn-under` lands — couple centred on the origin facing
`+y`, beau entering at `(−0.5, 0)` and belle at `(+0.5, 0)`:

| Beat | beau x | beau y | beau facing | belle x | belle y | belle facing |
|---|---|---|---|---|---|---|
| 0 | −0.5 | 0 | +y | +0.5 | 0 | +y |
| 2 | −0.35 | −0.35 | −x | +0.2 | +0.2 | +x |
| 4 | +0.5 | 0 | −y | −0.5 | 0 | −y |

🔴 The beat-2 row is **illustrative, not derived** — it says the beau takes the outer arc and
the belle the tighter one, which is the call's shape, but the actual coordinates come from the
block once it exists. Marked so nobody mistakes a sketch for a fixture.

## Flow

| Field | Value |
|---|---|
| Hands | Inside hands joined throughout — beau's and belle's adjacent hands |
| Last hand used | The joined inside hand, released at the end |
| Rotation (F4) | 180° for the couple; the belle accumulates more, turning under |
| Body-flow vector | Along the final facing |
| Roll | Available |

## Is it a zero?

**Two California Twirls should return the couple to its start** — two 180° reversals and two
exchanges. That is the second half of Ryan's S1 sequence, and `isZero` settles it rather than
this paragraph.

## Suspected equivalence with Partner Trade

Both calls appear to end with the couple facing reversed and the two dancers in each other's
spots. If the end positions match exactly, it is a real equivalence — a caller can substitute —
and it belongs in [ADR-0004](../../adr/0004-starter-scope-zero-box-triple.md)'s equivalence
suite alongside the Square Thru set.

They are **not** the same call: the hands differ, the paths differ, and one turns a dancer
while the other does not. Equivalence is about where you end up, and that is exactly the kind
of claim this engine now has the machinery to check.

🔴 **Unverified.** A question for the engine, not a claim.
