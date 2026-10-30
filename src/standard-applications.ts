/**
 * 🧪 Where each call is danced from: CALLERLAB's Standard Applications, as plain data
 * (2026-10-30). Exploratory, no ADR.
 *
 * Spec: `docs/spec/standard-applications.md`. Every call on the Basic and Mainstream lists that
 * the voice test knows (the-lot `src/voice/call-vocabulary.ts`, same ids; 94 since 10-30, when the
 * family members said in their own words joined the first 75), **whether or not this
 * engine dances it yet**. It is data a consumer can ask "what can be called from here?" without
 * any geometry: the-lot's voice matcher narrows 75 calls to the handful that are legal next.
 *
 * Three fields, from two places:
 *
 * - `from` and `arrangement` are CALLERLAB's, from the Standard Basic Applications (rev. August
 *   2022) and Standard Mainstream Applications (rev. May 2020) in `reference/callerlab/`.
 *   `arrangement` keeps their wording. Applications not listed are Extended, not illegal.
 * - `who` is who the comments say the call is directed to, when it isn't everyone.
 * - `to` is **ours, not CALLERLAB's**: the formation the call ends in, worked from the
 *   definitions. CALLERLAB publishes no ending table. Absent where it depends on what the caller
 *   adds (a fraction, where to stop) or wasn't settled; "same" where the call keeps the formation.
 *
 * A family the voice test says as one call (`circulate`, `run`, `fold`, `ladies-chain`) holds
 * every member's applications. Members said in their own words ("wrong way promenade",
 * "rollaway", "chain down the line", "quarter tag", plain "trade") are calls of their own.
 *
 * ---
 *
 * © 1991-2022 CALLERLAB, Inc. Topeka, KS, The International Association of Square Dance
 * Callers. Permission to reprint, republish, and create derivative works without royalty is
 * hereby granted provided this notice appears. Publication on the Internet of derivative works
 * without royalty is hereby granted, provided this notice appears. Permission to quote parts, or
 * all of, this document without royalty is hereby granted, provided this notice is included.
 * Information contained herein shall not be changed nor revised in any derivation or
 * publication. (Standard Mainstream Applications: © 1991-2020, same terms.)
 */

import { formationsHolding, type FormationId } from "./formations.js";

export interface StandardApplication {
  /** The starting formation, or "any" where CALLERLAB says "All Formations". */
  readonly from: FormationId | "any";
  /** CALLERLAB's arrangement wording. */
  readonly arrangement: string;
  /** Who the call is directed to, when it isn't everyone ("heads", "centers", "those facing"). */
  readonly who?: string;
  /** The formation it ends in. Ours, derived from the definitions; absent when it depends. */
  readonly to?: FormationId | "same";
}

export interface CallApplications {
  readonly program: "basic" | "mainstream";
  /** The CALLERLAB document's item, e.g. "Basic 10" or "Mainstream 13". */
  readonly item: string;
  readonly applications: readonly StandardApplication[];
}

type Extra = Pick<StandardApplication, "who" | "to">;
const a = (from: StandardApplication["from"], arrangement: string, extra: Extra = {}): StandardApplication => ({ from, arrangement, ...extra });
const basic = (item: number, applications: readonly StandardApplication[]): CallApplications => ({ program: "basic", item: `Basic ${String(item)}`, applications });
const mainstream = (item: number, applications: readonly StandardApplication[]): CallApplications => ({ program: "mainstream", item: `Mainstream ${String(item)}`, applications });

const ALL = "All Arrangements";
const NORMAL = "Normal Couples";
const ZERO = `"0" (Normal Couples)`;
const SAME = { to: "same" } as const;
const HEADS = "heads or sides";

