# ADR-0004: Starter scope — the Zero Box module triple plus the Square Thru equivalence set
- Status: Accepted
- Date: 2026-07-24
- Deciders: Ryan

## Context
The call model (spec) is drafted and mix-a-hoot-n-hollar's `moves.md` carries 16
call definitions, but the engine needs a *first implementation target*: small enough
to build while the types are still settling, complete enough to exercise every layer
(formation recognition, call application, FASR, resolution, module classification).
The CALLERLAB Teaching Resource publishes get-ins, zeros, and get-outs per call,
which supplies authoritative test vectors instead of invented ones.

## Decision
Implement **nine Basic calls** and the module set they form:

Calls: Dosado, Square Thru (with fractions 2/3/4), Allemande Left, Right and Left
Grand, Promenade, Star Thru, Pass Thru, California Twirl, Partner Trade.

Modules (all CALLERLAB-listed; see [`../spec/starter-set.md`](../spec/starter-set.md)):
- **Get-in:** `Heads Square Thru Four` — static square → Zero Box.
- **Zeros:** `Dosado` (geometric identity); `Square Thru Three, Partner Trade` (box zero).
- **Get-out:** `Allemande Left, Right and Left Grand, Promenade home` from the Zero Box.
- **Equivalents:** `Square Thru Two = Star Thru, Pass Thru`; `Square Thru Four =
  Star Thru, California Twirl` (from normal couples).

## Alternatives considered
- **The full Basic program first** — rejected: ~50 calls of choreography authoring
  before any end-to-end result; the types would ossify against untested guesses.
- **The "wasted trip" zero modules** — rejected: 9–14 calls each with Plus-level
  material; excellent later-stage test vectors, wrong first rung.
- **Two-couple gesture material first (the game arc's order)** — rejected for the
  *engine*: module and resolution theory — the hardest part — is defined on the full
  square, and CALLERLAB's starter modules give authoritative vectors there.
  Two-couple support stays a type-level constraint (spec open question 3), not the
  starting content.

## Consequences
- Engine v1 must recognize the formations this set touches: static square, facing
  couples, eight-chain-thru (Zero Box), back-to-back couples, right-and-left-grand
  circle, promenade.
- Partner Trade is the one call not already in `moves.md` — it gets specced during
  migration.
- The property-test seed suite falls out directly: Dosado identity, the two
  equivalences, zero classification of `Square Thru 3 + Partner Trade`, and
  get-in→zero→get-out ending at true home.
- Timing comes from the CALLERLAB Basic/Mainstream timing charts in `reference/`.
- Choreography waypoints (planning ADR-0004 in the work effort) must be authored
  for nine calls — the known cost of the paths-as-data seam, now bounded.
