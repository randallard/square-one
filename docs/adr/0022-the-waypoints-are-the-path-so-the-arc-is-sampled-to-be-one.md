# ADR-0022: The waypoints are the path, so an arc is sampled fine enough to be one
- Status: Accepted
- Date: 2026-08-21
- Deciders: Ryan, Claude

## Context

Ryan, on the first scene where a Partner Trade was passed its bodies' clearance:

> I looked at `#dance=two-trades` and it's still too tight — if we're generalizing correctly it
> should be like `#dance=two-twirls`

Half of that was a consumer that had never passed the number (the-lot's ADR-0031). The other half
was here, and it had been here since `orbit` was written.

[ADR-0016](0016-a-couple-carries-the-clearance-its-bodies-need.md) solves the beau's bow so the
couple's **minimum separation over the whole call** is the room their bodies need, and
[ADR-0018](0018-the-arch-needs-a-hands-room-between-two-heads.md) hardened that from arithmetic
into a bisection because the pass is not always the closest moment. Both of them measure the
analytic arc: `r(t) = radius + lane·sin²(πt)`, evaluated at 257 points.

**Nobody walks that arc.** `orbit` emitted a waypoint every eighth of a turn — 45° — and
`sampleMotion` runs a **straight line** between consecutive marks. A chord across 45° of arc sags
`r(1 − cos 22.5°)` inside the curve, which is 7.6% of the radius. So the solver put the *curve* on
the wanted number and handed the dancers a polygon inscribed in it.

Measured on townage's shipped cast, a Trade solved to exactly the 0.710 world units its heads want:

| measured at | separation |
|---|---|
| the waypoints | 0.710 — the number solved for |
| **along the path walked between them** | **0.670** |

5.6% short, out of a figure that had been checked, bisected, and pinned. And invisible to every
instrument in the repo, because they all pair the two dancers up **at their shared waypoint
beats** — the sag lives strictly between the marks those checks are built from.

[ADR-0007](0007-stepper-primary-ideal-paths-derived.md) already settled whose fact this is: the
performance stepper is the primary interface and path data is derived from it. If the stepper is
the truth, the waypoints are the figure, and their spacing is not a rendering detail.

## Decision

**`orbit` and `step-pivot` emit a waypoint every forty-eighth of a turn — 7.5° — and the solvers
keep measuring the arc.**

At 7.5° the chord sags `3.4e-4 × r`, which is below `round`'s own sixth decimal for any radius
this engine uses. The polyline **is** the arc as far as anything downstream can tell, so the
existing analytic reasoning becomes true of the danced figure instead of merely near it.

`step-pivot` moves linearly in the beat and has no sag of its own; it is refined to the same
density anyway, because the instrument that asks *how close did these two get?* pairs the dancers
by beat, and marks the two halves of a couple do not share are marks the measurement cannot see.

Chosen so that **whole beats stay on sample boundaries**: a full turn is 8 beats, so a
forty-eighth of a turn is a sixth of a beat and every integer beat is still a mark — which the
ADR-0009 spec fixtures need, since they look their rows up by exact beat. The marks are built as
`k / n` rather than by accumulating `+= SAMPLE_TURNS`, because 24 accumulated forty-eighths do not
land on a half.

## Alternatives considered

- **Solve the bow against the chords instead.** Tried first, and it is the wrong fix even though
  it is the more obviously "honest" one. It makes the bow compensate for a sampling artifact:
  the beau swings wider than the figure needs, to hide a polygon. Worse, it fires on the
  **body-agnostic couple** — whose default clearance is exactly the arc's own radius, a number the
  chords miss by the sag — so a pair who asked for nothing would acquire a bow. It broke five
  tests that assert precisely that they do not, and each of those tests was right.
- **Interpolate the waypoints with a spline in the stepper.** It would fix the sag for consumers
  and it moves the definition of the path from data into an algorithm every consumer must match.
  A polyline is portable; a spline is a contract. ADR-0006's simulated dancers will deviate from
  the ideal path anyway, and they should deviate from something stated plainly.
- **Leave it and tighten the clearance numbers to compensate.** A consumer-side fudge for an
  engine-side defect, and it would have to be re-derived for every sampling change.
- **Refine `arm-turn` to match.** It samples every quarter turn and has the same sag. Deliberately
  not touched: it is render-validated (2026-07-27) and this family's standing rule is not to
  disturb validated geometry to satisfy a tidier decomposition. Nothing solves a clearance against
  it today. When something does, this decision applies to it.

## Consequences

- **The clearances are now delivered to the dancers, not to the waypoints.** On the shipped cast a
  Trade goes 0.670 → **0.709** against 0.710 wanted, and the head overlap pinned in the-lot since
  ADR-0014 is closed.
- 🔴 **A residual remains, and it is bounded rather than eliminated.** The polyline is inside the
  arc by *something* at any finite sampling; it scales with the bowed radius, so a heavy bow is
  the worst case — 0.32% on the-lot's widest test cast. The guard tests assert "within half a
  percent" rather than "at least", because a test claiming strict clearance would be a test tuned
  to a sampling constant.
- **Motions carry five times the waypoints on a rotating block** — 25 marks for a half turn
  instead of 5. `sampleMotion` scans them linearly per dancer per frame; at these sizes that is
  not a cost worth trading fidelity for.
- 🔴 **The lesson is about instruments, not arcs.** Every check in this repo paired the dancers at
  their shared waypoint beats, so every check was blind in exactly the same place — and adding
  more of them would not have helped. The new guard samples `sampleMotion`, which is what a
  consumer runs. **Measure with the thing the consumer uses.** That is the fourth member of this
  month's family, after *is the renderer drawing what I measured?* (08-17), *is the instrument
  reporting a fact or re-deriving it?* (08-18), and *is the thing I measured the thing that will
  be watched?* (08-19).
- **Promotion condition:** if a consumer ever interpolates these waypoints with anything other
  than straight lines, the sag bound above stops being the right one and this needs revisiting.
