# ADR-0018: An arch needs a hand's room between two heads, so a couple carries a second clearance
- Status: Accepted
- Date: 2026-08-19
- Deciders: Ryan, Claude

## Context

[ADR-0016](0016-a-couple-carries-the-clearance-its-bodies-need.md) gave a couple one clearance —
how far apart its two dancers must be to pass each other — and a bow to deliver it. Building the
consumer that measures that number found there is not one number.

[ADR-0017](0017-a-california-twirl-is-a-partner-trade-holding-on.md) established that a California
Twirl **is** a Partner Trade, walked with the inside hands joined and raised into an arch: same
blocks, same belle, same beats, same waypoints. So the two calls asked the same pair for the same
room. Ryan, watching the arch drawn for the first time:

> the beau's hand clips through the belle's head — it shouldn't push into the beau's own head
> either though

That is not the pass being too tight. It is the pass having **something else in it**. With hands
free, two dancers must clear each other. With hands joined and raised there is a **joined hand up
between their two heads**, at head height — where a head is the widest thing either of them has —
and that hand belongs to neither dancer, so neither dancer's own width accounts for it.

Measured on townage's shipped cast, in world units against a couple who stand **1.140** apart:

| what has to fit through the gap | wants |
|---|---|
| two torsos, side by side | 0.520 |
| two heads | 0.710 |
| two heads with a joined hand between them | **1.084** |

An arch very nearly forbids the pair to approach each other at all. One number cannot be both
0.710 and 1.084, and the figure has to know which one it is delivering **before** it is walked.

## Decision

**A couple carries `archClearance` beside `clearance`, and the figure picks between them by the
hold it is danced with.**

- `Couple.archClearance` — the room the pass needs with a joined hand raised in it. It defaults to
  `clearance`, so a consumer that has never heard of arches sees no change at all.
- `beauHalf` reads `hold?.grip === "arch" ? couple.archClearance : couple.clearance`. **The hold
  already says which figure this is**, so nothing has to be told twice and the two calls stay one
  factory with one parameter, exactly as ADR-0017 left them.
- The three measurements a chain may size itself against — `width`, `clearance`, `archClearance` —
  are named as `CoupleShape`, and `chainsAt` takes that rather than the whole `Couple`. A chain
  that could see `center` or `facing` would be a chain that could bake the floor into the figure.

## Alternatives considered

- **One clearance, set to the larger number.** It would fix the Twirl by making every hands-free
  Trade pass at arch distance — a figure bowed to make room for a hand that is not there. The
  Trade and the Twirl would go back to being indistinguishable, which is the thing ADR-0017 was
  written to stop being true by accident.
- **Model the arch's height in the engine and derive the width from it.** Rejected for the reason
  ADR-0017 already rejected modelling the height at all: it is a body measurement and this library
  has no bodies (ADR-0002). Which of two numbers a figure needs is choreography; what the two
  numbers *are* is anatomy.
- **A per-call clearance table on the consumer's side.** It puts "a Twirl needs more room than a
  Trade" — a fact about the figure — in the module that knows about torsos, and leaves the engine
  unable to state its own requirement.
- **Raise the arch until the hand clears the heads.** The consumer already does everything it can
  here — the-lot's ADR-0028, `an arch a pair cannot make is accommodated two ways` (no public
  remote, so unlinked, per the escape rule the docs gate enforces): on this cast the pair cannot make an arch at all without reshaping or letting go, so there is no
  height left to spend. And the binding case is the **break**, where the beau never gets his hand
  up — it sits lower, where a head is wider.

## Consequences

- **The two calls stop being the same paths, and that is the point.** ADR-0017's identity becomes
  "same figure, sized to what it carries": same blocks, same belle, same beats, a wider arc for the
  beau. The test that asserted waypoint-for-waypoint identity is scoped to a couple who ask for
  nothing, where it is still exactly true.
- 🔴 **The bow is solved, not computed, because the pass is not the closest moment.**
  `wanted − radius` is precisely right for the separation *at* the pass — he is at the top of the
  arc, she is at its centre — and it is wrong for the figure. The lane is `sin²` and she crosses at
  a constant rate, so a large bow makes them nearest each other on the **way** to the pass. At this
  cast's arch clearance the arithmetic left the closest approach **3% under** what was asked for,
  and 3% is a hand inside a head. It is now bisected on the minimum separation over the whole call,
  which is monotonic in the bow because the belle never leaves the disc the beau walks around.
- 🔴 **The bow is capped at one couple-width, because two dancers standing on their spots cannot be
  separated by it.** At both ends of the call the separation is exactly the couple's width whatever
  the bow does in between, so the minimum only ever *approaches* that width: a clearance near it
  costs an unbounded bow for a vanishing gain, and one at or above it cannot be met at all.
  Measured before it was bounded, an unsatisfiable request had the beau orbiting at **73 times**
  the couple's width. Past one width he is not dancing round his partner, he is running a lap. A
  pair who want more get the widest bow the figure has, and the standing hold answers for the ends.
- **On the shipped cast the arch clearance is 0.951 of the standing width** — inside the cap, but
  only just, and the bow it buys is large: the beau's arc peaks at **1.152×** the couple's width
  (1.314 world, from 0.570), and the closest the pair come is the 1.140 they stand at. **This is
  the number a render has to judge**: he covers that ground in the same 4 beats, so the question is
  whether he now reads as sprinting.
- 🔴 **The hands-free clearance is deliberately still not passed by the consumer.** The mechanism
  now exists to close ADR-0014's head overlap for the Partner Trade, and switching it on would bow
  a figure Ryan has already watched and accepted. That is a look, not a number, and it is owed
  rather than taken.
- **Promotion condition:** a third thing in the gap — a skirt, a third dancer, a prop — is a third
  clearance, and three is the point at which a couple should carry a *map* from hold to clearance
  rather than a field per case. Two is not yet that.
