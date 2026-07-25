# 2026-07-24 (6) — dancers who don't quite get there

_Documents ADR-0006 and the Pass Thru spec, landed in commit `3a2dd42`._

The re-centering question got the best possible answer: it was the wrong question.
Ryan pointed out that squares *migrate*, that dancers head for formation spots but
round the corner into the next call when it lands early, and that dancer speed
varies — some squares fall apart, some keep up, some ride the brink because just
enough dancers cut corners. That's not noise to suppress; it's part of what makes
square dancing fun, and he wants it configurable.

So: two layers (ADR-0006). The ideal layer stays exactly as provable as before —
and the fork resolves cleanly there as an `exit: lane | centered` parameter on
`pass` (explicit S-curve, no snap, no zero-beat blocks). The performance layer is
new: dancer agents *pursue* the ideal timeline. Corner-rounding is emergent from
target-switching; migration is emergent from re-fitting the square frame to where
dancers actually are (error accumulates as drift instead of being corrected);
keeping-up/brink/falling-apart are lag regimes, not scripted states.

Ryan then loaded the dancer model properly: per-move skill *and* general skill, a
help coefficient — and Dunning-Kruger, explicitly: helping triggers on
*confidence*, correctness depends on *actual* skill, so the eager low-skill helper
steers people to the wrong spot. All coefficients independently toggleable
(all-off = ideal paths = the anchor invariant that pins the layers together).
Demeanor is deferred to vFuture by decision, not by forgetting: breakdown
resilience buffered by positive emotes, gated behind the levels/badges progression
the games will own.

Favorite convergence: flow costs become *felt* — F-rule violations eat pursuit
beats, so bad-flow sequences measurably break squares. The static score predicts;
the sim demonstrates.

And Pass Thru is specced: one block, `pass(forward, right, centered)`, 2 beats,
pure reuse — the block layer's first dividend. Seven calls to go, blocks-first.
