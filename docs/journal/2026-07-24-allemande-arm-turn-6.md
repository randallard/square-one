# 2026-07-24 (7) — the arm turn, and a correction

_Documents the Allemande Left + arm-turn specs; commit hash added by the
follow-up journal commit._

Ryan went with the exit-parameter shape for `arm-turn` (consistent with `pass`),
so: `arm-turn(hand, fraction, exit: step-out | hold)` — `step-out` blends the
release-and-depart step into the last beat; `hold` keeps the grip for future
composite calls like Do Paso. First block with rotation and with hands, which
means roll, F3/F4, and F2 all activate at once.

A correction for the record (journal is append-only; yesterday's chat message,
not a spec, had it wrong): a **left** arm turn rotates the pair
**counterclockwise** — pivot on your left as you walk forward — not clockwise as
I said when proposing the block. Worked the geometry properly while writing the
fragment table; the specs are right.

Two satisfying alignments. First, F2: a left arm turn releases the left forearm,
leaving the right hand fresh — so Allemande Left → Right and Left Grand, the most
classic pairing in the dance, scores textbook-clean on hand availability. The
model keeps agreeing with a century of practice, which is the best evidence it's
the right model. Second, an honest wrinkle: a single full arm turn is 360° of
same-direction rotation — over F4's 270° threshold — yet completely comfortable.
The Guidelines' own kinesiology section supplies the answer (anchored rotation
with pivot pressure disorients less than free-body rotation), so F4 needs an
anchored-rotation discount and cross-transition accumulation. Flagged in the
block spec; the flow checker design will owe it a decision.

Allemande Left itself: one block, fraction resolved from entry/exit bearings
(turn until facing your departure direction — nominally full from a squared
set), and it starts the Zero Box get-out spine: Heads Square Thru 4 → Allemande
Left → R&L Grand → Promenade home. Next talk-first move: Right and Left Grand,
which brings `pull-by` and the first 8-dancer circle frame.