export const STANDARD_APPLICATIONS = {
  // ── Basic, part 1 ────────────────────────────────────────────────────────────────────────────
  "circle-left": basic(1, [
    a("circle", ALL, SAME),
    a("squared-set", ALL, { to: "circle" }),
    a("squared-set", NORMAL, { who: "heads or sides, circle four a fraction" }),
    a("facing-lines", ALL, { to: "circle" }),
    a("eight-chain-thru", ZERO, { who: "each four" }),
  ]),
  "circle-right": basic(1, [
    a("circle", ALL, SAME),
    a("squared-set", ALL, { to: "circle" }),
    a("facing-lines", ALL, { to: "circle" }),
  ]),
  "forward-and-back": basic(2, [
    a("squared-set", ALL, SAME),
    a("facing-lines", ALL, SAME),
    a("circle", ALL, SAME),
    a("facing-couples", ALL, SAME),
  ]),
  dosado: basic(3, [
    a("facing-dancers", ALL, SAME),
    a("facing-couples", ALL, SAME),
    a("eight-chain-thru", ALL, SAME),
    a("squared-set", ALL, { who: HEADS, ...SAME }),
    a("rlg-circle", "Boys facing CCW, Girls facing CW", SAME),
    // 3b, Dosado to a Wave (listed after the Ocean Wave Family)
    a("eight-chain-thru", ZERO, { who: "dosado to a wave", to: "rh-parallel-waves" }),
    a("double-pass-thru", `"0", "4" (Normal Couples in the center)`, { who: "centers, dosado to a wave", to: "rh-quarter-tag" }),
    a("trade-by", `"0", "4" (Normal Couples in the center)`, { who: "centers, dosado to a wave" }),
  ]),
  swing: basic(4, [
    a("rlg-circle", "BGBG"),
    a("eight-chain-thru", `"0", "1/2", "1", or "2" (Opposite genders facing)`),
    a("rh-parallel-waves", `"0", "1/2", "1", or "2" (Opposite gender pairs)`),
    a("trade-by", ZERO),
    a("lines-facing-out", ZERO),
    a("squared-set", ALL),
    a("circle", ALL),
  ]),
  promenade: basic(5, [
    a("squared-set", NORMAL, { who: "heads or sides (full, 3/4, 1/2)", to: "squared-set" }),
    a("rlg-circle", "Boys facing CCW, Girls facing CW", { to: "promenade" }),
    a("lh-two-faced-lines", NORMAL, { to: "promenade" }),
    // 5b, Single File Promenade
    a("single-file-promenade", "BGBG or BBGG, all facing CCW", SAME),
    a("squared-set", NORMAL, { who: "four girls or four boys, inside" }),
    a("rlg-circle", "BGBG (all Boys facing one way and all Girls facing the other)", { who: "four boys or four girls, inside" }),
  ]),
  "allemande-left": basic(6, [
    a("circle", "BGBG (Normal)", { to: "rlg-circle" }),
    a("eight-chain-thru", ZERO, { to: "rlg-circle" }),
    a("trade-by", ZERO, { to: "rlg-circle" }),
    a("lines-facing-out", ZERO, { to: "rlg-circle" }),
    a("squared-set", ZERO, { to: "rlg-circle" }),
    a("lh-parallel-waves", `"0" (GBBG)`, { to: "rlg-circle" }),
    a("rh-center-star", "4 Boys / Heads / Sides in center Star", { to: "rlg-circle" }),
    a("rlg-circle", "Boys facing CW, Girls facing CCW", { to: "rlg-circle" }),
    a("eight-chain-thru", `"1", "2" (All 4 Girls in the center, or all 4 Boys in the center)`, { to: "rlg-circle" }),
  ]),
  "arm-turn": basic(7, [
    // 7a, Right Arm Turn
    a("lh-center-star", "4 Boys in center Star or Promenade"),
    a("single-file-promenade", "4 Boys in center Star or Promenade"),
    a("rlg-circle", "All 4 Boys facing one way, all 4 Girls facing the other way"),
    a("alamo-ring", "BGBG"),
    a("rh-parallel-waves", ALL),
    a("lh-parallel-waves", ALL),
    a("rh-columns", ALL),
    a("lh-columns", ALL),
    // 7b, Left Arm Turn
    a("rh-center-star", "4 Boys in center Star"),
  ]),
  "right-and-left-grand": basic(8, [
    a("rlg-circle", "BGBG, Boys facing CCW, Girls facing CW", { to: "rlg-circle" }),
    a("eight-chain-thru", `"1/2" (Half-Sashayed Couples)`, { to: "rlg-circle" }),
    a("trade-by", `"1/2" (Half-Sashayed Couples)`, { to: "rlg-circle" }),
    a("lines-facing-out", `"1/2" (Half-Sashayed Couples)`, { to: "rlg-circle" }),
    a("rh-parallel-waves", `"1/2" (Boys centers, Girls on ends)`, { to: "rlg-circle" }),
  ]),
  "right-hand-star": basic(9, [
    a("squared-set", NORMAL, { who: "heads, sides, boys, girls or all eight" }),
    a("circle", ALL, { who: "4 boys, 4 girls or all eight (circle moving CW)" }),
    a("eight-chain-thru", ZERO),
    a("rlg-circle", "BGBG, (all of one gender facing one way)"),
  ]),
  "left-hand-star": basic(9, [
    a("squared-set", NORMAL, { who: "heads, sides, boys, girls or all eight" }),
    a("double-pass-thru", "Heads, Sides, Boys or Girls in the center and active", { who: "centers" }),
    a("circle", ALL, { who: "4 boys, 4 girls or all eight (circle moving CCW)" }),
    a("rlg-circle", "BGBG, (Boys facing one way, Girls facing the other)"),
  ]),
  "pass-thru": basic(10, [
    a("facing-dancers", ALL),
    a("facing-lines", ALL, { to: "lines-facing-out" }),
    a("eight-chain-thru", ALL, { to: "trade-by" }),
    a("squared-set", ALL, { who: HEADS, to: "inverted-square" }),
    a("double-pass-thru", ALL, { who: "centers", to: "eight-chain-thru" }),
    a("trade-by", ALL, { who: "centers", to: "completed-double-pass-thru" }),
    a("rh-tidal-wave", ALL),
  ]),
  "half-sashay": basic(11, [
    a("squared-set", NORMAL, SAME),
    a("facing-lines", NORMAL, SAME),
    a("eight-chain-thru", NORMAL, SAME),
  ]),
  "u-turn-back": basic(12, [a("any", ALL, { who: "designated dancers or all eight" })]),
  separate: basic(13, [
    a("squared-set", NORMAL, { who: HEADS }),
    // 13b, Separate Around 1 or 2 to a Line
    a("inverted-square", ALL, { who: "those facing out, around 1 or 2 to a line", to: "facing-lines" }),
    a("trade-by", ALL, { who: "those facing out, around 1 to a line", to: "facing-lines" }),
    // 13c, ... and Come into the Middle
    a("inverted-square", NORMAL, { who: "those facing out, come into the middle" }),
    a("trade-by", ZERO, { who: "those facing out, come into the middle" }),
  ]),
  "split-two": basic(14, [a("eight-chain-thru", ALL)]),
  "courtesy-turn": basic(15, [
    a("couple-facing-out", NORMAL),
    a("lines-facing-out", ZERO, { to: "facing-lines" }),
    a("eight-chain-thru", `"1" (Girls in center with their left hand free)`),
  ]),
  "ladies-chain": basic(16, [
    // 16a, Two Ladies Chain
    a("squared-set", NORMAL, { who: HEADS, ...SAME }),
    a("facing-lines", ZERO, SAME),
    a("eight-chain-thru", "Arrangements where there are Normal Couples facing", SAME),
    a("double-pass-thru", "Arrangements where there are Normal Couples facing", { who: "centers", ...SAME }),
    a("trade-by", "Arrangements where there are Normal Couples facing", { who: "centers", ...SAME }),
    a("inverted-lines-ends-out", "Arrangements where there are Normal Couples facing", SAME),
    // 16b, Four Ladies Chain
    a("squared-set", NORMAL, { who: "four ladies", ...SAME }),
  ]),
  "do-paso": basic(17, [
    a("circle", "BGBG (Normal)"),
    a("rlg-circle", "BGBG, Boys facing CCW, Girls facing CW"),
    a("squared-set", NORMAL),
    a("rh-center-star", "Four Girls in center, Four Boys outside facing in or facing CCW"),
  ]),
  "lead-right": basic(18, [a("squared-set", NORMAL, { who: HEADS, to: "eight-chain-thru" })]),
  "lead-left": basic(18, [a("squared-set", NORMAL, { who: HEADS, to: "eight-chain-thru" })]),
  "veer-left": basic(19, [
    a("eight-chain-thru", ZERO, { to: "rh-two-faced-lines" }),
    a("double-pass-thru", `"0" or "4" (centers are Normal Couples)`, { who: "centers", to: "rh-quarter-line" }),
    a("trade-by", `"0" or "4" (centers are Normal Couples)`, { who: "centers" }),
    a("lh-two-faced-lines", ZERO),
  ]),
  "veer-right": basic(19, [
    a("rh-quarter-line", NORMAL, { who: "centers" }),
    a("rh-two-faced-lines", ZERO),
    a("eight-chain-thru", ZERO, { to: "lh-two-faced-lines" }),
  ]),
  "bend-the-line": basic(20, [
    a("rh-two-faced-lines", ALL, { to: "facing-lines" }),
    a("lh-two-faced-lines", ALL, { to: "facing-lines" }),
    a("rh-tidal-two-faced-line", ALL, { who: "each side or each four" }),
    a("lh-tidal-two-faced-line", ALL, { who: "each side or each four" }),
    a("lines-facing-out", ZERO, { to: "facing-lines" }),
    a("tidal-line", NORMAL, { who: "each side, or in each line of 4" }),
    a("tidal-line", ALL, { who: "line of eight" }),
  ]),
  circulate: basic(21, [
    // 21a, Boys / Girls / Ends / Centers Circulate
    a("rh-two-faced-lines", ALL, { who: "boys, girls, ends or centers", ...SAME }),
    a("lh-two-faced-lines", ALL, { who: "boys, girls, ends or centers", ...SAME }),
    a("rh-parallel-waves", ALL, { who: "boys, girls, ends or centers", ...SAME }),
    a("lh-parallel-waves", ALL, { who: "boys, girls, ends or centers", ...SAME }),
    // 21b, Couples Circulate; 21c, All Eight Circulate
    a("rh-two-faced-lines", ALL, { who: "couples or all eight", ...SAME }),
    a("lh-two-faced-lines", ALL, { who: "couples or all eight", ...SAME }),
    a("rh-parallel-waves", `"0" (Boys on ends, Girls in center)`, { who: "all eight", ...SAME }),
    // 21d, Single File or Column Circulate
    a("rh-columns", `"0", "1/2", "3", "4" (Not GGBB or BBGG)`, SAME),
    a("lh-columns", `"0", "1/2", "3", "4" (Not GGBB or BBGG)`, SAME),
    // 21e, Split Circulate; 21f, Box Circulate
    a("rh-parallel-waves", `"1" or "2" (All 4 Girls facing out, or all 4 Boys facing out)`, { who: "split circulate", ...SAME }),
    a("rh-quarter-box", "Normal Couples outside, Girls facing into Box", { who: "centers, box circulate", ...SAME }),
  ]),
  "right-and-left-thru": basic(22, [
    a("facing-couples", NORMAL, SAME),
    a("squared-set", NORMAL, { who: HEADS, ...SAME }),
    a("facing-lines", ZERO, SAME),
    a("eight-chain-thru", ZERO, SAME),
    // Mainstream 11, by the Ocean Wave Rule
    a("rh-tidal-wave", `"0" (Girls in center of each 4)`, { to: "facing-lines" }),
    a("rh-parallel-waves", `"0" (Boys on ends, Girls in center)`, { to: "eight-chain-thru" }),
  ]),
  "grand-square": basic(23, [a("squared-set", NORMAL, { who: HEADS, ...SAME })]),
  "star-thru": basic(24, [
    a("squared-set", NORMAL, { who: HEADS, to: "double-pass-thru" }),
    a("facing-lines", "Any Arrangement where the active dancers are facing a dancer of the opposite gender", { to: "eight-chain-thru" }),
    a("eight-chain-thru", "Any Arrangement where the active dancers are facing a dancer of the opposite gender", { to: "facing-lines" }),
    a("double-pass-thru", "Any Arrangement where the active dancers are facing a dancer of the opposite gender", { who: "centers" }),
    a("trade-by", "Any Arrangement where the active dancers are facing a dancer of the opposite gender", { who: "centers" }),
    a("inverted-lines-ends-in", "Any Arrangement where the active dancers are facing a dancer of the opposite gender", { who: "those facing" }),
    a("rlg-circle", "Any Arrangement where the active dancers are facing a dancer of the opposite gender"),
  ]),
  "double-pass-thru": basic(25, [
    a("double-pass-thru", ALL, { to: "completed-double-pass-thru" }),
    a("rh-quarter-tag", ALL, { to: "completed-double-pass-thru" }),
  ]),
  "first-couple-go-left": basic(26, [a("completed-double-pass-thru", ZERO, { to: "facing-lines" })]),
  "california-twirl": basic(27, [
    a("couple", "Any Normal Couple"),
    a("rh-two-faced-lines", ZERO, { who: "all eight, those facing in, or those facing out" }),
    a("lh-two-faced-lines", ZERO, { who: "all eight, those facing in, or those facing out" }),
    a("lines-facing-out", ZERO, { to: "facing-lines" }),
    a("lines-facing-out", "Normal Couple in the center", { who: "centers" }),
    a("trade-by", ZERO, { who: "outsides", to: "double-pass-thru" }),
    a("squared-set", NORMAL, { who: "heads, sides, or all eight" }),
    a("out-facing-square", NORMAL, { who: "heads, sides, or all eight" }),
    a("inverted-square", NORMAL, { who: "heads, sides, or all eight" }),
    a("completed-double-pass-thru", ZERO, { who: "all eight, centers, or ends" }),
    a("completed-double-pass-thru", `"3" (Leaders Normal) or "4" (Trailers Normal)`, { who: "the normal couples" }),
    a("double-pass-thru", `"3" (Normal Couple on outside)`, { who: "the normal couples" }),
  ]),
  "walk-around-the-corner": basic(28, [
    a("squared-set", NORMAL, SAME),
    a("circle", "BGBG (normal)", SAME),
  ]),
  "see-saw": basic(29, [a("rlg-circle", "BGBG with the Boys facing CCW, Girls facing CW", SAME)]),
  "square-thru": basic(30, [
    a("squared-set", NORMAL, { who: HEADS, to: "eight-chain-thru" }),
    a("inverted-square", "Normal Couples facing in", { who: "the couples facing in" }),
    a("facing-lines", ZERO, { to: "lines-facing-out" }),
    a("eight-chain-thru", ZERO, { to: "trade-by" }),
    a("double-pass-thru", "Normal Couples in the center", { who: "centers" }),
    a("trade-by", "Normal Couples in the center", { who: "centers" }),
    a("facing-couples", "Normal Couples facing", { who: "the facing normal couples" }),
  ]),
  "circle-to-a-line": basic(31, [a("eight-chain-thru", ZERO, { to: "facing-lines" })]),
  "dive-thru": basic(32, [a("eight-chain-thru", `"0" (Normal Couples), "4" (Normal Couples in the center)`, { to: "double-pass-thru" })]),

  // ── Basic, part 2 ────────────────────────────────────────────────────────────────────────────
  "wheel-around": basic(33, [
    a("promenade", NORMAL, { who: HEADS, to: "facing-lines" }),
    a("double-pass-thru", ZERO, { who: "centers" }),
    a("rh-two-faced-lines", ZERO, { who: "leaders" }),
    a("lh-two-faced-lines", ZERO, { who: "leaders" }),
    a("lines-facing-out", NORMAL, { to: "facing-lines" }),
    a("couple-facing-out", NORMAL),
  ]),
  "box-the-gnat": basic(34, [
    a("facing-dancers", "Opposite genders facing", SAME),
    a("squared-set", NORMAL, { who: HEADS, ...SAME }),
    a("inverted-square", "Opposite genders facing each other", { who: "those facing in", ...SAME }),
    a("facing-lines", `"0", "1/2", "1", "2"`, { who: "ends, centers or all eight", ...SAME }),
    a("eight-chain-thru", `"0", "1/2", "1", "2"`, SAME),
    a("trade-by", `"0", "1/2", "3", "4"`, { who: "centers", ...SAME }),
    a("double-pass-thru", `"0", "1/2", "3", "4"`, { who: "centers", ...SAME }),
    a("rlg-circle", "All 4 Boys facing one way, all 4 Girls facing the other way", SAME),
  ]),
  "partner-trade": basic(35, [
    a("completed-double-pass-thru", ZERO, { who: "leads or outsides" }),
    a("trade-by", ZERO, { who: "outsides", to: "double-pass-thru" }),
    a("lines-facing-out", ZERO, { to: "facing-lines" }),
    a("rh-two-faced-lines", ZERO, { who: "all, or the couple facing out" }),
    a("lh-two-faced-lines", ZERO, { who: "all, or the couple facing out" }),
    a("squared-set", NORMAL, { who: "heads, sides or all eight" }),
    a("inverted-square", NORMAL, { who: "heads, sides or all eight" }),
    a("out-facing-square", NORMAL, { who: "heads, sides or all eight" }),
  ]),
  "couples-trade": basic(35, [
    a("rh-two-faced-lines", ALL, SAME),
    a("lh-two-faced-lines", ALL, SAME),
  ]),
  "ocean-wave": basic(36, [
    // 36a, Step to a Wave
    a("eight-chain-thru", ALL, { to: "rh-parallel-waves" }),
    a("eight-chain-thru", ZERO, { who: "step to a left-hand wave", to: "lh-parallel-waves" }),
    a("double-pass-thru", ALL, { who: "those facing", to: "rh-quarter-tag" }),
    a("trade-by", ALL, { who: "those facing", to: "rh-three-quarter-tag" }),
    a("facing-lines", ALL, { who: "step to a tidal wave", to: "rh-tidal-wave" }),
    // 36b, Balance
    a("rh-parallel-waves", ALL, SAME),
    a("lh-parallel-waves", ALL, SAME),
  ]),
  "alamo-style": basic(37, [
    a("squared-set", NORMAL, { to: "alamo-ring" }),
    a("circle", "BGBG", { to: "alamo-ring" }),
    a("alamo-ring", "BGBG", { who: "balance", ...SAME }),
  ]),
  "swing-thru": basic(38, [
    a("rh-parallel-waves", ALL, SAME),
    a("eight-chain-thru", ALL, { to: "rh-parallel-waves" }),
    a("rh-quarter-tag", ALL, { who: "centers", ...SAME }),
    a("rh-three-quarter-tag", ALL, { who: "centers", ...SAME }),
    a("double-pass-thru", `"0", "4" (Normal Couples in center)`, { who: "centers" }),
    a("trade-by", `"0", "4" (Normal Couples in center)`, { who: "centers" }),
    a("alamo-ring", ALL, SAME),
  ]),
  "left-swing-thru": basic(38, [
    a("lh-parallel-waves", ALL, SAME),
    a("eight-chain-thru", ALL, { to: "lh-parallel-waves" }),
    a("alamo-ring", "BGBG", SAME),
  ]),
  run: basic(39, [
    // 39a, Boys / Girls Run
    a("rh-parallel-waves", `"0", "1/2" (4 Girls in the center, or 4 Boys in the center)`),
    a("lh-parallel-waves", `"0", "1/2" (4 Girls in the center, or 4 Boys in the center)`),
    a("rh-parallel-waves", `"1", "2" (All 4 Girls facing out, or all 4 Boys facing out)`, { who: "those facing out" }),
    a("lh-parallel-waves", `"1", "2" (All 4 Girls facing out, or all 4 Boys facing out)`, { who: "those facing out" }),
    a("rh-two-faced-lines", `"0", "1/2", "3", "4" (no BB or GG couples)`),
    a("lh-two-faced-lines", `"0", "1/2", "3", "4" (no BB or GG couples)`),
    a("alamo-ring", "BGBG – All 4 Boys or all 4 Girls facing in"),
    a("rh-columns", `"0", "1/2", "1", "2" (Mixed gender pairs)`),
    a("lh-columns", `"0", "1/2", "1", "2" (Mixed gender pairs)`),
    a("rh-tidal-wave", `"0", "1/2", "1", "2" (Mixed gender pairs)`),
    a("lh-tidal-wave", `"0", "1/2", "1", "2" (Mixed gender pairs)`),
    a("rh-quarter-tag", `"0", "1/2", "3", "4" (Mixed gender wave)`, { who: "centers of the wave" }),
    a("lh-quarter-tag", `"0", "1/2", "3", "4" (Mixed gender wave)`, { who: "centers of the wave" }),
    a("rh-three-quarter-tag", `"0", "1/2", "3", "4" (Mixed gender wave)`, { who: "centers of the wave" }),
    a("lh-three-quarter-tag", `"0", "1/2", "3", "4" (Mixed gender wave)`, { who: "centers of the wave" }),
    // 39b, Centers Run; 39c, Ends Run
    a("rh-parallel-waves", ALL, { who: "centers or ends", to: "rh-two-faced-lines" }),
    a("lh-parallel-waves", ALL, { who: "centers or ends" }),
    a("rh-quarter-tag", ALL, { who: "centers or ends of the wave" }),
    a("lh-quarter-tag", ALL, { who: "centers or ends of the wave" }),
    a("rh-three-quarter-tag", ALL, { who: "centers or ends of the wave" }),
    a("lh-three-quarter-tag", ALL, { who: "centers or ends of the wave" }),
  ]),
  "pass-the-ocean": basic(40, [
    a("squared-set", NORMAL, { who: HEADS }),
    a("facing-lines", ZERO, { to: "rh-parallel-waves" }),
    a("eight-chain-thru", ZERO),
    a("facing-couples", NORMAL),
  ]),
  extend: basic(41, [
    a("rh-quarter-tag", ALL, { to: "rh-parallel-waves" }),
    a("lh-quarter-tag", `"0" (Normal Couple outside, Boys in center of the Wave) or "1" or "2" (same gender wave)`, { to: "lh-parallel-waves" }),
    a("rh-parallel-waves", `"0" or "1/2" (all of one gender in the center)`, { to: "rh-three-quarter-tag" }),
    a("lh-parallel-waves", `"0" or "1/2" (all of one gender in the center)`, { to: "lh-three-quarter-tag" }),
    a("double-pass-thru", ZERO, { to: "rh-quarter-tag" }),
    a("rh-three-quarter-tag", `"0" (Extend results in Normal Couples)`, { to: "completed-double-pass-thru" }),
    a("lh-three-quarter-tag", `"0" (Extend results in Normal Couples)`, { to: "completed-double-pass-thru" }),
  ]),
  "wheel-and-deal": basic(42, [
    a("lines-facing-out", ZERO, { to: "double-pass-thru" }),
    a("rh-two-faced-lines", ZERO, { to: "eight-chain-thru" }),
    a("rh-tidal-two-faced-line", ZERO, { who: "each four" }),
    a("lh-tidal-two-faced-line", ZERO, { who: "each four" }),
  ]),
  zoom: basic(43, [a("double-pass-thru", ALL, SAME)]),
  flutterwheel: basic(44, [
    a("facing-lines", ZERO, SAME),
    a("squared-set", NORMAL, { who: HEADS, ...SAME }),
  ]),
  "reverse-flutterwheel": basic(44, [
    a("facing-lines", ZERO, SAME),
    a("squared-set", NORMAL, { who: HEADS, ...SAME }),
  ]),
  // A suffix: the formations are the start of the call pair it ends ("Flutterwheel and Sweep a Quarter").
  "sweep-a-quarter": basic(45, [
    a("facing-lines", ZERO),
    a("eight-chain-thru", ZERO),
    a("rh-two-faced-lines", ZERO),
    a("lh-two-faced-lines", ZERO),
    a("squared-set", NORMAL, { who: HEADS }),
    a("trade-by", `"0" or "4" (Normal Couples in center)`, { who: "centers" }),
    a("double-pass-thru", `"0" or "4" (Normal Couples in center)`, { who: "centers" }),
    a("rh-parallel-waves", `"0" (Girls in center)`),
  ]),
  "trade-by": basic(46, [
    a("trade-by", `"0" or "3" (out-facers are Normal Couples)`, { to: "eight-chain-thru" }),
    a("rh-three-quarter-tag", `"0" or "3" (out-facers are Normal Couples)`),
  ]),
  "touch-a-quarter": basic(47, [
    a("squared-set", NORMAL, { who: HEADS, to: "rh-quarter-box" }),
    a("facing-lines", ALL, { to: "rh-columns" }),
    a("eight-chain-thru", ALL, { to: "rh-columns" }),
    a("rlg-circle", ALL, { to: "alamo-ring" }),
    a("double-pass-thru", ALL, { who: "those facing" }),
    a("trade-by", ALL, { who: "those facing" }),
    a("inverted-square", ALL, { who: "those facing" }),
  ]),
  "ferris-wheel": basic(48, [
    a("rh-two-faced-lines", ALL, { to: "double-pass-thru" }),
    a("lh-two-faced-lines", ALL, { to: "double-pass-thru" }),
  ]),

  // ── Basic: family members said in their own words (2026-10-30) ─────────────────────────────
  // Ryan's free run said "Chain down the line", which the first 75 left out with these others.
  "wrong-way-promenade": basic(5, [
    a("squared-set", NORMAL, { who: "heads or sides (3/4)", to: "squared-set" }),
    a("rh-two-faced-lines", NORMAL, { to: "wrong-way-promenade" }),
    a("completed-double-pass-thru", "Normal Couples (in the correct order)", { who: "after first couple go right, next go right", to: "wrong-way-promenade" }),
  ]),
  "star-promenade": basic(5, [
    a("lh-center-star", "4 Boys or 4 Girls in the center"),
    a("rh-center-star", "4 Boys or 4 Girls in the center"),
  ]),
  "weave-the-ring": basic(8, [a("rlg-circle", "BGBG, Boys facing CCW, Girls facing CW", SAME)]),
  "wrong-way-grand": basic(8, [a("rlg-circle", "BGBG, Boys facing CW, Girls CCW", SAME)]),
  rollaway: basic(11, [
    a("couple", "Normal Couples", SAME),
    a("squared-set", NORMAL, SAME),
    a("facing-lines", NORMAL, SAME),
    a("eight-chain-thru", ZERO, SAME),
    a("circle", "BGBG (Normal)", SAME),
  ]),
  "ladies-in-men-sashay": basic(11, [a("circle", "BGBG (Normal)", { to: "circle" })]),
  backtrack: basic(12, [
    a("single-file-promenade", "BGBG", { who: "boys or girls" }),
    a("rh-center-star", "4 Boys or 4 Girls in the center", { who: "the rim (outside) dancers" }),
    a("lh-center-star", "4 Boys or 4 Girls in the center", { who: "the rim (outside) dancers" }),
  ]),
  "chain-down-the-line": basic(16, [
    a("rh-two-faced-lines", ZERO, { to: "facing-lines" }),
    a("lh-parallel-waves", `"1/2" (Boys on ends, Girls in center)`),
  ]),
  "left-square-thru": basic(30, [
    a("squared-set", NORMAL, { who: HEADS, to: "eight-chain-thru" }),
    a("eight-chain-thru", ZERO, { to: "trade-by" }),
  ]),
  // Added in 2021; CALLERLAB lists these as likely, not yet Standard.
  "reverse-wheel-around": basic(33, [
    a("wrong-way-promenade", NORMAL, { who: HEADS, to: "facing-lines" }),
    a("double-pass-thru", ZERO, { who: "centers" }),
  ]),
  // 35a, (Named Dancers) Trade
  trade: basic(35, [
    a("rh-parallel-waves", `"0", "1/2", "3", "4" (same gender in center or together)`, { who: "boys or girls", ...SAME }),
    a("lh-parallel-waves", `"0", "1/2", "3", "4" (same gender in center or together)`, { who: "boys or girls", ...SAME }),
    a("rh-parallel-waves", `"1", "2" (Girls or Boys facing out and those dancers active)`, { who: "boys or girls" }),
    a("lh-parallel-waves", `"1", "2" (Girls or Boys facing out and those dancers active)`, { who: "boys or girls" }),
    a("rh-two-faced-lines", `"0", "1/2" (Normal or Half-Sashayed Couples)`, { who: "boys or girls" }),
    a("lh-two-faced-lines", `"0", "1/2" (Normal or Half-Sashayed Couples)`, { who: "boys or girls" }),
    a("rh-columns", `"3", "4" (4 of same gender in center)`, { who: "boys or girls" }),
    a("lh-columns", `"3", "4" (4 of same gender in center)`, { who: "boys or girls" }),
    a("rh-tidal-wave", ALL, { who: "each four or the center four" }),
    a("lh-tidal-wave", ALL, { who: "each four or the center four" }),
    a("rh-quarter-tag", `"0", "1/2", "3", "4" (Mixed genders in center wave)`, { who: "boys or girls in the center wave", ...SAME }),
    a("lh-quarter-tag", `"0", "1/2", "3", "4" (Mixed genders in center wave)`, { who: "boys or girls in the center wave", ...SAME }),
    a("rh-three-quarter-tag", `"0", "1/2", "3", "4" (Mixed genders in center wave)`, { who: "boys or girls in the center wave", ...SAME }),
    a("lh-three-quarter-tag", `"0", "1/2", "3", "4" (Mixed genders in center wave)`, { who: "boys or girls in the center wave", ...SAME }),
    a("rh-parallel-waves", ALL, { who: "centers, ends or everyone", ...SAME }),
    a("lh-parallel-waves", ALL, { who: "centers, ends or everyone", ...SAME }),
    a("rh-two-faced-lines", ALL, { who: "centers, ends or everyone" }),
    a("lh-two-faced-lines", ALL, { who: "centers, ends or everyone" }),
    a("rh-columns", ALL, { who: "centers, ends or everyone" }),
    a("lh-columns", ALL, { who: "centers, ends or everyone" }),
    a("lines-facing-out", "Ends or centers are a Normal Couple", { who: "ends or centers" }),
    a("rh-quarter-tag", ALL, { who: "centers or ends of the center wave", ...SAME }),
    a("lh-quarter-tag", ALL, { who: "centers or ends of the center wave", ...SAME }),
    a("rh-three-quarter-tag", ALL, { who: "centers or ends of the center wave", ...SAME }),
    a("lh-three-quarter-tag", ALL, { who: "centers or ends of the center wave", ...SAME }),
  ]),
  // 39d, Centers Cross Run (39e, Ends Cross Run: no Standard Application)
  "cross-run": basic(39, [
    a("lh-parallel-waves", `"0" (Boys in center, Girls on ends)`, { who: "centers" }),
    a("lh-parallel-waves", `"1/2" (Boys on ends, Girls in center)`, { who: "centers" }),
    a("rh-parallel-waves", `"0" (Girls in center, Boys on ends)`, { who: "centers" }),
  ]),

  // ── Mainstream ───────────────────────────────────────────────────────────────────────────────
  cloverleaf: mainstream(1, [
    a("completed-double-pass-thru", ALL, { to: "double-pass-thru" }),
    a("inverted-square", ALL, { who: "those facing out" }),
    a("trade-by", ALL, { who: "those facing out" }),
  ]),
  "turn-thru": mainstream(2, [
    a("rlg-circle", "BGBG (Boys facing CCW, Girls facing CW)"),
    a("wrong-way-thar", "4 Boys in the center"),
    a("rh-parallel-waves", `"1/2" (Boys in center, Girls on end)`, { who: "centers" }),
    a("rh-quarter-tag", `"3" (Boys in very center, Normal Couples outside)`, { who: "the wave" }),
    a("eight-chain-thru", ZERO, { to: "trade-by" }),
  ]),
  // Only as Turn Thru's variation: after a right pull-by in a Right and Left Grand.
  "left-turn-thru": mainstream(2, [a("rlg-circle", "BGBG (Boys facing CCW, Girls facing CW)")]),
  "eight-chain-thru": mainstream(3, [a("eight-chain-thru", ZERO, SAME)]),
  "pass-to-the-center": mainstream(4, [
    a("eight-chain-thru", ZERO, { to: "double-pass-thru" }),
    a("eight-chain-thru", `"4" (Normal Couple in center)`, { to: "double-pass-thru" }),
  ]),
  "single-hinge": mainstream(8, [
    a("rh-parallel-waves", ALL, { to: "rh-columns" }),
    a("lh-parallel-waves", ALL, { to: "lh-columns" }),
    a("rh-columns", ALL),
    a("lh-columns", ALL),
    a("rh-tidal-wave", ALL, { to: "rh-columns" }),
    a("lh-tidal-wave", ALL, { to: "lh-columns" }),
    a("rh-two-faced-lines", ALL, { who: "centers" }),
  ]),
  "couples-hinge": mainstream(8, [
    a("rh-two-faced-lines", ZERO),
    a("lh-two-faced-lines", ZERO),
    a("rh-tidal-two-faced-line", ZERO),
    a("lh-tidal-two-faced-line", ZERO),
  ]),
  "centers-in": mainstream(9, [a("completed-double-pass-thru", ALL, { to: "lines-facing-out" })]),
  "cast-off-three-quarters": mainstream(10, [
    a("lines-facing-out", ALL, { to: "facing-lines" }),
    a("rh-columns", `"0" or "1/2" (BGBG or GBGB)`),
    a("lh-columns", `"0" or "1/2" (BGBG or GBGB)`),
    a("rh-parallel-waves", `"0", "1/2", "1" or "2" (not BBGG or GGBB)`),
    a("lh-parallel-waves", `"0", "1/2", "1" or "2" (not BBGG or GGBB)`),
  ]),
  "spin-the-top": mainstream(11, [
    a("rh-parallel-waves", `"1/2" (Girls on ends, Boys in center)`, SAME),
    a("rh-tidal-wave", `"1/2" (Two GBBG waves)`, { who: "each four" }),
    a("rh-tidal-wave", `"0" (GBBG wave in center)`, { who: "center four" }),
    a("rh-quarter-tag", `"1/2", "3" (GBBG wave in the center)`, { who: "the center wave" }),
  ]),
  "walk-and-dodge": mainstream(12, [
    a("rh-parallel-waves", `"1" (Boys facing in, Girls facing out) or "2" (Girls facing in, Boys facing out)`),
    a("rh-quarter-box", "Center Box with Boys facing in and Girls facing out", { who: "centers" }),
    a("facing-lines", ZERO, { who: "a named walker and dodger" }),
  ]),
  "slide-thru": mainstream(13, [
    a("eight-chain-thru", ZERO, { to: "facing-lines" }),
    a("facing-lines", `"0", "1" (Normal Couples or BBGG)`, { to: "eight-chain-thru" }),
    a("squared-set", "Normal Couples or Half-Sashayed Couples", { who: HEADS, to: "double-pass-thru" }),
    a("double-pass-thru", "Arrangements with Normal Couples facing in the center", { who: "centers" }),
    a("trade-by", "Arrangements with Normal Couples facing in the center", { who: "centers" }),
  ]),
  fold: mainstream(14, [
    // 14a-c, Boys / Girls / Ends / Centers Fold
    a("rh-parallel-waves", "Boys on ends, Girls in center (Boys Fold); Girls on ends, Boys in center (Girls Fold); All Arrangements (Ends or Centers Fold)"),
    a("lh-parallel-waves", "Boys on ends, Girls in center (Boys Fold); Girls on ends, Boys in center (Girls Fold); All Arrangements (Ends or Centers Fold)"),
    a("rh-two-faced-lines", "Boys on ends, Girls in center (Boys Fold); Girls on ends, Boys in center (Girls Fold); All Arrangements (Ends or Centers Fold)"),
    a("lh-two-faced-lines", "Boys on ends, Girls in center (Boys Fold); Girls on ends, Boys in center (Girls Fold); All Arrangements (Ends or Centers Fold)"),
    a("lines-facing-out", "Boys on ends, Girls in center (Boys Fold); Girls on ends, Boys in center (Girls Fold); All Arrangements (Ends or Centers Fold)"),
    a("rh-parallel-waves", `"2" (Boys facing out), Boys Fold; "1" (Girls facing out), Girls Fold`),
  ]),
  "cross-fold": mainstream(14, [
    // 14d, Centers Cross Fold
    a("rh-parallel-waves", `"0" or "1/2" (either all four Boys in the center, or all four Girls in the center)`, { who: "centers" }),
    a("lh-parallel-waves", `"0" or "1/2" (either all four Boys in the center, or all four Girls in the center)`, { who: "centers" }),
    // 14e, Ends Cross Fold
    a("rh-parallel-waves", `"0" (Girls in the center)`, { who: "ends" }),
    a("lines-facing-out", `"1" (BBGG)`, { who: "ends" }),
  ]),
  "dixie-style": mainstream(15, [
    a("facing-lines", ZERO, { to: "lh-parallel-waves" }),
    a("squared-set", NORMAL, { who: HEADS }),
    a("double-pass-thru", `"1" (Girls in center)`),
  ]),
  "spin-chain-thru": mainstream(16, [
    a("rh-parallel-waves", `"0" (Boys as ends and Girls as centers)`, SAME),
    a("rh-parallel-waves", `"1/2" (Girls as ends and Boys as centers)`, SAME),
  ]),
  "tag-the-line": mainstream(17, [
    a("rh-two-faced-lines", ALL, { to: "completed-double-pass-thru" }),
    a("lines-facing-out", ALL, { to: "completed-double-pass-thru" }),
  ]),
  "half-tag": mainstream(17, [
    a("rh-two-faced-lines", `"0" (Normal Couples); Other Arrangements`, { to: "rh-parallel-waves" }),
    a("lines-facing-out", `"1" or "2" (Same gender couples)`),
  ]),
  "scoot-back": mainstream(18, [
    a("rh-parallel-waves", `"1" or "2" (All 4 Girls facing out, or all 4 Boys facing out)`, SAME),
    a("lh-parallel-waves", "All Arrangements, but call directed only to the centers", { who: "centers" }),
    a("rh-two-faced-lines", "All Arrangements, but call directed only to the centers", { who: "centers" }),
  ]),
  recycle: mainstream(19, [
    a("rh-parallel-waves", `"0" (Boys on ends, Girls in center)`),
    a("rh-quarter-tag", `"0" or "4" (center Wave is BGGB)`, { who: "the center wave" }),
    a("rh-three-quarter-tag", `"0" or "4" (center Wave is BGGB)`, { who: "the center wave" }),
    a("rh-tidal-wave", `"0" (Two BGGB waves)`, { who: "each four" }),
    a("lh-parallel-waves", `"0" (Girls on ends, Boys in center)`),
  ]),
  // ── Mainstream: family members said in their own words (2026-10-30) ────────────────────────
  // 5a, Allemande Thar; 5b, Allemande Left to an Allemande Thar
  "allemande-thar": mainstream(5, [
    a("thar", "4 Boys in center", SAME),
    a("squared-set", NORMAL, { who: "allemande left to an allemande thar", to: "thar" }),
    a("circle", NORMAL, { who: "allemande left to an allemande thar", to: "thar" }),
    a("rlg-circle", "BGBG with Boys facing CW, and Girls facing CCW", { who: "allemande left to an allemande thar", to: "thar" }),
    a("eight-chain-thru", ZERO, { who: "allemande left to an allemande thar", to: "thar" }),
  ]),
  "wrong-way-thar": mainstream(5, [a("wrong-way-thar", "4 Boys in center", SAME)]),
  "slip-the-clutch": mainstream(6, [
    a("thar", "4 Boys in center"),
    a("wrong-way-thar", "4 Boys in center"),
  ]),
  "shoot-the-star": mainstream(7, [
    a("thar", "4 Boys in center"),
    a("wrong-way-thar", "4 Boys in center"),
  ]),
  "shoot-the-star-full-around": mainstream(7, [a("thar", "4 Boys in center")]),
  // 17b, Fraction Tag: too new for any application to be Standard; these are "among those in use".
  "quarter-tag": mainstream(17, [
    a("rh-two-faced-lines", `"0" or "1/2" (Both Normal or both Half-Sashayed Couples)`, { to: "rh-quarter-tag" }),
    a("lh-parallel-waves", `"0" or "1/2" (Boys or Girls in center)`),
    a("lines-facing-out", `"1" (BBGG)`, { to: "rh-quarter-tag" }),
  ]),
  "three-quarter-tag": mainstream(17, [
    a("rh-two-faced-lines", `"0" or "1/2" (Both Normal or both Half-Sashayed Couples)`, { to: "rh-three-quarter-tag" }),
    a("lines-facing-out", `"1" (BBGG)`, { to: "rh-three-quarter-tag" }),
  ]),
} as const satisfies Readonly<Record<string, CallApplications>>;

