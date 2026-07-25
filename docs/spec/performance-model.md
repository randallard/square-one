# Performance model — dancers who pursue, lag, help, and drift

_Status: draft (2026-07-24), per [ADR-0006](../adr/0006-two-layer-choreography.md).
Implementation is scheduled after core types + starter calls; this spec leads._

The ideal layer says where dancers *should* be on every beat. The performance
layer simulates where they *are*: agents steering toward the ideal timeline with
individual imperfections. Everything here is pure and deterministic under an
injected seed, and **every coefficient is independently toggleable** — the anchor
invariant is that all-off reproduces the ideal paths exactly.

## Pursuit mechanics

- Each dancer tracks a **target stream**: the ideal waypoint timeline for their
  current call, expressed in the square's frame.
- **Square frame re-fitting:** the square's frame (center + orientation) is
  continuously re-estimated from actual dancer positions. Targets are relative to
  this fitted frame, so individual error is never corrected toward absolute floor
  coordinates — it accumulates as whole-square **migration/drift**. "Home" is a
  remembered floor region, not an anchor (finding it again is a skill — and a
  caller-memory game).
- **Target switching:** when the next call is delivered, the target stream
  switches mid-flight. A dancer who had time has arrived; a dancer who hadn't
  **rounds the corner** — curvature-limited steering from wherever they actually
  are. No snapping, ever.
- **Lag:** per-dancer scalar — how far behind the ideal timeline (in beats) the
  dancer is running. The square-level aggregates give the three regimes Ryan
  named: **keeping up** (lag recoverable before each next call), **on the brink**
  (collective lag hovering at the threshold, held down by corner-cutters), and
  **falling apart** (unrecoverable → breakdown event).

## Dancer coefficients (v1 — all seeded, all toggleable)

| Coefficient | What it varies | Effect in the sim |
|---|---|---|
| **Step length** | Stride as a fraction of nominal | Slower/faster ground covered per beat → lag accumulation rate |
| **Rhythm offset** | Phase error against the beat, with drift | Early/late steps; interacts with music phrasing |
| **Reaction latency** | Beats between call delivery and starting to move | The dancer-side half of the Guidelines' lead-time model |
| **Corner-cutting** | Lookahead: how early they curve toward the next target | The lag-recovery mechanism; high values keep brink-squares alive |
| **General skill** | Baseline execution quality | Path accuracy, hesitation, error probability for calls without a specific skill entry |
| **Per-move skill** | Skill for each specific call (grows with reps) | Overrides/refines general skill per call; error modes can come from *documented* common errors (e.g. the Guidelines' note that men tend to over-rotate Square Thru's second hand into a courtesy turn). The learning curve is the game's "little repetitions" loop made literal |
| **Help coefficient** | Willingness to tap/redirect another dancer they believe is off track | See helping, below |
| **Confidence bias** *(Dunning-Kruger)* | Gap between self-assessed and actual skill, largest at low skill | Helping triggers on **confidence**; help *correctness* depends on **actual skill** — so low-skill/high-confidence dancers actively help people to the wrong spot |
| **Demeanor** *(deferred — vFuture, noted now by decision)* | Emotional resilience to breakdown | Some dancers can't handle a square breaking down; discouragement compounds. **Emotes are the counter**: a player who positive-emotes builds a square that tolerates more breakdowns. Gated to higher player levels — a system for players who've already gotten used to the game |

## Helping (the Dunning-Kruger mechanic)

1. Dancer A forms a **belief** about dancer B's correct target — accuracy of the
   belief is a function of A's *actual* skill for the current call.
2. A's urge to intervene = f(A's **confidence** in that belief, A's **help
   coefficient**, B's visible deviation).
3. Over threshold → A taps/directs B toward A's *believed* target — which may be
   wrong. A confident low-skill helper is a mobile error source; a skilled
   reluctant one lets saves go unsaved. Both are true to real squares.
4. The player's own tap-to-direct (already in the townage arc) is the same
   mechanism with the player's judgment substituted for the belief model.

## Toggles & progression

Every coefficient (and the helping subsystem, and later demeanor) has an
independent enable flag plus a variance scale. The engine exposes the dials;
**the games own progression** — players earn levels/badges to unlock adding these
systems to their game (see the planning effort's progression system). Typical
ramp: ideal dancers → speed/rhythm variance → skill + helping → demeanor.

## Metrics the layer reports

Per dancer: lag, distance-from-ideal, corners cut, helps given/received (and
whether they were correct). Per square: integrity regime (keeping up / brink /
falling apart), breakdown events, migration vector from starting spot. Per
sequence: how flow-rule violations translated into lag (the felt cost of bad
flow — the static F-score's prediction, demonstrated).

## Property-test seeds

- **Anchor:** all coefficients off ⇒ positions equal ideal paths exactly, every
  beat, every dancer.
- Determinism: same seed + config ⇒ identical simulation.
- Monotonicity smoke tests: raising step-length variance never *decreases*
  expected lag; corner-cutting at zero ⇒ no early target blending.
- Helping off ⇒ no dancer ever influences another's target; helping on with
  confidence bias zero ⇒ helps are exactly as correct as actual skill allows.
