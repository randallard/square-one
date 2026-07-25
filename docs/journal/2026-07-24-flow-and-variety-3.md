# 2026-07-24 (4) — flow has a rulebook, variety has rules too

_Documents the flow/variety half of commit `b2d784c`._

Ryan asked whether we could evaluate sequence flow — and pointedly, whether dancers
get *variety* of movement rather than grinding one direction all night. The plan had
flow as one vague Layer-4 row. Turns out CALLERLAB wrote the book: the
**Choreographic Guidelines** (Choreographic Applications Committee, 60 pages,
1996/2004) — found it as a PDF, saved to `reference/`.

What it quantifies: overflow is **more than 3/4 (270°)** same-direction rotation,
with a worked example where six calls give the heads **540°** while the side men
"run to keep up" — one example that is both an overflow vector and the
activity-imbalance case. Biggest correction to our draft: the old alternating-hands
rule is *officially superseded* — the real rule is hand **availability** at the
completion of the prior action, body position included (`Touch 1/4 → Scoot Back`
hits the right hand three times and is smooth). And the whole delivery-timing model
is spelled out: ≤2-beat commands, 2–4-beat lead, phrase anchoring on beats 7–8.

The variety half came from challengedance.org's flow rules, nearly verbatim to
Ryan's ask: no dancer should travel continuously in one direction; vary the point
of rotation every call; change the formation shape and the focus of attention as
often as possible.

Wrote `spec/flow-and-variety.md`: flow F1–F7 per transition per dancer, variety
V1–V6 per sequence, **reported as two separate axes** — CALLERLAB itself says
deliberate flow violations for excitement are legitimate calling, which is exactly
where the game's pranks live. Everything computes from the ADR-0004 waypoints; the
path representation just needs signed-rotation accounting and rotation-center
classification designed in. Free published test vectors: Dosado rotation-clean, the
540° example trips heads only, `Star Thru → R&L Thru` passes hands while the
reverse fails.
