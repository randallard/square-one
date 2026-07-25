# Dosado

_Status: draft (2026-07-24). First per-call spec — it establishes the template
(sections mirror [`call-model.md`](../call-model.md) Layer 3), the local-frame
convention for choreography paths, and the first
[block composition](../blocks/README.md) (ADR-0005). Sources: CALLERLAB Basic
Program Definitions + timing chart (local, `reference/callerlab/`), the
[Dosado teaching pages](https://teaching.callerlab.org/basic-part-1/dosado-definition/dosado-modules/),
and `mix-a-hoot-n-hollar/docs/moves.md` (`dsd`)._

## Identity

| Field | Value |
|---|---|
| Canonical name | Dosado |
| Spoken variants | Do Si Do, Dosado with your corner/partner, Dosado once and a half |
| Legacy app abbreviation | `dsd` (from moves.md) |
| Program | Basic Part 1 |
| Role dependence | **None** — any two facing dancers; no role tokens needed |

## Formations

- **Starting:** facing dancers (danced pairwise; from facing couples each dancer
  works with the one they face; from a squared set, with the named dancer —
  corner, partner, across the set).
- **Ending:** identical to starting — each dancer returns to their exact spot and
  original facing. **Dosado is a zero** (CALLERLAB-listed), and a *geometric* one.

## Timing

| Situation | Beats |
|---|---|
| Facing dancers (point of contact) | **6** |
| Squared set, across the set | 8 |

Timing data: Reprinted with permission of CALLERLAB (Basic/Mainstream timing
chart, rev. 2023-02-15; timing runs from point of contact — add approach steps
where the dancers start apart).

## Dance action

Walk forward, passing right shoulders; without turning, sidestep to the own-right
passing back-to-back behind the other dancer; walk backward, passing left
shoulders; step sideways back to the starting position. **Facing direction never
changes** — the dancers orbit each other face-forward the whole way.

## Block composition

Dosado is a four-block chain from the [block catalog](../blocks/README.md)
(ADR-0005 — calls are compositions of first-class blocks):

| # | Block | Beats | Exit |
|---|---|---|---|
| 1 | [`pass`](../blocks/pass.md)`(forward, right)` | 2 | past the counterpart, own-left lane |
| 2 | [`slide`](../blocks/slide.md)`(right)` | 1 | crossed behind them to the other lane |
| 3 | [`pass`](../blocks/pass.md)`(backward, left)` | 2 | backed past, original side |
| 4 | [`slide`](../blocks/slide.md)`(left)` | 1 | home |

Beats sum to the chart's 6 ✓. Each exit pose satisfies the next entry contract
(the chaining check), and the full-call waypoint table below is the composition's
embedding into the pair frame. **Left Dosado / See Saw is the mirror transform of
this chain** — no separate authoring. Parts for fractionalization are named
subsequences: "once and a half" is the full chain followed by blocks 1–2 again,
ending back-to-back on swapped spots (net ≡ Pass Thru, CALLERLAB-listed).

## Choreography paths

**Frame convention (established here for all 2-dancer calls):** local frame
centered on the pair's midpoint; dancer A starts at `(0, −0.5)` facing `+y`,
dancer B at `(0, +0.5)` facing `−y` — one unit between facing dancers. B's path is
always A's rotated 180° about the origin (pair symmetry). Consumers embed the
frame into the square via the formation's position/orientation for each working
pair (breathing handled at square level).

Dancer A, facing `+y` at every waypoint (facing column omitted — constant):

| Beat | x | y | Doing |
|---|---|---|---|
| 0 | 0.00 | −0.50 | start |
| 1 | −0.15 | −0.10 | forward, shifting to the left lane |
| 2 | −0.15 | +0.30 | right shoulders pass |
| 3 | +0.15 | +0.30 | sidestep right, crossing behind B |
| 4 | +0.15 | −0.10 | backing up, left shoulders pass |
| 6 | 0.00 | −0.50 | back up and sidestep home |

Hands: none throughout (arms in natural dance position; skirt work is styling
only). Paths are **provisional until rendered** — validate visually in a consumer
before treating as final.

Derived geometry worth noting: each dancer's *position* orbits the pair center a
full 360° **clockwise** (viewed from above, `+y` up), while *facing* rotation is
zero. The mirror call (Left Dosado / See Saw: pass left shoulders first) is the
counterclockwise orbit — the V1 direction-balance counterweight.

## Momentum results (Layer-1 state after the call)

| Aspect | Value |
|---|---|
| Roll direction | **None** — no turning motion; CALLERLAB's Roll definition explicitly lists Dosado as a cannot-roll call |
| Sweep direction | None |
| Body-flow vector | Ends moving backward/sideways into the spot — effectively at rest; next call starts from a standstill (no flow to preserve or violate) |
| Last hand used | None (hands stay free — any next hand is available, F2-clean) |

## Rules & variants

- **Shoulder rule:** right shoulders first (definition-inherent, not the generic
  passing rule). Mirror: **Left Dosado / See Saw**.
- **Ocean Wave / Facing Couples rules:** not applicable.
- **Related but distinct call:** *Dosado to a Wave* (ends in a right-hand
  mini-wave, 6 beats) — out of starter scope; listed so nobody conflates them.

## Modules & equivalences (test vectors)

- **Zero:** Dosado itself — `apply(dosado, S) == S` for every legal `S` (the
  engine's first property test: position *and* facing identity).
- **Equivalence:** Dosado once and a half ≡ Pass Thru (net FASR effect).
- Flow profile: F3–F5 clean (zero facing rotation, no sharp turns); paths must be
  collision-free with the right-shoulder lane offset; pair paths point-symmetric.

## Game notes (Layer-3 game metadata, tentative)

The townage arc's candidate first taught interaction after the fist bump: a
two-person move with no role asymmetry, no hands, and a self-evident "you end
where you started" outcome — the natural vehicle for teaching **home**.
