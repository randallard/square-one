# The call & state model — everything square-one tracks

_Status: **draft for review** (2026-07-24). Researched against caller theory (FASR),
CALLERLAB definition structure, and prior art (Taminations, ceder.net). Once reviewed,
the accepted shape gets its own ADR and this document becomes the working spec._

The planning effort's ADR-0004 decided square-one owns choreography **paths** as pure
data. This spec answers the follow-up question: *paths are not enough — what else must
the engine track to evaluate sequences of calls?* The short answer: four layers —
per-dancer state, square-level state, the call definition record, and sequence-level
judgments — because a caller engine has to answer questions like "can they Roll from
here?", "is this legal from this arrangement?", "does this flow?", and "are we home?"
that positions alone cannot answer.

---

## Layer 1 — Per-dancer state

What each of the 8 dancers carries at every point in a sequence.

| Aspect | What it is | Why it must be tracked |
|---|---|---|
| **Identity** | Couple number (1–4) + role slot | Resolution is defined against *original* identity (partner, corner) |
| **Role** | **Boy/girl** (canonical, matching source definitions), with pluggable presentation labels — e.g. gender-free Lark/Robin ([ADR-0003](../adr/0003-roles-boy-girl-with-alternative-labels.md)) | Role-dependent calls (Star Thru, Slide Thru); arrangement is defined over roles. Labels are aliases only and never affect semantics |
| **Position** | Unit-square coordinates (footprint/spot) | ADR-0004 waypoints; formation recognition |
| **Facing direction** | Which way the dancer faces | Half the definition of a formation; determines beau/belle, leader/trailer |
| **Path** | Waypoints `{x, y, beat}` + facing over time | ADR-0004 — consumers scale and tween |
| **Rotational momentum (roll direction)** | CW / CCW / none at the end of the last call | Enables **"…and Roll"** — turn ¼ more in the direction you were turning. Per-dancer, not per-call: from the same call some dancers can Roll and others can't (a dancer whose last motion was straight, e.g. Pass Thru, has no roll) |
| **Sweep direction** | Couple-level circling momentum CW / CCW / none | Enables **"…and Sweep a Quarter"** — the couple continues circling ¼ in the direction of body flow |
| **Body-flow vector** | Direction of travel at call end | Flow analysis between consecutive calls: a next call that reverses it is jerky; too much *same*-direction turning is "overflow" |
| **Hand availability / last hand used** | Which hand finished the last action (and whether it has released); current handhold (mini-wave hand, couple hold, star grip…) | CALLERLAB's refined rule: the hand needed next must be *available* at the completion of the preceding action — this supersedes naive hand-alternation (see [flow-and-variety.md](flow-and-variety.md) F2); styling; Taminations tracks a `hands` value per movement for exactly this |
| **Derived positional roles** | Beau/belle, leader/trailer, center/end, very centers, points, in-facing/out-facing, head-position/side-position | Not stored — *computed* from formation + position + facing — but the engine must expose them because call definitions are written in these terms ("centers trade", "leads roll away") |

## Layer 2 — Square-level state

The caller-theory view of the whole square. This is **FASR** — the model sight calling
and module choreography are built on — plus geometry bookkeeping.

| Aspect | What it is | Why it must be tracked |
|---|---|---|
| **Formation** | The named shape + facing directions + handedness (right-hand / left-hand / mixed): squared set, facing lines, ocean waves, two-faced lines, columns, diamonds, eight-chain-thru, … | Call legality is defined per starting formation; formation recognition from positions is a core engine function |
| **Arrangement** | Where the roles sit within the formation. For symmetric setups there are exactly **6** per formation: `0` (normal), `½` (sashayed), and `1`–`4` | "Standard" vs odd arrangements is most of what makes a call feel hard; legality can depend on it |
| **Sequence** | Whether boys and girls are each in original circle order — 4 states (both in / both out / boys in–girls out / boys out–girls in) | One of the two things (with Relationship) a caller must know to resolve without memorizing positions |
| **Relationship** | Which girl is adjacent to a reference boy: **p**artner / **c**orner / **o**pposite / **r**ight-hand girl | The other half of resolution: allemande left needs corner relationship + the right sequence |
| **Home positions** | Each dancer's original spot; original partner/corner mapping | "Home is where you started" — the arc's own teaching concept; the resolution target |
| **Symmetry** | Whether the square still has diagonal symmetry | Nearly all choreography preserves it and sight-resolution shortcuts assume it; asymmetric calls/mistakes break it, so it's a trackable invariant, not an assumption |
| **Square rotation** | Resolved-but-rotated ("stirred bucket") offset; promenade distance to home | "Promenade home" needs to know how far; a square can be *sequence-resolved* yet rotated |
| **Breathing** | Spacing adjustment when formations compress/expand (outsides squeeze in when centers work in a smaller footprint, and re-expand after) | Pure geometry normalization, but without it waypoints drift off the unit square and formation recognition fails |

