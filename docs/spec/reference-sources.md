# Reference sources

The authoritative material the call specs are written against. **The documents
themselves are copyrighted (CALLERLAB) and are never committed** — `reference/` is
git-ignored. This file is the tracked map: any machine can re-download the set from
the links below. Our spec files paraphrase in our own words; they don't reproduce
these documents.

## Local reference set (`reference/callerlab/`, git-ignored)

Downloaded 2026-07-24 from the landing pages below (each page's Download button
serves the PDF publicly — no CALLERLAB membership required, verified):

| File | Source landing page |
|---|---|
| `basic-program-definitions.pdf` | <https://www.callerlab.org/download/basic-program-definitions/> |
| `mainstream-program-definitions.pdf` | <https://www.callerlab.org/download/mainstream-program-definitions/> |
| `basic-and-mainstream-timing-charts.pdf` | <https://www.callerlab.org/download/basic-and-mainstream-timing-charts/> |
| `basic-standard-applications.pdf` | <https://www.callerlab.org/download/basic-standard-applications/> |
| `standard-mainstream-applications.pdf` | <https://www.callerlab.org/download/standard-mainstream-applications/> |
| `additional-details-for-square-dance-definitions.pdf` | <https://callerlab.org/download/additional-details-for-square-dance-definitions/> |
| `choreographic-guidelines-1996-rev-2004.pdf` | <http://eodance.ca/eodance.com/oaca/linked/choreographic_guidelines_04-07-03_.pdf> — CALLERLAB Choreographic Applications Committee; the authority behind [`flow-and-variety.md`](flow-and-variety.md). Note: permits quoting with notice, prohibits internet republication — extra reason it stays git-ignored |

Full catalog of CALLERLAB program documents (Plus/Advanced/Challenge definitions,
lists, checklists, pictograms): <https://knowledge.callerlab.org/programdocuments/>

## Online (fetch as needed, not downloaded)

- **CALLERLAB Teaching Resource** — <https://teaching.callerlab.org/> — per-call
  pages with seven sections: Define, Standard, Analyze, **Module** (equivalents,
  zeros, get-ins, get-outs), Teach, Other, Extend. URL pattern:
  `teaching.callerlab.org/basic-part-1/<call>-definition/<call>-modules/`.
- **FASR paper** — <http://knowledge.callerlab.org/wp-content/uploads/2020/03/FASR.pdf>
- **ceder.net** — searchable definition mirrors and choreography articles:
  <https://www.ceder.net/oldcalls/view.php?what=clb&style=book>
- **all8.com caller theory** — FASR notation and resolution:
  <https://www.all8.com/sd/calling/fasr.htm>, <http://www.all8.com/sd/calling/resolve.htm>
- **challengedance.org flow rules** — the six formal rules of flow/variety
  (point-of-rotation, lateral motion, continuous-direction, rotation reversal,
  formation-shape and focus-of-attention change):
  <https://challengedance.org/flow.html>
- **Pride Caller School — Smooth Dancing, Body Flow & Timing** (handout):
  <https://pridecallerschool.com/wp-content/uploads/sites/34/2024/07/Pride2024-Smooth-Dancing-Body-Flow-Timing.pdf>
- **Taminations** — <https://github.com/mcdemarco/taminations> — per-movement
  `beats`/`hands`/path data model. **AGPL: design reference only, never vendor its
  data.**

## Inclusive / adapted definitions — Birgit Rudolf

The authoritative source for **how calls are adapted for dancers with mobility or
vision limitations**. CALLERLAB's KnowledgeBase points to it as *"Definitions for
partially inclusive dancing – Dancing for Everybody"*; "partially" because Birgit
limited herself to those two areas. Basic and Mainstream definitions rewritten with
the adaptations built into the call definition itself, not bolted on as a note.

**These are not ours to reinvent.** A game that gets wheelchair adaptations wrong is
worse than one that waits to get them right.

### The site is down — use the archive

