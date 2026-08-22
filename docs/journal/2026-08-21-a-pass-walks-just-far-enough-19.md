# 2026-08-21 — a pass walks just far enough

_Documents [ADR-0023](../adr/0023-a-pass-walks-just-far-enough-to-clear.md), landed in `d584a74`.
Third chunk of the day, and the second in a row found by Ryan looking at the one before it._

Ryan, on the Dosado once the pair calls could take bodies:

> dosado pass by too far though — should watch body / head size and pass by just enough to clear
> and slide to the right far enough to step back

## The lane was fitted and the walk was not

[ADR-0020](../adr/0020-every-call-is-sized-to-the-bodies-that-dance-it.md) made the lane a body
measurement and argued, correctly, that a facing pair's **separation** is a fact about the floor
rather than about anybody. It carried a second thing with it without saying so: the `lane` and
`close` exits walked a flat **0.80**.

Where did 0.80 come from? Nowhere anybody can point at. It has been in `pass` since the block was
written, next to a lane of 0.15 that has since been derived, measured and re-derived twice.
Measured at the back-to-back beat on townage's cast, the pair were **1.562 world units** past each
other against the **0.710** their heads and torsos take to clear.

The lane was right to the millimetre and the walk was out by more than a factor of two.

## The next beat decides it, which is why this is not a taste

The distance is forced. During the `slide` the two dancers **swap lanes** — each crosses the
other's `x` — so nothing lateral is holding them apart and the only gap is the one they walked
out. It has to be at least the clearance, and there is no argument for more.

So `(separation + clearance) / 2`, and the schedules became fractions of the travel rather than
distances, which is what makes the shape of each exit statable once.

`centered` is untouched, and that distinction is the interesting one: a Pass Thru walks the whole
separation because **finishing on the counterpart's former spot is what the call is**. Bodies
change the lane it walks in and cannot change where it ends. One block, two exits, and only one of
them is a body's business.

## The fixtures moved, for the first time here

ADR-0009 makes the spec markdown the conformance fixture, and this is the first chunk to change a
figure that the markdown documents. So `blocks/pass.md`'s `lane` and `close` tables and
`calls/dosado.md`'s full-call table were rewritten, with the retired numbers kept beside the
measurement that retired them.

That is the arrangement working rather than straining. The suite failed the moment the geometry
moved, named the four rows, and would not go green until the documents agreed with the code —
which is exactly what a fixture is for. Editing them felt like cheating for about a minute, and
then the alternative — code and spec quietly disagreeing about where a dancer stands — settled it.

## Two in two days

ADR-0022 found an arc sampled every 45° because that was the spacing when nothing measured against
it. This found a walk of 0.80 for the same kind of reason. Both were **plausible**, both had things
fitted around them, and both were invisible precisely because everything nearby had been tuned to
agree with them.

**A number in this catalog should say where it comes from, or be a parameter.** The remaining
literals of that kind are `arm-turn`'s `ENTRY_RADIUS` and `STEP_OUT_RADIUS`; the second is already
a fraction, and the first is the pair frame's own half unit. If a third turns up, this stops being
an observation and becomes a review item.
