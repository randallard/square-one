# Facing couples

_Status: 🧪 draft (2026-10-28), exploratory, no ADR. Planning ADR-0011's **S2**: the first
formation of four. Code: `src/facing-couples.ts`._

Two couples facing each other, each straight in front of the other. CALLERLAB's starting
formation for Right and Left Thru, Square Thru, Star Thru from a set of four, Ladies Chain, and
most of the Basic program after the square breaks up.

## What it is in the engine

| | |
|---|---|
| `FacingCouples` | `{ first: Couple, second: Couple }`, the two in no particular order |
| `faceCouples(first, second)` | checks they **are** facing couples: facing opposite ways (±2°), the second ahead of the first, on one line (±0.05). Throws otherwise: a call is not danced from a formation it isn't defined from |
| `setFacingCouples(first, second, separation?, center?, facing?)` | stands two couples up, `separation` apart centre to centre |
| `roomToFace(first, second)` | the least separation a set may have (below) |
| `relative(set, key, "partner" \| "opposite")` | who a dancer's partner is, and who is straight across |
| `applyCallToFacingCouples(call, set)` | every dancer's motion, keyed, each grip naming who it is held with |
| `reformFacingCouples(set, motions)` | the set a call left, checked to be facing couples again |

**The opposite is straight across.** A couple facing you has its beau on *your* right, so the
dancer in front of a beau is the other couple's belle, and the dancer in front of a belle is the
other beau.

## The grip has to say whose hand

Every formation before this had two dancers, and a pair or a couple has exactly one other dancer
in it. Four is where a grip has to name a hand. A block says so in the formation's words,
`relation: "partner" | "opposite"`, because a block knows the figure and not the cast; the
formation resolves it to a key, `with`.

## Room to face: a clearance and half of each couple's width

Couples are never stood closer than `clearance + (width₁ + width₂) / 2`, where the clearance is
the wider couple's and never less than a Pass Thru's (ADR-0021).

The courtesy turn is where it binds: two couples turning back to back each swing one dancer along
the line between them, so mid-turn a beau and the other couple's belle are the separation less
both radii apart. The property test found that before this rule did (0.950 for 0.955 asked), and
townage's hand-written Right and Left Thru had already stood its couples exactly this far apart
(`W + lane`, its journal 2026-10-27-8).

Asked for less, `setFacingCouples` stands them that far instead, the way a dancer steps back. At
the body-agnostic defaults the room is 0.633 and the pair frame's unit stands.

## Not yet

- **Recognition**: looking at four poses and deciding they are facing couples. `faceCouples`
  checks a set it is handed; it does not find one.
- **Sequences of four**: `danceCoupleSequence`'s counterpart, and `flattenSequence`'s release of
  the last hold at the end of the dance. Right and Left Thru is danced one call at a time.
- **Mixed** two-dancer calls from facing couples (a Pass Thru, a Dosado): the pair calls are
  danced pairwise, which is the same thing applied twice, and nothing has needed it yet.
