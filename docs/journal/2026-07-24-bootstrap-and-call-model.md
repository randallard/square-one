# 2026-07-24 — bootstrap, and what a call actually is

_Documents commit `62c2f8c`._

Created square-one from the template today (public, like the-lot and squaredance).
This is the engine library decided in `work/square-dance-planning/` ADR-0003/0004:
pure square-dance logic, paths as data, consumed by the-lot (townage) and
hash-n-patter (caller drills).

The real work was answering Ryan's question: *paths aren't the whole story — what are
all the aspects we need to track to evaluate sequences of calls?* Went digging through
caller theory and prior art. The big find is that callers already have a state model —
**FASR** (Formation, Arrangement, Sequence, Relationship) — and both module calling
and sight resolution are defined entirely in terms of it. Six arrangements per
symmetric formation, four sequence states, four relationships; modules classify as
zeros / equivalents / get-ins / get-outs over FASR, which maps straight onto the arc's
"get-ins and get-outs" games.

Second find: momentum is state. "…and Roll" needs each dancer's rotational direction
from the *previous* call (some dancers can roll while others can't, off the same
call); "…and Sweep a Quarter" needs couple-level circling direction; smooth calling
needs the body-flow vector and last-hand-used to score awkward transitions. Taminations
tracks `hands` per movement and derives roll from the path — good precedent for
deriving momentum from our ADR-0004 waypoints instead of hand-annotating it. (Taminations
is AGPL — model reference only, no data vendoring. Our own moves.md from
mix-a-hoot-n-hollar is the data seed.)

Third: CALLERLAB's own definition format (starting formation / dance action / ending
formation / timing / styling) plus their **Standard vs Extended applications** docs —
the latter is a ready-made difficulty axis for the drill games and NPC skill levels.

Wrote it all up as a four-layer model in `docs/spec/call-model.md` (dancer / square /
call record / sequence evaluation), with the property-test targets each layer yields.
Left four open questions for Ryan, the biggest being Lark/Robin vs boy/girl as the
modeled role.

Bootstrap housekeeping: ADR-0001 (TS, provable-lite — promotion condition: geometry
kernel to Rust+kani if fast-check can't carry the collision invariant), ADR-0002 (pure
library, no storage — a recorded deviation from the template's app-shaped default),
README/PROGRESS made real, `<PROJECT>` placeholders replaced, template remote wired,
new-project skill deleted. No application code — the model review comes first.
