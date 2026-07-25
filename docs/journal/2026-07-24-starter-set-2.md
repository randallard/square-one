# 2026-07-24 (3) — the starter set: Zero Box triple

_Documents ADR-0004, landed in commit `b2d784c`._

Ryan asked for a simple get-in / identity / get-out to start from, and CALLERLAB's
Teaching Resource turned out to publish exactly that, per call, in a Module section
(equivalents / zeros / get-ins / get-outs). Best find of the effort so far — it means
our first test vectors are *authoritative*, not invented.

The pick (Ryan approved the recommendation): get-in `Heads Square Thru Four` → Zero
Box; zero `Dosado` (CALLERLAB: "Dosado is a Zero" — a geometric identity, which makes
`apply(dosado, S) == S` the engine's first property test); get-out `Allemande Left,
Right and Left Grand, Promenade home`. Five calls, all already in moves.md. Then the
equivalence suite (Square Thru 2 = Star Thru + Pass Thru; Square Thru 4 = Star Thru +
California Twirl) and the working zero `Square Thru Three, Partner Trade` — which is
the interesting one, because it forces zero-classification *by FASR comparison*
rather than by path identity. Nine calls total; Partner Trade the only net-new spec.

Also settled today, en route: no CALLERLAB membership needed — verified their
definitions/timing/standard-applications PDFs download publicly, pulled the six we
need into git-ignored `reference/callerlab/`, and wrote the re-download map into
`spec/reference-sources.md` with the copyright posture (public repo: cite and
paraphrase, never commit the PDFs).

Next real work: the nine per-call spec files, timing from the charts, and the first
waypoint choreography. Dosado first — the identity call is the cheapest path to
proving the whole pipeline.
