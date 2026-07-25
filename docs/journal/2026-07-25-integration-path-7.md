# 2026-07-25 — the stepper is the interface, and specs pause at three

_Documents commit `ac56fdf` (ADR-0007 + the ADR-0005/0006 course change). The
Allemande Left spec and `arm-turn` block it refers to landed just before, in
`490fb2d`. Planning-side narrative in
`~/Development/work/square-dance-planning/journal/2026-07-25.md`._

Planning session about the route from here to actually integrating with townage.
Two things fell out that change this repo.

## The stepper (ADR-0007)

I'd been treating ADR-0004 (paths as data, consumers tween) and ADR-0006 (dancers
pursue those paths with coefficients) as obviously compatible, and for NPC-only
squares they are: the sim is pure and seeded, so you simulate the whole sequence
ahead of time, flatten it to waypoints, hand it over. Consumer stays dumb.

The player is what breaks it. In townage the player is one of the eight, and the
ADR-0006 mechanics I liked most are exactly the ones that read actual positions —
the square frame re-estimates from where dancers really are (so a player drifting
drags the whole frame), target-switching curves from wherever you actually got to,
and the helping model forms a belief about a neighbour's deviation. You cannot
precompute any of that against an input that hasn't been given yet.

So: the stepper is primary. `createPerformance({seed, coefficients, externallyDriven})`
and `tick(dt, inputs)`, where an externally-driven dancer's position is read rather
than simulated. Ideal path data is the same stepper with everything off, flattened.

The bit I like: ADR-0006's anchor invariant ("all off ⇒ ideal paths exactly") stops
being two implementations that have to be kept in agreement and becomes one
implementation degenerating. It's still worth a property test, but it can't quietly
drift apart anymore.

Cost, honestly: the first useful slice of engine is bigger than
"apply a call, get waypoints" would have been, because the degenerate stepper has to
exist before paths can be derived from it. Took that trade because the alternative
puts the API rework right at the arc's payoff moment.

## Specs pause at three (planning ADR-0005)

Six ADRs, four spec docs, three blocks, three calls, no `package.json`. The thing
that decided it was my own note in `dosado.md`: waypoints "provisional until
rendered." Three calls of geometry are queued behind a check that nothing in this
repo can perform. Nine would be worse — every orbit radius and facing convention
compounding on unverified ones.

So the next work here is code: core types, the three blocks as runtime data,
composition, the degenerate stepper, and a real package townage can install (pinned
git dep, planning ADR-0006). R&L Grand and the rest of the Zero Box triple come back
after townage can show me a Dosado.

Slightly uncomfortable — the talk-first cadence was working and produced good spec.
But it was producing spec faster than it could be checked, and that's the failure
mode worth interrupting.

## Note for whoever writes the townage adapter

`arm-turn.md` already claims it: "townage's second taught gesture: the NPC-taught
arm turn **is** this block." The first integration milestone is on the arc's
critical path, not a demo. The awkward part will be that choreography wants to own
transform + facing while townage's emote system owns pose, and `arm-turn` carries
grip semantics that have to reach into both.
