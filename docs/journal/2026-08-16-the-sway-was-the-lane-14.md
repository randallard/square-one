# 2026-08-16 — the sway was the lane, and the lane was never worth two beats

_Documents `4f80a57`._

Ryan, watching `#dance=two-trades` in townage:

> taking a look at partner trade 2X and I'm wondering about the sway when just standing — it
> seems 2x too wide and 2X too slow

## There is no sway

That was the first thing to establish, and it took some hunting. Nothing in townage's dance
path has an idle animation — no breathing, no weight shift, no clock-driven oscillation
anywhere between `DanceFloor`, `Dancer` and the expression channels. The word "sway" does not
appear in either repo.

So whatever he was watching, **the engine was emitting it on purpose**. Dumping the composed
motion through the real stepper found it immediately, at beats 5 → 7 of the figure:

```
beat  ax      af    bx       bf
5.00   0.217  270  -0.117   270
6.00   0.167  270  -0.167   270
7.00   0.217  270  -0.117   270
```

Facing constant, `y` constant, separation constant. The whole couple translating sideways and
back, twice per loop of the figure, one full second of it at 120 bpm. Nobody turning, nobody
advancing — which is what a standing couple swaying looks like, because it is what a standing
couple swaying *is*.

It was the Trade's own lane steps: the closing `slide(right)` of the first Trade running
straight into the opening `slide(left)` of the second. Two beats of the six, spent on getting
onto a lane and off it.

## Both halves of "2x too wide and 2X too slow" turned out to be one thing

Worth writing down because it is a nice piece of seeing. Halving a distance *and* halving the
time it takes leaves the speed unchanged — so his two observations were not two complaints
about a sidestep, they were one complaint that the sidestep exists at all and is being padded
out to fill a beat it did not need.

The "too slow" half was not even a matter of taste. `slide` charges a **flat** beat regardless
of distance. Dosado's slide covers 0.30 engine units in that beat; the Trade's half-lane
covers 0.05. The Trade's sidestep was moving at **one sixth the speed of every other slide in
the catalog**, and the number that made that happen was a `distance` parameter added for this
call without anyone looking at `BEATS`.

## Then the sources said the beats were never ours to spend

This is the part I did not expect. Going back to `reference/callerlab/` to see what a lane
should look like turned up something about the timing instead.

| Source | Says |
|---|---|
| Basic Program Definitions §35.b | `Timing: 4` |
| Basic & Mainstream timing chart, rev. 2023-02-15 | `Trade … Partner Trade: 4` |
| Our spec | **6** |

Our 6 came from reading the chart's 4 as the *rotation's* budget and adding a beat at each end
for the lane — on the analogy of how `arm-turn` counts "from point of contact". The chart's own
preamble is what breaks that analogy: beats are added only when it takes some to *reach*
contact. `arm-turn` genuinely has an approach. **A couple is already in contact** — they are
standing hand in hand, which is precisely why §35.b's styling note is about *releasing* a
handhold. Nothing to add.

Two more things fell out of the same half hour with the PDFs:

- **The Passing Rule** (General, p.7): dancers whose paths coincide pass right shoulders *and
  continue*. Continue. Not step aside and resume.
- **The styling note** gives the call's real opening gesture: swing the joined hands backward
  slightly as you release them, *"This gets them turning in the correct direction as they start
  moving forward."* Rotational, not lateral — and renderable now that a couple stands with
  inside hands joined. The sidestep had been standing in for a gesture that was in the source
  all along.

And the *Choreographic Guidelines* (ch. 3) note that a Partner Trade "violates the smooth flow
of the belle (right hand) dancer" — independent confirmation, from dancing rather than from
geometry, of yesterday's correction 2. Pleasing to find our own reasoning already in the
literature as a complaint.

## The fix is one word in yesterday's proof

Yesterday's argument for the slides is correct and I re-read it several times looking for the
flaw:

