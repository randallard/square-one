# ADR-0007: The performance stepper is the primary interface; path data is derived from it
- Status: Accepted
- Date: 2026-07-25
- Deciders: Ryan, Claude

## Context

The planning effort's ADR-0004 settled the seam as **paths as pure data**: apply a
call, get per-dancer waypoints with beat timing, and consumers only scale and
tween. [ADR-0006](0006-two-layer-choreography.md) then added the performance layer
— simulated dancers *pursuing* those ideal paths with per-dancer coefficients, lag,
corner-cutting, helping, and square-frame drift.

Those two look compatible, and for NPC-only squares they are. The performance
layer is pure and deterministic under an injected seed, so a whole sequence can be
simulated ahead of time and flattened into exactly the waypoint data ADR-0004
describes. The consumer still just tweens. Nothing breaks.

**The player breaks it.** In townage the player is one of the dancers, and the
player is not deterministic. ADR-0006's mechanics are specifically the ones that
react to where dancers actually are: the square frame is re-estimated from actual
positions each tick, so a wandering player drags the whole frame; target-switching
rounds corners from wherever a dancer really is; the helping model forms beliefs
about a neighbour's deviation and intervenes. None of that can be precomputed
against an input that hasn't happened yet. The moment the player joins the square,
"emit the whole performance as data up front" stops being available.

This is not a defect in ADR-0004 — it's a case ADR-0004 predated. What it forces is
a decision about which interface is the real one and which is the convenience.

## Decision

The **stepper** is square-one's primary performance interface: a pure, seeded
simulation advanced by the consumer, in which any dancer may be marked
**externally driven** — the engine reads that dancer's position and facing as input
each tick instead of simulating them.

Ideal-path data (ADR-0004's shape) is **derived**: it is what the stepper produces
with every coefficient off and no externally-driven dancers, flattened over the
sequence. It remains the published, property-tested artifact for NPC-only scenes,
cutscenes, and hash-n-patter drills.

Sketch:

```
const perf = createPerformance({ seed, coefficients, externallyDriven: ["b1"] });
perf.tick(dt, { b1: { x, y, facing } })  → DancerState[]   // player in the square
paths(sequence, formation)               → PathData        // = all-off stepper, flattened
```

## Alternatives considered

- **Paths only, defer the stepper** — rejected: it makes the townage adapter's API
  the wrong shape, and the rework lands exactly at the arc's payoff chunk (the
  player dancing in a square), which is the worst time to be reshaping the seam.
- **Two independent implementations** (a path emitter and a separate simulator) —
  rejected: two sources of truth for how a call looks, and the anchor invariant
  from ADR-0006 (all-off ⇒ ideal) becomes a coincidence to be maintained rather
  than a consequence of the construction.
- **Put the stepper in the consumers** — rejected: it's the ADR-0004 mistake
  repeated a layer up. townage and hash-n-patter would each reimplement pursuit,
  and squares would drift differently in each game.

## Consequences

- The anchor invariant is now *structural*: all-off ⇒ ideal paths isn't a test of
  two code paths agreeing, it's a test that one code path degenerates correctly.
  Still property-tested, but it can no longer silently diverge.
- ADR-0002 (pure library, no IO) holds — the stepper is a pure function of
  `(state, dt, inputs)`; the consumer owns the clock. The engine still never reads
  a timer or touches storage.
- The consumer takes on more: it must drive `tick`, feed player state in, and
  render from returned dancer states rather than tweening a static array. The
  townage choreography adapter is specified against the stepper from the start.
- Path data stays first-class and is what property tests, published test vectors,
  and the flow/variety analysis in [`../spec/flow-and-variety.md`](../spec/flow-and-variety.md)
  operate on — none of that work is invalidated.
- Cost: the first working engine slice is larger than "apply a call, get waypoints"
  would have been, because the degenerate stepper has to exist for paths to be
  derivable from it.
- **Promotion condition:** if the externally-driven-dancer case turns out never to
  be needed outside townage — i.e. hash-n-patter's drills are all NPC-only — the
  stepper could be demoted to an optional module rather than the primary interface.
