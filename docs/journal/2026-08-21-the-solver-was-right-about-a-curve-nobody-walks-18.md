# 2026-08-21 — the solver was right about a curve nobody walks

_Documents [ADR-0022](../adr/0022-the-waypoints-are-the-path-so-the-arc-is-sampled-to-be-one.md),
landed in `8d436cd` the same day as [entry 17](2026-08-21-every-call-takes-a-body-17.md)'s
generalisation, and found by watching it._

Entry 17 opened the seam for every call and switched nothing on. Ryan switched one on by looking
at it:

> I looked at `#dance=two-trades` and it's still too tight — if we're generalizing correctly it
> should be like `#dance=two-twirls`

He is looking at two figures that walk the **same two paths**. ADR-0017 established that a
California Twirl *is* a Partner Trade with the inside hands joined and raised. One of them bowed
and one did not, which is not a difference either figure has — the consumer was passing the arch
clearance and withholding the hands-free one (the-lot's ADR-0031).

That was half of it. Passing the number took the Trade from 0.554 to 0.670 world units against the
0.710 its heads want. **Still short**, and the shortfall turned out to be older than any of the
couple work.

## The arc and the path are not the same shape

`laneForClearance` bisects the beau's bow so the couple's minimum separation over the whole call
is the room their bodies need. It evaluates `r(t) = radius + lane·sin²(πt)` at 257 points — the
analytic arc.

`orbit` emitted a waypoint every eighth of a turn. `sampleMotion` runs a **straight line** between
consecutive marks. So the dancers walk a 45°-chorded polygon inscribed in that arc, and a chord
across 45° sags `r(1 − cos 22.5°)` — **7.6% of the radius** — inside it.

Measured on the shipped cast, for a Trade solved to exactly 0.710:

| measured at | separation |
|---|---|
| the waypoints | 0.710 |
| along the path walked between them | **0.670** |

ADR-0018 spent a chunk discovering that the pass is not the closest moment, and hardened the bow
from arithmetic into a bisection over the whole call because a **3%** error was "a hand inside a
head". This is 5.6%, it was underneath that entire investigation, and the bisection could not see
it because the bisection was measuring the wrong curve.

## Every instrument was blind in the same place

That is the part worth keeping. There are three suites that measure this figure and they all pair
the two dancers up **by beat**, at the marks the generators emit. The sag lives strictly *between*
those marks. More checks of that kind — finer sampling of `t`, more casts, more calls — would have
returned the same wrong number with more confidence.

The check that finds it runs `sampleMotion`: the thing a consumer actually calls. **Measure with
the thing the consumer uses.**

Fourth member of this month's family, and the family keeps being about the same joint from
different sides: 08-17 *is the renderer drawing what I measured?*, 08-18 *is the instrument
reporting a fact or re-deriving it?*, 08-19 *is the thing I measured the thing that will be
watched?*, and now *is the thing I measured the thing that gets walked?*

## The first fix was the obvious one and it was wrong

Solve the bow against the chords. It is exact, it is barely more code, and it makes the solver
measure what it emits — which sounds like the principle rather than a patch.

It broke five tests, and all five were right. The body-agnostic couple's default clearance **is**
the arc's own radius, a number the chords miss by the sag, so chord-solving put a bow on a pair
who had asked for nothing. Worse in principle than in tests: it makes the beau swing wider than
the figure needs, permanently, to conceal a polygon.

The defect was never in the solver. It was that the emitted path was a coarse approximation of the
figure, and everything downstream — including the eye — had been reasoning about the figure. So the
sampling went to 7.5°, where the sag is `3.4e-4 × r` and disappears under `round`'s own sixth
decimal. The polyline *is* the arc now, as far as anything can tell, and every piece of analytic
reasoning built on top of it became true instead of nearly true.

A half turn carries 25 waypoints instead of 5. That is the whole cost.

## Two details that were nearly bugs

**Whole beats had to stay on sample boundaries.** The ADR-0009 fixtures look their rows up by
*exact* beat. A full turn is 8 beats, so a forty-eighth of a turn is a sixth of a beat and every
integer beat is still a mark. Picking a density that did not divide would have silently dropped
every documented waypoint.

**And the marks are built as `k / n`, not by accumulating `+= SAMPLE_TURNS`.** Twenty-four
accumulated forty-eighths do not land on a half. The old code accumulated and got away with it at
eighths.

**`step-pivot` was refined to match even though it has no sag of its own** — she moves linearly in
the beat, so a chord between her marks *is* her path. What she needed was the **beat alignment**:
the instrument that asks how close the two got pairs them by beat, and leaving her at 45° would
have quietly cut it to five samples per call. A fidelity fix that blinds the check on it is not a
fix.

`arm-turn` still samples every quarter turn and has the same sag. Left alone deliberately: it is
render-validated, nothing solves a clearance against it, and this family's rule is not to disturb
validated geometry for a tidier decomposition.

## Where it landed

The Trade delivers **0.709** against 0.710 wanted. A residual remains — the polyline is inside the
arc by *something* at any finite sampling, up to 0.32% at the heaviest bow the-lot tests — and it
is asserted as a bound rather than as strict clearance, because a test claiming the latter would
be a test tuned to a sampling constant.

And the Trade bows **less** than the Twirl, which is the answer to what Ryan was really asking.
Same two bodies; the Twirl has a joined hand up between two heads and the Trade does not. The
beau's path over four beats: 1.789 world with no bodies, 2.033 for a Trade, 3.387 for a Twirl.