`birgitrudolf.de` returns **HTTP 500** as of 2026-07-25. The last archived capture
(2026-03-14) is a WordPress maintenance page reading, in German, *"This website is
being redone… soon you'll find lots of useful information about Square Dance with a
focus on inclusive dancing here."* So it is mid-rewrite rather than abandoned, but it
has been unavailable for months.

Working captures with content:

| | |
|---|---|
| Index | `web.archive.org/web/20250621111737/https://birgitrudolf.de/inclusive-dancing-calls/` |
| English PDFs | `web.archive.org/web/20250804220954/https://birgitrudolf.de/wp-content/uploads/2024/01/<NN>-<Call-Name>-1.pdf` |
| German PDFs | `web.archive.org/web/20250621112709/https://birgitrudolf.de/wp-content/uploads/2024/01/<NN>-<Call-Name>.pdf` |

Note the naming: **English files carry a `-1` suffix**, German ones do not.

### What exists, and in which language

| Page | Entries | Language |
|---|---|---|
| Basic I | 19 | **English** — items 01 → 11c only |
| Basic I | 38 | German — 01 → 16c and beyond, i.e. the full set |
| Basic II | 19 | German only — 33 Wheel Around → 48 Ferris Wheel |
| Mainstream | 22 | German only — 01 Cloverleaf → 19 Recycle |
| Plus | 29 | German only |
| Plus | 19 | **English** — partial |

**The English translation stalled part-way.** Basic I English stops at item 11c while
the German continues; Basic II and Mainstream have no English at all. Her own index
page says the material is offered "in German and English – in process –".

Fortunately the English that *does* exist covers almost the whole starter set:
**03a Dosado, 05a Promenade, 06 Allemande Left, 07 Arm Turns, 08a Right and Left
Grand, 10 Pass Thru**. Only Square Thru, Partner Trade, California Twirl and Star
Thru fall outside it.

### Local copies

`reference/inclusive-dancing/{en,de}/` — git-ignored like everything else here.
Currently six English and four German PDFs, the starter-set-relevant ones.

### Contact — and why you would

**Birgit Rudolf**, Luisenstr. 6, 53757 Sankt Augustin, Germany.
`birgitrudolf@t-online.de` · +49 151 72628452.
(Obfuscated on her site as `birgitrudolf(at)t-online(punkt)de`.)

There are three good reasons to write to her rather than just consume the archive:

1. **Permission is required for what we would want to do.** Her site notice states
   that reproduction, **Bearbeitung** (adaptation — which covers translation),
   distribution and any exploitation beyond the limits of copyright require her
   **written consent**, and that downloads and copies are permitted "only for
   private, non-commercial use". Private local reference is fine. Translating the
   German-only definitions, or building her adaptations into a shipped game, is not
   — not without asking.
2. **The English translation is unfinished and her site is being rebuilt.** This
   project has a concrete reason to want the rest in English and could plausibly
   offer to help produce it.
3. **She is the domain expert.** Question 3 in the planning brief — whether mobility
   aids change the *block vocabulary* rather than just the coefficients — is exactly
   the kind of thing to confirm with her rather than infer.

### Why this matters to the model, concretely

The Dosado definition already settles a design question the engine could not answer
on its own. Paraphrasing: blind or severely visually impaired dancers need **light
body contact**; wheelchair users **dance only with their hands — they stay in place
and high-five the dancer in front of them**, and dancing around each other while
moving forward is better avoided, ideally with slow music.

That is not a scaled or re-timed Dosado. It is a **different motion occupying the
same slot in the sequence** — which means adaptation reaches into ADR-0005's block
layer, not just the performance coefficients. See
`~/Development/work/square-dance-planning/briefs/dancer-size-and-accessibility.md`.

## Copyright posture

CALLERLAB documents are freely *downloadable* but not freely *redistributable*.
Keep them in git-ignored `reference/`, cite them, paraphrase them — never commit or
republish them (this repo is public).

**Birgit Rudolf's inclusive definitions are stricter and need naming separately.**
Her site notice permits downloads and copies "only for private, non-commercial use",
and requires written consent for reproduction, **adaptation (translation counts)**,
and distribution. Local reference: fine. Translating them, or shipping their content
in a game: **ask first.** Contact details are in the section above.
