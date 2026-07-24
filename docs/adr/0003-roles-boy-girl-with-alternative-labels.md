# ADR-0003: Model roles as boy/girl, with pluggable alternative labels
- Status: Accepted
- Date: 2026-07-24
- Deciders: Ryan

## Context
Every call definition and the FASR arrangement axis are written over the two dance
roles. The naming question (call-model spec, open question 1): model them as
traditional **boy/girl**, or as gender-free **Lark/Robin** with boy/girl as
presentation? The source material cuts both ways — CALLERLAB definitions, the FASR
literature, and mix-a-hoot-n-hollar's `moves.md` are all written in boy/girl terms,
while townage NPCs aren't inherently gendered and some communities dance with
gender-free calls.

## Decision
The model uses **boy/girl** as the canonical role identifiers, matching the source
definitions verbatim so specs migrate without translation. The engine exposes a
**role-label option**: consumers (and eventually players/clubs) can select or supply
alternative label sets — e.g. Lark/Robin — which are presentation-layer aliases over
the same two canonical roles. Labels never affect semantics.

## Alternatives considered
- **Lark/Robin as the canonical model** — rejected: every upstream definition,
  timing chart, and our own moves.md would need translating on the way in and back
  out for teaching text; the mismatch would be a standing source of transcription
  errors.
- **Boy/girl only, no alternatives** — rejected: townage wants un-gendered NPCs and
  gender-free clubs are real; hard-coding the presentation would force consumers to
  build their own aliasing anyway.

## Consequences
- Spec migration from `moves.md` and CALLERLAB material stays 1:1.
- The public API carries a small labeling indirection from day one — cheap now,
  disruptive to retrofit later.
- Teaching text stored in call records should reference roles via tokens (so labels
  substitute cleanly), not literal words — a constraint on how dance-action prose is
  authored.
