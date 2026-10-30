# 2026-10-30: Standard Applications as data — 32

🧪 Uncommitted, for Ryan's look. Exploratory, no ADR (no-ADRs-while-exploring; the spec carries it).

## Why

the-lot's voice test, first run on Ryan's iPhone (Safari, Apple's server recognition, 15
utterances at 128 bpm): end of speech to the first result naming a call, median 378 ms (a beat is
469). Fast enough. Accuracy: 6 of 11, and every miss was a spelling the vocabulary lacked: "Dodo",
"California tour", "Allaman left", "Right left grand". Ryan: *"i don't want to keep having to update
spelling list for every caller ... is that the only way?"*

No: a caller can only call what is legal from where the dancers stand. Ryan, on that: *"Legal
calls from a formation could bring in the notation of dancer formations ... it could be something
we need to include in the call notation / object that we store"*. [call-model.md](../spec/call-model.md)
had planned exactly that record (starting formations, ending per start, Standard vs Extended); the
code had none of it. `CallDef` knows its chain, and the formation was implicit in which
`applyCallTo*` you call.

Ryan chose: **all 75 calls the voice test knows, as plain data**, whether or not the engine dances
them, so the voice work isn't held up for the engine.

## What was built

- `src/formations.ts`: `FORMATIONS`, 42 named formations with CALLERLAB's wording, handedness in
  the id. `UNIT_IN`: which whole-set formations hold a unit (any facing dancers, any facing
  couples, any normal couple, a couple facing out).
- `src/standard-applications.ts`: `STANDARD_APPLICATIONS`, the 75 calls by the voice test's ids,
  each application `from` + `arrangement` (CALLERLAB's) + `who` + `to` (ours). `callsFrom`,
  `endingsFrom`.
- [`docs/spec/standard-applications.md`](../spec/standard-applications.md).
- 9 tests. the-lot checks the ids match its vocabulary.

## Worth knowing

- **CALLERLAB publishes no endings.** Every `to` was worked from the definitions. The first pass
  had Star Thru from facing couples ending back to back; CALLERLAB's own Split Two comment ("Heads
  Star Thru and California Twirl, Split Two") only works if heads end facing each other, and
  walking it through (the man turns right, the woman left, both face the same way) agrees. So Star
  Thru turns facing couples a quarter: Facing Lines ⇄ Eight Chain Thru, Heads Star Thru → Double
  Pass Thru.
- **Three unit endings were wrong and are gone.** California Twirl from "any couple", and Courtesy
  Turn and Wheel Around from a couple facing out, were `same`. But a couple turning around changes
  the whole formation it stands in (lines facing out become facing lines), so they're absent.
- **Endings left out**, not guessed: Recycle, Walk and Dodge, Fold, Cross Fold, Couples Hinge,
  Cast Off from waves, and most centers-only applications.
- The CALLERLAB notice is in the module header and the spec, as their permission requires.

## Next

- the-lot: chain mode and loose matching (sound-alike) on the voice test, narrowed by `callsFrom`.
- Fill in the missing endings as they're needed, each from its definition.
- Arrangements are kept as text; nothing reads them. Parsing them (FASR) comes when something
  needs "Standard from *this* arrangement".
