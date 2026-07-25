# 2026-07-24 (5) — moves are made of blocks

_Documents ADR-0005 and the dosado/blocks specs, landed in commit `b3a3a1f`._

Ryan reviewed the Dosado spec — liked it — and then pushed it somewhere better: he
wants moves built *from parts*, a catalog of building blocks you can compose your
own moves from, evaluate for flow, and eventually share. Which is also exactly how
townage teaches (fist bump → arm turn → real calls). So the monolithic waypoint
table was the wrong final form on day one.

ADR-0005: blocks are first-class. A block = entry contract + parameters + waypoint
fragment + beats + hands + momentum delta + exit pose; calls are checkable chains
of blocks; custom moves are the *same* mechanism, evaluated by the same F/V rules.
Dosado decomposed beautifully: `pass(forward,right) · slide(right) ·
pass(backward,left) · slide(left)` — 2+1+2+1 = the chart's 6 beats exactly, and
Left Dosado/See Saw falls out as the mirror transform of the chain instead of
separate authoring. Two blocks specced (`pass`, `slide`); the slide's lateral exit
vector turns out to be precisely what flow rule F6 watches, so block-level flow
checking already has its first concrete case.

Planning gained two future chunks in the work effort: the custom-move workshop,
and the social layer (sharing/review of moves, sequences, and tips — tip = patter
+ singing call). And the database question got asked and answered: **not yet** —
engine stays pure, the workshop is client-side files under the template's storage
default, and the social layer is the named trigger for the backend deliberation.
The one thing we owe *now* is versioned plain-data serialization, which ADR-0002
already forces.

Next: Ryan reviews the block layer; then the other eight calls, blocks-first.
