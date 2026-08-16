# ADR-0013: A Trade's passing lane rides inside the arc, not as steps around it

- Status: Accepted
- Date: 2026-08-16
- Deciders: Ryan, Claude

## Context

Partner Trade was built on 2026-08-15 as three blocks per dancer: `slide` onto a passing
lane, `orbit` a half circle, `slide` off it. Six beats — four for the arc, one for each
sidestep.

Ryan watched it render at `#dance=two-trades` and asked about something else entirely:

> *"I'm wondering about the sway when just standing — it seems 2x too wide and 2X too
> slow."*

There is no idle animation anywhere in the dance path. What he was watching was the Trade's
own lane steps: at the join between two Trades the closing `slide(right)` of the first runs
straight into the opening `slide(left)` of the second, and for two beats the couple
translates sideways with facing constant, `y` constant and separation constant. Nobody turns
and nobody advances. On screen that is a standing couple swaying.

Going back to the sources settled it, and settled more than was asked.

**The timing was wrong, in two independent places.** CALLERLAB's Basic Program Definitions
§35.b gives Partner Trade `Timing: 4`; the Basic and Mainstream timing chart (rev.
2023-02-15) gives `Trade … Partner Trade: 4`. Our spec said 6, and derived it by reading the
chart's 4 as the *rotation's* budget and adding a beat at each end for the lane, on the
analogy of how `arm-turn` counts "from point of contact".

That analogy does not transfer, and the reason is the interesting part. The chart's preamble
says timing is measured from point of contact, and that beats spent *reaching* contact are
added. `arm-turn` genuinely has an approach — its dancers step in from `ENTRY_RADIUS` 0.5 to
`ORBIT_RADIUS` 0.3 because forearms have to meet. **A couple is already at the point of
contact**: they are standing hand in hand, which is why §35.b's styling note is about
*releasing* a handhold. There is nothing to add to the 4. The two extra beats were ours.

**And the source never describes a sidestep.** §35.a's dance action is a single continuous
motion — walk forward in a semicircle, pass right shoulders — and the General Passing Rule
says two dancers on the same path pass right shoulders *and continue*. Continue, not step
aside and resume. Sideways travel with no forward component appears nowhere in the
definition, which is exactly what one would expect of a figure whose every description says
*walk forward*.

**This block had already rejected the same idea once.** `slide`'s own spec records a
`span: half` variant proposed and dropped on 2026-07-26, because CALLERLAB blends Dosado's
closing lateral into the walk rather than making it a discrete step. Partner Trade
re-introduced the discrete step three weeks later, as a `distance` parameter, without anyone
noticing the precedent. The parameter also inherited `slide`'s flat one-beat cost, so a
half-lane step took as long as a full lane change and travelled at a sixth the speed — which
is the "2X too slow" half of the observation, and is a defect rather than a matter of taste.

The geometric objection that produced the slides in the first place is still correct, and has
to be answered rather than ignored: for a circular arc from a dancer's spot to their
partner's, the centre must lie on the perpendicular bisector between them, and the only such
arc that is a semicircle has its centre at the couple's centre and one radius — the same
radius for both dancers, which is the collision. **No single *constant-radius* arc both lands
on the standing spots and separates the dancers.**

## Decision

**The lane is a bow in the arc's radius, not blocks around the arc.**

