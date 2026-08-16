# ADR-0012: Calls key off couple position (beau/belle), not role

- Status: Accepted
- Date: 2026-08-15
- Deciders: Ryan, Claude

## Context

Planning ADR-0011's S1 needs the **couple** formation, and Ryan's opening move for it is
"partner up" — form a couple and determine who is on the right and who is on the left.

That exposes a gap and a question at once.

**The gap.** `DancerId` is `{ couple, role }`. There is no notion of *position within a
couple*, and it is what every asymmetric call actually turns on. The salvaged `moves.md`
already speaks the vocabulary — Star Thru's entry reads *"the gent is the beau (left side of
the resulting couple); the lady is the belle (right side)"* — but nothing in the engine can
represent it.

**The question.** [ADR-0003](0003-roles-boy-girl-with-alternative-labels.md) made **boy/girl**
canonical, on the strength of matching the source definitions verbatim so specs migrate
without a translation layer. Those source definitions describe asymmetric calls in gendered
terms: *"the gent turns 1/4 right while the lady turns 1/4 left."* Taken literally, a call
would branch on role.

Modern calling does not work that way. It keys off **position in the couple** — beau on the
left, belle on the right — precisely so that the call is danceable by any two people standing
in those spots. Ryan's call: *"use beau belle as in modern practice."*

`CallDef` already carries a `roleDependent: boolean`, `false` on all three starter calls
because none of them is asymmetric. Star Thru is the first call that would set it, which makes
this the last cheap moment to decide what the field means.

## Decision

**A couple has two positions — `beau` (left) and `belle` (right) — and asymmetric calls branch
on position, never on role.**

`Role` (boy/girl, ADR-0003) is unchanged and is not superseded. It remains the canonical
identity a dancer carries, and it is still what a consumer labels, aliases (Lark/Robin) and
displays. The two are **orthogonal**: a role is who you are, a position is where you are
standing right now, and calls care about the second.

Consequently `CallDef.roleDependent` is renamed **`positionDependent`**. The field was
mis-named rather than merely under-used: what varies between the two dancers of an asymmetric
call is their side of the couple, and a field called `roleDependent` invites exactly the
implementation this ADR rules out.

Where a source definition says "the gent", the spec records the **position** that dancer
occupies in the formation the call starts from, and notes the gendered original. That is a
translation layer — the thing ADR-0003 chose boy/girl to avoid — and it is worth it here
because it is applied **once per call at spec time**, not standing and not at runtime.

## Alternatives considered

**Branch on role, per ADR-0003's literal reading.** Matches the sources with no translation and
is the cheapest thing to write. Rejected: it makes every asymmetric call undanceable by two
dancers of the same role, which is wrong as square dancing before it is wrong as software —
and it would put a gender check in the engine's hot path, which the
dancer-size and accessibility work would then have to unpick
(`work/square-dance-planning/briefs/dancer-size-and-accessibility.md` — no public remote, so
unlinked per the rule the docs gate enforces).

**Derive position from role at the formation boundary** — boy always beau, girl always belle —
so calls branch on position while the engine still assigns it from gender. Rejected as the
worst of both: it looks positional and behaves gendered, and the first same-role couple breaks
it silently rather than loudly.

**Keep `roleDependent` and document that it means position.** Rejected on this family's
standing preference for making the wrong thing inexpressible rather than documented. A field
named for the concept it is not is how the next implementer gets it wrong.

## Consequences

- **`partnerUp` has to say who is beau and who is belle**, and that becomes an input rather
  than something the engine infers. A consumer that wants the traditional arrangement passes
  it; a consumer that wants two belles standing together can have that, and no call breaks.
- **Specs gain a translation step.** Each asymmetric call's spec restates its source's gendered
  prose in positional terms and keeps the original alongside, so the conformance fixture
  ([ADR-0009](0009-spec-markdown-is-the-conformance-fixture.md)) checks the positional form
  while the provenance stays visible. That is where a translation error would hide, so the
  original is kept rather than replaced.
- **`Role` becomes, for now, carried and unused by the engine.** It is still right to keep it
  — it is dancer identity, consumers display it, and calls outside the starter set (Courtesy
  Turn's traditional form, singing-call figures) may yet want it. But it is honest to record
  that after this ADR nothing in `src/` branches on it.
- 🔴 **Star Thru is still not expressible**, and this ADR does not fix that. `applyCallToPair`
  derives dancer B as A rotated 180°, so B's exit facing is always A's + 180°, and Star Thru
  ends both dancers facing the same way. Position-dependence is the *vocabulary* that call
  needs; the pair model is the *machinery*, and it is the next thing.
- **Promotion condition.** If a call turns up that genuinely depends on role rather than
  position — a traditional singing-call figure, most likely — this does not forbid it, but it
  is a new decision and it should say why the positional form is insufficient rather than
  quietly adding a role branch.
