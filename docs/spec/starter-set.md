# Starter set — the Zero Box triple and equivalence suite

_Decided 2026-07-24 ([ADR-0004](../adr/0004-starter-scope-zero-box-triple.md)). This
page is the working detail: the exact modules, what each proves, and the per-call
status table for the migration._

## The module triple

The smallest CALLERLAB-listed get-in → zero → get-out cycle, danced from a static
square back to true home:

1. **Get-in — `Heads Square Thru Four`** → **Zero Box** (corner box: each boy faces
   his corner in an eight-chain-thru setup). Source: [Square Thru modules](https://teaching.callerlab.org/basic-part-1/square-thru-definition/square-thru-modules/).
2. **Zero — `Dosado`**: a geometric identity — every dancer orbits and returns to
   the same spot and facing. CALLERLAB lists it flatly: "Dosado is a Zero"
   ([Dosado modules](https://teaching.callerlab.org/basic-part-1/dosado-definition/dosado-modules/)).
   Callable any number of times without changing the FASR.
3. **Get-out — `Allemande Left, Right and Left Grand, Promenade home`**: the classic
   resolution chain, available immediately from a Zero Box because the corner is at
   hand.

Second-tier additions from the same sources, once the triple runs:

- **Box zero:** `Square Thru Three, Partner Trade` — a *working* zero (dancers move
  and swap through space but the FASR returns).
- **Equivalents** (from normal facing couples):
  `Square Thru Two = Star Thru, Pass Thru` ·
  `Square Thru Four = Star Thru, California Twirl`.
- **Fancier get-out:** `Star Thru, Square Thru Three, Allemande Left` (from Zero
  Box or Zero Line).

## What each piece proves (property-test seeds)

| Vector | Invariant it pins down |
|---|---|
| Dosado from any formation | `apply(dosado, S) == S` — identity; also collision-free orbit paths |
| Heads Square Thru 4 | static square → eight-chain-thru recognition; breathing (heads work center, sides adjust) |
| The full triple | end state == true home for all 8 dancers (position *and* facing); resolution detector fires at the Zero Box |
| Square Thru 3 + Partner Trade | classified as a zero by FASR comparison, not by path identity — distinguishes *geometric* zeros from *working* zeros |
| The two equivalents | `apply(A, S) == apply(B, S)` over all normal-couple states — equivalence checking as an engine feature |
| Timing sums | each module's beat total matches the CALLERLAB timing charts |

## Per-call migration status

| Call | In `moves.md`? | Timing (chart) | Spec file | Paths authored |
|---|---|---|---|---|
| Dosado | ✅ (`dsd`) | tbd | — | — |
| Square Thru (2/3/4) | ✅ (`sqth`) | tbd | — | — |
| Allemande Left | ✅ (`al`) | tbd | — | — |
| Right and Left Grand | ✅ (`rlg`) | tbd | — | — |
| Promenade | ✅ (`prom`) | tbd | — | — |
| Star Thru | ✅ (`st`) | tbd | — | — |
| Pass Thru | ✅ (`pt`) | tbd | — | — |
| California Twirl | ✅ (`catw`) | tbd | — | — |
| Partner Trade | ❌ **new** | tbd | — | — |

Formations the set requires the engine to know: static square, facing couples,
back-to-back couples, eight-chain-thru (Zero Box), right-and-left-grand circle,
promenade. Timing values get filled from
`reference/callerlab/basic-and-mainstream-timing-charts.pdf` during migration
(see [reference-sources](reference-sources.md)).