`orbit` gains an optional `lane`: the radius varies along the arc as
`radius + lane × sin²(π × turns / fraction)` — zero at both ends, peaking at the middle,
positive bowing outward. Partner Trade becomes **one** `orbit` per dancer, both walking the
circle the couple already stands on (`COUPLE_WIDTH / 2`, centred on the couple's centre),
the beau bowing out by `TRADE_LANE` and the belle in by the same.

The word "constant-radius" in the objection above is the whole of the escape. A varying
radius lands on the standing spots *and* separates the dancers, because it is the same curve
danced rather than three motions concatenated.

Two properties of `sin²` are load-bearing, and neither is about its shape:

- It is **zero at both ends**, so the dancer leaves and arrives on their own radius. That is
  what makes the lane cost nothing, and therefore what lets Partner Trade be `chartBeats: 4`
  — the chart's number, the whole call.
- It is **flat at both ends and at the peak**. Flat at the ends means the bow adds no
  sideways velocity where blocks hand over, so entry and exit facings stay exactly tangential
  and a chain has no kink at the seam. Flat at the peak means the two dancers pass exactly
  shoulder to shoulder. A triangular or plain-sine profile is zero at the ends but still
  moving, and would tilt the entry facing of every bowed arc.

Facing is solved from the **velocity** rather than taken as `angle ± 90`, because with a bow
those differ: a dancer swinging outward is travelling outward as well as round, and walking
forward means facing where they are actually going.

## Alternatives considered

**Keep the slides, halve their distance and their duration** — the literal reading of "2x too
wide and 2X too slow". Rejected on three counts. It cannot reach 4 beats without inventing
somewhere for the freed beat to go; halving the lane also halves the shoulder clearance,
because the sidestep distance and the arc separation are the same number; and it would leave
pure lateral motion in the call, only less of it. The observation was right and the
prescription would have made a smaller ugly thing.

**A new block for the bowed arc**, following the precedent that produced `orbit` itself
("go with cleaner"). Rejected because the two cases are not alike. `arm-turn` and `orbit`
differ in frame, in entry facing and in whether a hand is engaged; a bowed arc differs from
`orbit` in one term of the radius. A separate block would duplicate the angle, facing and
sampling machinery to vary one expression, and would leave two blocks that must be kept
saying the same thing about what an orbit is.

**Blend the lane into the arc by moving the pivot** rather than the radius — an off-centre
circle, which also separates two dancers. Rejected: it does not land both of them back on
their standing spots, and it makes the pass asymmetric in a way the definition does not ask
for. The bow keeps the couple's centre as the couple's centre, which is what every other part
of the model assumes.

**Leave the timing at 6 and only fix the shape.** Rejected: the 6 has no source and two
sources contradict it. Keeping it would also keep Partner Trade and California Twirl at
different lengths, which quietly breaks the equivalence between them — a caller substitutes
one for the other inside a phrase.

## Consequences

- **Partner Trade is 4 beats and one block per dancer.** `TRADE_RADIUS_OUT` and
  `TRADE_RADIUS_IN` survive with their values unchanged but a different meaning: they are the
  radius each dancer reaches *at the pass*, not the radius they walk. The clearance at the
  crossing is untouched at `2 × TRADE_LANE`.
- **The Trade ≡ Twirl equivalence gets stronger, and its test stops pinning a defect.**
  Both calls are now 4 beats, which is what makes the substitution usable in a phrase. The
  assertion in `test/california-twirl.test.ts` read `chartBeats + 2` with the comment "the
  Trade pays two beats for its lane"; it is now an equality.
- 🔴 **`slide`'s `distance` parameter is removed.** Its only caller was the Trade, its spec
  never documented it, and it carried a flat one-beat cost that made every distance but the
  full lane change wrong. If the Dodge family needs partial slides, design the parameter *and
  its timing* together — the omission of the second half is what went wrong here.
- **`orbit`'s facings for a bowed arc are not cardinals**, so two rows of its worked example
  cannot be conformance fixtures under the current loader (`SpecRow.facing` reads cardinals
  only) and are asserted in `test/orbit.test.ts` instead. Recorded rather than worked around:
  a facing column that accepted plain degrees would fold them back in.
- **The lane is off by default and `lane: 0` is bit-identical to the previous code path**, so
  no existing call, spec fixture or the `arm-turn` equivalence moved. That is asserted, not
  assumed.
- 🔴 **This does not fix the clearance problem, which lives in the same constant.** At
  townage's default cast the pass puts the dancers 0.260 world units apart where the frame
  scale says they need 0.710 — the bodies interpenetrate, and did before this ADR too.
  `TRADE_LANE` is calibrated as a proportion of the couple's width with nothing about bodies
  in it. That is a separate decision and wants its own ADR.
- **Promotion condition.** The bow is a two-dancer answer: it separates a pair walking one
  circle in opposite senses. If a call needs three or more dancers to pass on one arc, or a
  pass that is not symmetric about the arc's midpoint, this parameter is the wrong shape and
  the right move is a new decision rather than more parameters on `orbit`.