export type ApplicationCallId = keyof typeof STANDARD_APPLICATIONS;

// Cast (any-registry): `Object.keys` returns `string[]`; the record is a const object, so its keys are exactly `ApplicationCallId`.
const CALL_IDS = Object.keys(STANDARD_APPLICATIONS) as readonly ApplicationCallId[];

/** Is this application danced from `formation`, directly or because the formation holds its unit? */
function appliesIn(app: StandardApplication, formation: FormationId): boolean {
  return app.from === "any" || formationsHolding(app.from).includes(formation);
}

/** Every call with a Standard Application from `formation`, in the documents' teaching order. */
export function callsFrom(formation: FormationId): readonly ApplicationCallId[] {
  return CALL_IDS.filter((id) => STANDARD_APPLICATIONS[id].applications.some((app) => appliesIn(app, formation)));
}

/**
 * The formations `call` can end in when danced from `formation`: one per application from there
 * that knows its ending, "same" resolved. Empty when the call isn't standard from there or no
 * application from there says how it ends.
 */
export function endingsFrom(call: ApplicationCallId, formation: FormationId): readonly FormationId[] {
  const ends = STANDARD_APPLICATIONS[call].applications
    .filter((app) => appliesIn(app, formation))
    .flatMap((app) => (app.to === undefined ? [] : [app.to === "same" ? formation : app.to]));
  return [...new Set(ends)];
}
