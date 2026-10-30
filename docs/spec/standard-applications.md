# Standard applications: where each call is danced from

_Status: 🧪 draft (2026-10-30), exploratory, no ADR. Code: `src/formations.ts`,
`src/standard-applications.ts`. Sources: CALLERLAB's Standard Basic Applications (rev. August 2022)
and Standard Mainstream Applications (rev. May 2020), in `reference/callerlab/`
([reference-sources.md](reference-sources.md))._

[call-model.md](call-model.md) plans a call record with *"Valid starting formations"*, an *"Ending
formation, per starting formation"*, and *"Standard vs Extended applications"*. This is that record
for the 94 Basic and Mainstream calls the-lot's voice test knows, **whether or not the engine
dances them yet**. It needs no geometry, so it comes before the dancing: a consumer can ask what is
legal from here now, and each call's chain is added when it is built.

## Why now: the voice test

The voice test (the-lot `#voice-test`, 2026-10-30) heard "Dodo" for Dosado, "California tour" for
California Twirl, and "Allaman left" for Allemande Left. Ryan didn't want to keep a spelling list up
for every caller. A caller can only call what is legal from where the dancers stand, and that is
a handful of them, so the matcher can choose among those few and match loosely. A chain of calls
keeps it narrow: each call's ending formation is the next one's start.

## The formation names

`FORMATIONS` names each formation the documents start a call from, with CALLERLAB's wording. A
formation is a **name** (shape, facing directions and handedness, as call-model.md Layer 2 defines
it), not positions. Recognising one from dancers' positions is still S2's job.

- **Handedness is in the id.** `rh-parallel-waves` and `lh-parallel-waves` are different
  formations: Swing Thru is standard from one and Left Swing Thru from the other, and a call ends
  in one hand. Where a chart says "(Right or Left-Handed)", the call gets both.
- **Units.** The documents also name the smallest group a call needs: "Any Two Facing Dancers",
  "Any Facing Couples", "Any Normal Couple", "Back-to-Back Couples". Those are formations too, and
  `UNIT_IN` lists the whole-set formations that hold one for every dancer. Trade By isn't listed
  for facing couples (only its centers face), and CALLERLAB lists it on its own wherever it's
  standard, with the centers active.
- **Arrangements stay as CALLERLAB wrote them** (`"0" (Normal Couples)`, `"1/2", "3", "4"`,
  `BGBG`). The numbers are those of CALLERLAB's "Names & Pictograms of Selected Formation
  Arrangements". Nothing reads them yet; they're kept so the record doesn't lose them.

## The record

| Field | From | Meaning |
|---|---|---|
| `from` | CALLERLAB | the starting formation, or `any` ("All Formations", U-Turn Back only) |
| `arrangement` | CALLERLAB | their wording |
| `who` | CALLERLAB's comments | who the call is directed to, when it isn't everyone |
| `to` | **ours** | the ending formation, worked from the definitions. `same` keeps the formation; absent means it depends on what the caller adds (a fraction, where to stop) or isn't settled |

**`to` is not CALLERLAB's.** They publish no ending table. Each ending was worked from the
definition and the geometry (couples' facing, which side the beau is on, which hands meet), and
the ones checked against a common sequence are in the test (`Heads Lead Right, Pass Thru, Trade By,
Swing Thru, Boys Run, Ferris Wheel`). An ending is left out rather than guessed. Recycle, Walk and
Dodge, Fold and most "centers only" applications don't have one yet.

**A family said as one call holds every member.** `circulate` has Boys, Couples, All Eight,
Column, Split and Box Circulate; `run` has Boys/Girls, Centers and Ends Run; `ladies-chain` has Two
and Four Ladies Chain; `dosado` has Dosado to a Wave. **Members said in their own words are calls
of their own** (19 of them, added 2026-10-30 after Ryan's free run said "Chain down the line"):
Wrong Way Promenade, Star Promenade, Weave the Ring, Wrong Way Grand, Rollaway, Ladies In Men
Sashay, Backtrack, Chain Down the Line, Left Square Thru, Reverse Wheel Around, plain Trade (Boys,
Centers…), Cross Run; and at Mainstream Allemande Thar, Wrong Way Thar, Slip the Clutch, Shoot the
Star (and Full Around), Quarter Tag and Three-Quarter Tag. Reverse Wheel Around and the fraction
tags are too new for CALLERLAB to call any application Standard; their listed "likely" ones are
here.

## Asking it

- `callsFrom(formation)`: every call with a standard application from there, counting units the
  formation holds and U-Turn Back's `any`. From Eight Chain Thru it includes Pass Thru, Dosado,
  Swing Thru and Star Thru; not Ferris Wheel or Bend the Line.
- `endingsFrom(call, formation)`: the endings its applications from there give, `same` resolved.
  More than one where a call has variants (Dosado from Eight Chain Thru: itself, or parallel
  waves, as Dosado to a Wave). Empty when it isn't standard from there.

Standard isn't the same as legal. "Variations that are not listed are Extended Applications", and
callers use some. For a matcher, Standard is the right first filter: what a caller says is far
more likely Standard, and a miss can fall back to the whole list.

## Checks

`test/standard-applications.test.ts`: 94 calls, each with an application; every call the engine
dances is covered; every ending has a call standard from it (so a chain never strands); the
chain above walks; `same` resolves to the starting formation. the-lot checks its vocabulary and
this record name the same 94 ids.

## Notice

The `from`, `arrangement` and `who` fields are derived from CALLERLAB's documents, which require:

> © 1991-2022 CALLERLAB, Inc. Topeka, KS, The International Association of Square Dance Callers.
> Permission to reprint, republish, and create derivative works without royalty is hereby granted
> provided this notice appears. Publication on the Internet of derivative works without royalty is
> hereby granted, provided this notice appears. Permission to quote parts, or all of, this
> document without royalty is hereby granted, provided this notice is included. Information
> contained herein shall not be changed nor revised in any derivation or publication.

(Standard Mainstream Applications: © 1991-2020, same terms.)
