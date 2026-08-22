# ADR-0024: The arch is a hold, not a block — `turn-under` is deleted
- Status: Accepted
- Date: 2026-08-21
- Deciders: Ryan, Claude

## Context

[ADR-0005](0005-building-blocks-first-class.md) bet that a first-class block catalog makes later
calls cheaper, and `turn-under` was the showcase for that bet — *"two dancers with joined hands
rotate about them, one passing beneath the other's raised arch"*, built as the **arch family's**
shared block on the strength of three predicted consumers: California Twirl, Star Thru and Box the
Gnat.

It has never had one.

- **California Twirl** was its first, for one day. [ADR-0017](0017-a-california-twirl-is-a-partner-trade-holding-on.md)
  found the call is a **Partner Trade danced holding on** — the same two paths as a Trade, with the
  inside hands joined and raised. Not a rotation of the pair; two ordinary figures and a hold. The
  rigid-rotation model had also given the belle a 540° turn and left the figure with **no clearance
  in it at all**, which that spec had written up as a feature.
- **Star Thru** was the tiebreak, and its own spec said so: *"Star Thru now settles whether the arch
  family has a block or the arch is a hold on figures we already have."* It was derived on
  2026-08-21 (`docs/spec/calls/star-thru.md`) and **its two dancers turn in opposite directions** —
  the man a quarter right, the lady a quarter left. No rigid rotation of a pair can produce that,
  because a rigid rotation turns both dancers the same way. It is a `step-pivot` each, mirrored,
  with an arch hold.
- **Box the Gnat** is unbuilt, and is the same shape as Star Thru: the two dancers exchange with
  opposite turns.

Meanwhile the block accumulated the defects of code nothing calls. It reported its handhold as
`forearm` — a grip at *elbow* height — for a figure defined by walking beneath it, from before
`arch` existed as a `GripStyle` at all; nothing caught that for four days and it was only found by
a sweep ([ADR-0020](0020-every-call-is-sized-to-the-bodies-that-dance-it.md)).

## Decision

**Delete `turn-under`, its spec, and its conformance vectors. The arch is a `GripStyle`, not a
block.**

Two calls were predicted to need it and neither does. The distinguishing feature of the arch family
is *what the dancers are holding*, not *how they travel* — and holding is already expressible, as
`Hold` on `orbit` and `step-pivot`, emitting a `GripSpan` with `grip: "arch"`. That is the whole of
what the family shares.

## Alternatives considered

- **Keep it for Box the Gnat.** The last named consumer. Rejected on the derivation rather than on
  taste: Box the Gnat exchanges two dancers with **opposite** turns, exactly as Star Thru does, so
  the same argument disqualifies it. Keeping a block for a consumer that has already been shown not
  to want it is how this one survived two years of Tuesdays.
- **Keep it as a documented dead end.** The repo does keep superseded readings with banners
  (`partner-trade.md`), and that is right for *prose*. It is wrong for **code**: a block in
  `CatalogCall` is offered to the custom-move workshop and to every consumer, and a block with a
  known-wrong default that nothing exercises is a trap rather than a record. Git has it; ADRs and
  four journal entries describe it.
- **Wait for a third candidate.** There is no fourth arch call in the starter set, and the two that
  exist have both answered. Waiting would mean carrying it past the moment its own spec named as
  the deciding one.

## Consequences

- **The catalog is five blocks**: `pass`, `slide`, `arm-turn`, `orbit`, `step-pivot`. Every one of
  them has a live consumer, which was not true before today.
- **ADR-0005's bet is settled on this instance, and settled against.** That is worth stating
  plainly rather than softening: the block was built ahead of its callers, all three predicted
  callers turned out to want something else, and the catalog was made *larger* rather than later
  calls cheaper. The bet is not thereby lost in general — `orbit` and `step-pivot` are each shared
  by two calls, and `pass` by two — but it is lost **when a block is designed from a family
  resemblance rather than from a figure somebody has actually walked**.
- 🔴 **The arch's clearance machinery is unaffected**, and that is the evidence the hold reading is
  the right one: `archClearance`, the solved bow and the-lot's two accommodations all attach to the
  *grip*, never to the block, and none of them moves.
- **218 tests, from 225** — the seven that go are `turn-under`'s own, including the grip-style
  regression ADR-0020 added. Nothing else moved.
- **Promotion condition:** if a call turns up whose two dancers genuinely rotate **together** about
  a joined hand — a rigid pair rotation, which is what this block modelled — it should be rebuilt
  from that call rather than restored from history. The thing that was wrong here was building it
  from a family name.
