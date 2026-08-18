# ADR-0014: The belle's half of a Partner Trade is a step and a pivot, not a semicircle
- Status: Accepted
- Date: 2026-08-18
- Deciders: Ryan, Claude

## Context

Ryan, watching a Partner Trade render for the third time:

> really the belle should not move forward hardly at all in this, since that makes the beau have
> to move even farther out to get around - for the belle this is really a step left and pivot 180

The call was two dancers walking the **same circle** in opposite senses — radius
`COUPLE_WIDTH / 2` about the couple's centre, both arcs through the front — separated only by
[ADR-0013](0013-the-trade-lane-rides-inside-the-arc.md)'s lane bowing them apart at the pass.
The spec called that *"a pleasing check on the reading: a Trade really is one figure danced two
ways round."*

**The symmetry was the defect.** Two arcs through the same front, at a formation whose width is
set by a handhold, leaves nothing between the dancers: the lane separated them by
`2 × COUPLE_WIDTH × LANE_OFFSET`, which is **0.3 of the couple's width**. Rendered at townage's
default cast that is 0.34 world units between two torsos needing 0.52. The Trade's pass has been
a standing collision since the couple stopped being a unit wide, and it survived because the
engine's own collision invariant is "no shared coordinate" — dancers there are points, and two
points 0.1 apart pass the test.

Ryan's reading dissolves it. If the belle does not go round at all — if she steps across and
turns on the spot — then the beau is not passing someone coming the other way round his own
circle. He is walking round someone standing in the middle of it.

**The source supports him, and had already said so.** CALLERLAB's general **Trade** definition is
"two adjacent dancers exchange places by walking forward in a semicircle, passing right
shoulders", and this spec has been reading Partner Trade as that figure with the pair being a
couple. But the *Choreographic Guidelines* observe that Partner Trade "violates the smooth flow
of the belle (right hand) dancer" — which the spec recorded on 2026-08-15 as a curiosity to keep
in view. A dancer whose flow the figure violates is a dancer who is not walking a smooth forward
semicircle. The general definition describes the figure; danced by a couple at handholding
distance, the belle's half degenerates into a step and a pivot, and that is what the flow note is
reporting from the floor.

## Decision

**The two dancers of a Partner Trade walk genuinely different figures. The beau walks one forward
semicircle on the circle the couple is standing on, with no lane. The belle steps a whole
couple-width to her left and pivots 180° through the step, going nowhere forward.**

- The beau: `orbit(right, 0.5, width / 2)` — the same arc as before, minus the bow.
- The belle: `step-pivot(left, width, left, 0.5)` — a new block, `step-pivot`, because no
  existing one translates laterally *while* turning. `slide` is "sidestep laterally **without**
  turning", one beat, one fixed distance.
- `step-pivot` is timed by its **rotation** — the catalog's shared 8 beats per turn, of which a
  half is 4, a Partner Trade entire — and not by its distance. That is the trap `slide` fell into
  and had a `distance` parameter removed for; its spec left the standing instruction *"design the
  parameter and its timing together"*. The distance rides inside the rotation's budget the way
  ADR-0013's lane rides inside an arc.
- `TRADE_LANE`, `TRADE_RADIUS_OUT` and `TRADE_RADIUS_IN` are **deleted** with the lane they
  described. `TRADE_PASS_SEPARATION` replaces them and is `width / 2`.

**And the sway invariant is restated rather than dropped.** The 2026-08-16 render watch produced
*every step has a forward component*, because two beats of pure lateral translation read on screen
as a standing couple swaying. That was the right cure and it named the wrong cause: what makes
sway read as sway is the **absence of turning**, not the presence of sideways travel. The test now
says *a step with no forward component comes with a turn*, and the strong form is kept in a
separate test confined to the beau, so the restatement is not a licence.

## Alternatives considered

- **Keep both semicircles and widen the lane** until the bodies clear. The lane would have to
  grow past the couple's own radius, at which point both dancers are walking a circle that is not
  the one they are standing on, for a figure the source describes as walking their own. It also
  keeps the belle travelling forward, which is the thing Ryan identified as forcing the beau out.
- **A rigid 180° rotation of the couple about its centre.** Correction 1 in the spec rejected this
  in 2026-08-15 and it stays rejected: it makes both dancers' facings non-tangent to their paths,
  so one of them walks sideways or backwards for most of it. What Ryan describes is *only* the
  belle doing that, and she does it while pivoting, which is a different motion.
- **Give `slide` a distance and a rotation.** That is `step-pivot` wearing `slide`'s name, and it
  would make "sidestep laterally without turning" false of the block called `slide`.
- **Leave the collision and let the consumer widen the square.** townage already scales the frame
  to the bodies; it cannot scale the *figure*, because the pass separation is a fixed fraction of
  the couple's width whatever the scale. Widening the square widens both together.

## Consequences

- **The pass separation goes from 0.3 of the couple's width to 0.5 of it**, and comes from the
  shape of the figure rather than from a proportion borrowed off a facing pair's lane. Measured in
  townage on the shipped cast, the closest approach over two Trades goes **0.34 → 0.55** world
  units against two torsos needing 0.52. The collision Ryan reported is gone.
- 🔴 **It is not enough for the heads, and that is now a measured, pinned gap.** ADR-0012's
  height-aware `lateralClearance` counts heads, and Myco's head is 0.49 where his torso is 0.30:
  it wants **0.71** and the pass gives 0.55. On the size-extreme casts the pass does not clear
  even the torsos — `mixed` stands 1.070 apart and passes at 0.535 against 0.700. **A Trade's pass
  separation is half the couple's width, and the couple's width is set by a handhold**, so the
  wider the bodies the worse the pass is relative to them. Fixing that means the beau's arc leaving
  the circle the couple stands on — the "even farther out" Ryan was pushing back on — and it is a
  decision about the figure rather than a number to tune. Pinned by tests in townage
  (`dance-performance.test.ts`) so it cannot be forgotten and fails loudly when it is fixed.
- **The two chains no longer have the same shape**, and the test that admired that symmetry now
  asserts the opposite. `positionDependent` is doing more work than it was: not "the same figure
  mirrored" but two different figures.
- **`orbit`'s `lane` loses its only consumer.** It survives as a block capability with its own
  spec and tests, for the wider Trade family — Boys Trade, Ends Trade — whose dancers are a full
  unit apart and for whom the symmetric reading of the figure is the right one. If none of those
  arrive, it is a candidate for deletion.
- **Third correction to this call, all three found by looking at it.** The spec now records that
  explicitly. Every one of the three readings was internally consistent and had tests agreeing
  with it.
- **Promotion condition:** this is Partner Trade, danced by a **couple**. If the Trade family is
  generalised to two adjacent dancers who are not a couple — where there is room for two forward
  semicircles and a lane between them — that call is the symmetric figure and this decision does
  not extend to it.