> For a circular arc from a dancer's standing spot to their partner's, the centre must lie on
> the perpendicular bisector … the only such arc that is a semicircle has its centre at the
> couple's own centre and radius `0.5`. **For both dancers.** Which is the collision.

The flaw is not in it. It is in the sentence after it. "No single **constant-radius** arc both
lands on the standing spots and separates the dancers" is true; "and so the lane has to be its
own motion" does not follow. A *varying* radius does both. `orbit` now takes a `lane` that bows
the radius along the arc — zero at the ends, peaking at the middle — and Partner Trade is one
block per dancer again, at the chart's 4 beats.

The profile is `sin²`, and I picked it for its derivative rather than its shape: flat at both
ends means the bow adds no sideways velocity where blocks hand over, so entry and exit facings
stay exactly tangential; flat at the peak means the two pass exactly shoulder to shoulder. A
triangle or a plain sine is zero at the ends but still *moving*, and would have tilted the
entry facing of every bowed arc — trading a visible defect for a subtle one.

Facing is now solved from the velocity rather than taken as `angle ± 90`, because with a bow
those differ by up to about 19° for the belle and 15° for the beau — the crab is bigger on the
smaller radius, because the same bow speed is a larger share of a slower tangential one. A
dancer swinging outward is travelling outward as well as
round, and walking forward means facing where you are actually going. Taking the circle's
tangent would have left them crabbing sideways for half the call — the same defect as the
slides, in a form that would have been much harder to see.

## Two small things the change turned up

**An exit facing of 360.** `round(normaliseDeg(x))` is the wrong order when `x` lands a float's
breath below a cardinal, which a bowed arc's closing facing does — `Math.sin(2π)` is −2.4e-16,
not 0. Normalising first sent it to 359.999…, which `round` then reported as `360`, outside
`normaliseDeg`'s own `[0, 360)` contract and differing from the lane-free exit by a whole turn.
Now rounded first. Caught by the test asserting the two facings are equal, which I had written
expecting it to pass on the first run.

**Three rows that cannot be fixtures.** A bowed arc's facings at the quarter marks are not
cardinals, and the spec loader reads cardinals only — so putting numbers there would have been
silently ignored, which this repo rightly treats as worse than no fixture at all. Left out of
the worked-example table with a note saying why, and asserted in `orbit.test.ts` instead. If
the facing column ever learns plain degrees, they fold back in.

## What it cost, and what it did not fix

`slide`'s `distance` parameter is gone. Its only caller was this call and its spec never
documented it — and this block's own spec had **already rejected the same idea once**, on
2026-07-26, when a `span: half` variant was proposed for Dosado's closing step and dropped
because CALLERLAB blends the closing lateral into the walk. Three weeks later the Trade
reintroduced it under a different name and nobody read the precedent that was sitting in the
file. The note there now says: design a distance parameter *and its timing* together, or not at
all.

The equivalence with California Twirl got stronger and its test stopped pinning a defect. Both
calls are 4 beats now, which is what makes the substitution usable — a caller swaps one for the
other inside a phrase. The assertion had read `chartBeats + 2` with the comment "the Trade pays
two beats for its lane."

🔴 **The clearance problem is untouched**, and it lives in the same constant. At townage's
default cast the pass puts the dancers **0.260** world units apart where the frame scale says
they need **0.710**. The bodies interpenetrate, and did before this change too — `TRADE_LANE`
is a proportion of the couple's width with nothing about bodies in it. That wants its own ADR
and probably its own render watch.

## The tally that is getting hard to ignore

Partner Trade has now been corrected twice, and neither time by reading it:

- 2026-08-15, by **composing the blocks** — it is not a rigid rotation, and it is
  position-dependent.
- 2026-08-16, by **rendering it** — the lane is not a motion, and the call is 4 beats.

Both times the previous version read perfectly well. Both times the correction came from
running the thing. Three of the four defects in this call have been in prose that was
internally consistent and externally wrong, which is an argument for the render watch being
part of the spec process rather than a check after it.