FASR notation composes these: e.g. `[0L1p]` = normal arrangement, facing Lines, both in
sequence, reference boy beside partner. Modules are defined as transformations over FASR:
**zeros** (leave it unchanged), **equivalents** (same net effect as another call string),
**get-ins/get-outs** (setup ↔ resolution) — which maps one-to-one onto the game arc's
"get-ins and get-outs" chunk.

## Layer 3 — The call definition record

What square-one stores per call — a superset of the CALLERLAB definition format
(name, starting formation, command examples, dance action, ending formation, timing,
styling, comments) plus animation and game metadata.

| Aspect | What it is | Why it must be tracked |
|---|---|---|
| **Name + command variants** | Canonical name, spoken variants ("Heads Star Thru"), fraction forms | Parsing/generating calls |
| **Program level** | Basic 1 / Basic 2 / Mainstream / Plus / A / C + teaching order | The game's progression system *is* the teaching order |
| **Valid starting formations** | Every formation (and arrangement restriction) the call is proper from | Legality checking |
| **Standard vs Extended applications** | Which formation/arrangement combos dancers commonly dance it from (CALLERLAB publishes these per call) vs technically-legal-but-unusual ones | Difficulty grading for both the drill games and NPC dancer "skill" — an NPC that only knows Standard applications is realistic |
| **Ending formation** | Per starting formation | State transition |
| **Timing** | Beats, per starting formation where it differs (CALLERLAB timing charts) | ADR-0004 paths carry it; sequence timing totals need it |
| **Dance action** | The definition prose, per part | Teaching content; the authority the animation must match |
| **Block composition** | The ordered, parameterized [building blocks](blocks/README.md) the call chains (ADR-0005); bespoke fragments are themselves cataloged blocks | Custom-move building, townage's teach-by-parts arc, and left/mirror variants (free via the mirror transform) all hang off this |
| **Parts / fractionalization** | The call's parts — named subsequences of the block chain — and whether CALLERLAB allows fractions ("half of a…", "interrupt", "finish") | Fraction calls are real calls; parts are the coarser, CALLERLAB-recognized layer above blocks |
| **Roll direction per dancer** | The turning direction (or none) each dancer's path ends with | Derivable from the path's final rotation (Taminations derives it this way) but must be verified per call — it feeds Layer 1's roll state |
| **Sweep direction** | Circling direction (or none) couples end with | Feeds Layer 1's sweep state |
| **Hands** | Handhold/grip per movement segment (right, left, both, star grip, none…) | Styling, hand-availability tracking, and animation |
| **Styling notes** | Arm/skirt/courtesy details | Cosmetic but game-visible; part of the CALLERLAB record |
| **Shoulder-pass rule** | Right-shoulder default; left for "Left" calls; same-spot passing rule | Collision resolution in path generation |
| **Rule applicability** | Whether the **Facing Couples Rule** / **Ocean Wave Rule** applies (wave-defined calls danceable from facing couples by stepping to a wave, and vice versa) | Doubles the effective legality table without duplicating definitions |
| **Variants** | Left/mirror variant, "Reverse" variant, role-dependence flag | Mirror paths are derivable; role-dependent calls (Star Thru) are not symmetric |
| **Game metadata** *(ours, not CALLERLAB's)* | Which NPC can teach it; unlock prerequisites; taught-gesture mapping (townage gestures live in the same block catalog) | The teaching arc — the whole point of the game |

## Layer 4 — Sequence-level evaluation

What the engine judges about a *sequence* of calls — the aspects that make caller
skills gradeable and NPC callers plausible.

| Aspect | What it is | Why it must be tracked |
|---|---|---|
| **Legality** | Every call valid from the current FASR at its program level | The baseline check |
| **Flow quality** | Per-transition, per-dancer rules F1–F7 in [flow-and-variety.md](flow-and-variety.md): transition continuity, hand availability, rotation continuity, **overflow (quantified: >270° same-direction turning)**, sharp turns (≥90° in 1–2 steps), the lateral-motion rule, stops/stacking | "Technically legal but awkward" is the #1 novice-caller failure — a perfect drill-game metric; CALLERLAB's Choreographic Guidelines quantify it |
| **Variety** | Per-sequence rules V1–V6 in [flow-and-variety.md](flow-and-variety.md): direction balance (no dancer travels continuously CW or CCW), point-of-rotation variety, formation-shape variety, focus-of-attention variety, per-dancer activity balance, hand balance | The other axis of good calling — reported separately from flow because deliberate flow violations for variety/surprise are legitimate; dancers should get movement variety *while* flow holds |
| **Delivery timing** | Command time ≤2 beats, lead time 2–4 beats, execution time from the charts, phrase anchoring (deliver on beats 7–8, dancers start on beat 1), stacking detection | Calling on the right beat is its own skill — a direct hash-n-patter drill; quantified in the Choreographic Guidelines |
| **Timing totals** | Beat count of the sequence vs the musical phrase (64-beat sections; singing-call figures target ~64 beats) | Patter pacing and singing-call figure drills |
| **Difficulty** | Share of Extended (vs Standard) applications, call level mix, call frequency | Grading drills; matching NPC dancer ability |
| **Resolution detection** | Is the square allemande-left-ready? right-and-left-grand-ready? promenade-home? at home? | Sight-calling drills; the "get us home" game |
| **Progression** | For singing-call figures: does the figure move everyone to a new partner (corner progression)? | Singing-call drills |
| **Module classification** | Is this string a zero / equivalent / get-in / get-out relative to a FASR? | The module-calling drills; NPC callers can *compose* from classified modules |
| **Symmetry preservation** | Does the sequence keep the square symmetric? | Sanity invariant + property-test target |

---

## Property-test targets that fall out of this model

The model is chosen partly because each layer yields machine-checkable invariants:
paths never collide and land exactly on the ending formation; timing sums to the call's
beats; roll/sweep directions derived from paths match the definition record; formation
recognition round-trips (apply call → recognize ending formation → matches declared
ending); symmetric input + symmetric call ⇒ symmetric output; a call string classified
as a zero really does return the FASR unchanged; breathing keeps all dancers within the
unit square.

## Open questions for review

1. ~~**Roles**~~ **Resolved 2026-07-24** ([ADR-0003](../adr/0003-roles-boy-girl-with-alternative-labels.md)):
   boy/girl is the canonical model, matching the source definitions 1:1, with a
   pluggable label option (e.g. Lark/Robin) at the presentation layer.
2. **How much of Layer 4 is v1?** Legality + resolution detection are needed early
   (two-couple square chunk); flow/overflow scoring can come with the caller-drills.
3. **Two-couple subset**: the arc starts with 4 dancers. FASR is defined for 8; the
   two-couple model is a clean subset (formations/arrangements still apply, sequence
   degenerates) — worth confirming the types don't hard-code 8.
4. **Concepts/extensions** (As Couples, Tandem, …) are deliberately out of scope until
   the arc needs them; noting so the type design doesn't preclude them.

## Sources

- FASR: [CALLERLAB FASR paper (PDF)](http://knowledge.callerlab.org/wp-content/uploads/2020/03/FASR.pdf), [all8.com FASR notation](https://www.all8.com/sd/calling/fasr.htm), [Controlling Choreography With Relationships — CALLERLAB KnowledgeBase](https://knowledge.callerlab.org/controlling-choreography-with-relationships/)
- Resolution: [How to Resolve the Square — all8.com](http://www.all8.com/sd/calling/resolve.htm) ([ceder.net mirror](https://www.ceder.net/articles/cache/252.html))
- Definition format: [CALLERLAB Basic definitions — ceder.net](https://www.ceder.net/oldcalls/view.php?what=clb&style=book), [CALLERLAB Mainstream definitions (PDF)](https://alamoarea.org/files/mainstream_defs.pdf), [CALLERLAB Teaching resource](https://teaching.callerlab.org/mainstream/)
- Roll: [Roll definition — ceder.net](https://www.ceder.net/def/roll.php)
- Standard vs Extended applications: [Standard Plus Applications (CALLERLAB supplemental, PDF)](http://eodance.ca/eodance.com/oaca/linked/plus_standard_applications.pdf), [CALLERLAB program documents](https://knowledge.callerlab.org/programdocuments/)
- Ocean Wave / Facing Couples rules: [Taminations — Facing Couples Rule](https://www.tamtwirlers.org/taminations/html/b2/facing_couples_rule.html), [Ocean Wave Rule](https://www.theaustinmethod.com/ssd/ocean_wave_rule.html)
- Body flow: [Body Flow by Mel Wilkerson — Square Your Dance](https://squareyourdance.com/2015/02/01/caller-advice-by-mel-wilkerson/), [Calling for Modern Square Dancing — Jim Mayo (PDF)](http://www.sdfne.org/wp-content/uploads/filebase/publications/Calling-for-Modern-Square-Dancing.pdf)
- Prior art: [Taminations](https://github.com/mcdemarco/taminations) (per-movement `beats`/`hands`/path data; roll derived from path) — GNU AGPL-3.0, so it's a *model* reference, not a data source we can vendor
