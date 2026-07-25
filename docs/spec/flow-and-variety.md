# Flow & variety evaluation

_Status: draft (2026-07-24), companion to [`call-model.md`](call-model.md) Layer 4.
Sources: the CALLERLAB **Choreographic Guidelines** (Choreographic Applications
Committee, 1996 rev. 2004 — local copy in `reference/callerlab/`), the
challengedance.org flow rules, and the CALLERLAB Teaching Resource's per-call
Analyze pages._

The goal Ryan set: evaluate not just **good flow** through a sequence but also
**variety** — dancers shouldn't grind in one direction all night, and the sequence
should mix movement, formations, and attention while staying smooth. The caller
literature treats these as two named values in tension, and CALLERLAB says so
outright: *variety, interest, and challenge are of equal importance to smoothness,
and a deliberate smoothness violation can be the point.* So the engine reports both
axes and never collapses them into one number.

CALLERLAB's definition of smooth dancing — the thing the flow axis measures:
dance action that lets dancers move comfortably, **without abrupt changes of
direction or excessive stops, with steps matching the beat of the music**.

## Flow rules (per-transition, computable)

Everything below is derivable from data the engine already tracks (ADR-0004
waypoints + facing + hands, per-dancer roll/sweep/flow state) — no new authored
data, only bookkeeping.

| # | Rule | Source | Computation |
|---|---|---|---|
| F1 | **Transition continuity** — the best transition puts each dancer's ending position/facing exactly where the next call begins; sideways shuffling to get there is a defect (worked example: `Square Thru 3/4 → Centers In` needs a full-body sideways adjustment) | Choreo. Guidelines ch. 2 | Compare end-of-call pose to next call's canonical start; penalty scales with adjustment distance and lateral component |
| F2 | **Hand availability** — the hand needed next must be *available* at the completion of the preceding action. This **supersedes naive hand-alternation**: CALLERLAB explicitly re-evaluated the old "alternate hands" rule (Star Thru → R&L Thru is smooth; the reverse order is not; Touch 1/4 → Scoot Back uses the right hand three times and is smooth because body position offsets it) | Choreo. Guidelines ch. 2 | Track last-hand-engaged + release state per dancer; check next call's first-hand requirement against it *and* body offset |
| F3 | **Momentum / rotation continuity** — don't reverse a dancer's rotation direction abruptly; the smaller the point of rotation, the worse the reversal (¼ right then ¼ left in place = worst case) | challengedance rule 4; Guidelines kinesiology | Compare end-of-call angular velocity sign to next call's start; weight by rotation radius from the waypoints |
| F4 | **Overflow** — more than **3/4 turn (270°)** of same-direction rotation across a flowing stretch risks disorientation. Worked example: `Heads Lead Right, Veer Left, Couples Circulate, Wheel and Deal, Veer Left, Couples Circulate` = **540°** for the heads | Choreo. Guidelines ch. 2 | Accumulate signed rotation per dancer across transitions that F3 judges "flowing"; flag past 270° |
| F5 | **Sharp turns** — ≥90° of facing change within one or two steps requires strong turning force; less smooth than gradual | Choreo. Guidelines kinesiology | Facing delta per beat from waypoint facing data |
| F6 | **Lateral-motion rule** — a dancer moving laterally (e.g. the dodger in Walk and Dodge) must not receive a call moving them opposite to that lateral motion | challengedance rule 2 | Compare end-of-call velocity vector to next call's initial velocity vector |
| F7 | **Stops and stacking** — excessive stops break smoothness; "stacking" (next command before the previous action completes) clips timing | Guidelines chs. 2 | Sequence beat accounting vs. execution times from the timing charts |

## Variety rules (per-sequence, computable)

The axis Ryan asked about — good variety of movement while maintaining flow:

| # | Rule | Source | Computation |
|---|---|---|---|
| V1 | **Direction balance** — "no dancer should travel continuously in one direction (CW or CCW)," independent of rotation point | challengedance rule 3 | Per-dancer net signed travel/rotation over a window; score balance. (Note the tension with F4: fixing overflow by *reversing* violates F3 — good sequences interleave, not oscillate) |
| V2 | **Point-of-rotation variety** — "the point of rotation must be different on every call for every dancer" | challengedance rule 1 | Classify each call's rotation center per dancer (self, pair, box, center of set…) from waypoints; penalize consecutive repeats |
| V3 | **Formation-shape variety** — "change the shape of the overall formation as frequently as possible" | challengedance rule 5 | Count distinct formations visited / dwell time per formation over the sequence |
| V4 | **Focus-of-attention variety** — move the working unit around: wave ↔ box ↔ all 8 ↔ 2 dancers | challengedance rule 6 | Track the active-unit size/type per call; score the distribution |
| V5 | **Activity balance** — no one stands idle too long, and no one bears all the motion (the 540° overflow example is *also* an imbalance: heads spin 540° while side men "run to keep up") | Guidelines chs. 2, 6 | Per-dancer distance/rotation/idle-beats totals; compare across the eight dancers |
| V6 | **Hand balance** — right-hand work dominates by default; occasional left-hand material is variety (but see F2 — availability governs comfort) | Analyze pages; caller practice | Tally hand engagements per dancer over the window |

## Timing model (the delivery half of flow)

Flow isn't only *what* is called but *when*. The Guidelines quantify it — and this
is a drill-game goldmine for hash-n-patter (calling on the right beat is a skill):

- **Command time** ≤ 2 beats to say the call.
- **Lead time** 2–4 beats between command and dancers starting (2 is the norm;
  more for unusual formations/arrangements).
- **Execution time** = the timing-chart beats.
- **Phrase anchoring**: on 8-beat phrased music, anchor beats are 1 & 5 (3 & 7
  secondary); deliver on beats 7–8 so dancers *start* on beat 1. Worked example:
  `Heads Square Thru 4` (10 beats) then `Swing Thru` (6) = 16 beats = two phrases,
  with the correct delivery beats spelled out.
- Tempo norms: 124–130 BPM; dancers comfortable 118–128.

## Design consequences

1. **Two axes, reported separately.** A sequence gets a flow report (F1–F7
   violations, per transition, per dancer) and a variety report (V1–V6 scores per
   window). Deliberate flow violations are legitimate caller choices (surprise,
   excitement — CALLERLAB's "Square Thru 3/4, there's your corner, Pass Thru"
   example, i.e. the game's prank/gimmick territory), so flow findings are
   *diagnostics*, not a gate.
2. **Per-dancer, not per-square.** Overflow, idleness, and direction balance are
   per-dancer facts (the same call can overflow the heads and bore the sides);
   square-level scores are aggregations.
3. **The engine needs rotation-center classification** (V2) and **signed rotation
   accounting** (F3/F4/V1) derived from waypoints — worth building into the path
   representation early rather than reverse-engineering later.
4. **Inactive dancers counter-dance** (Guidelines: inactives adjust to help
   actives, e.g. sides making room in `Heads Pass Thru, Separate Around One to a
   Line`). For the engine this is breathing (already in the model); for townage
   it's NPC behavior worth teaching explicitly.
5. Property-test seeds: Dosado scores zero on F3–F5 (no net rotation);
   the 540° Guidelines example must trip F4 for heads only; `Star Thru, R&L Thru`
   passes F2 while `R&L Thru, Star Thru` fails it — all three are published
   vectors, not our inventions.

## Copyright note

The Choreographic Guidelines PDF permits quoting with its notice retained but
prohibits internet republication without permission — it stays in git-ignored
`reference/`, and this file paraphrases with citation (see
[reference-sources](reference-sources.md)).
