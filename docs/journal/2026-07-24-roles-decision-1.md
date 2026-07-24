# 2026-07-24 (2) — roles: boy/girl, with the door open

_Documents ADR-0003, landed in commit `62c2f8c`._

First of the call-model spec's four open questions settled, and against my lean:
**boy/girl as the canonical model**, not Lark/Robin. Ryan's call, and the reasoning
holds up better than my instinct did — every source we're migrating (CALLERLAB
definitions, FASR literature, our own moves.md) is written in boy/girl terms, so a
gender-free canonical layer would mean translating on the way in and translating back
for teaching text, forever, with every transcription a chance to err.

The gender-free case doesn't lose, though — it moves to where it belongs: a
**pluggable label option** (Lark/Robin or whatever a club prefers) as pure
presentation aliases over the same two roles. One real constraint falls out for spec
authoring: dance-action prose in call records references roles via tokens, not
literal words, so label substitution stays clean. Worth remembering when moves.md
gets migrated.

Three questions still open: Layer-4 v1 scope, two-couple-safe types, concepts out of
scope.
