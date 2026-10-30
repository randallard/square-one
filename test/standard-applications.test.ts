import { describe, expect, it } from "vitest";
import { CALLS } from "../src/calls.js";
import { FORMATIONS, type FormationId } from "../src/formations.js";
import { callsFrom, endingsFrom, STANDARD_APPLICATIONS, type ApplicationCallId } from "../src/standard-applications.js";

// Cast (any-registry): a const object's keys are exactly its key type; `Object.keys` says `string[]`.
const ids = Object.keys(STANDARD_APPLICATIONS) as ApplicationCallId[];

describe("🧪 Standard Applications — where each call is danced from (2026-10-30)", () => {
  it("holds all 94 calls the voice test knows, each with at least one application", () => {
    expect(ids).toHaveLength(94);
    for (const id of ids) expect(STANDARD_APPLICATIONS[id].applications.length, id).toBeGreaterThan(0);
  });

  it("covers every call the engine dances", () => {
    for (const name of Object.keys(CALLS)) expect(ids).toContain(name);
  });

  it("every ending can be called on from: some call is standard from it", () => {
    const endings = new Set(ids.flatMap((id) => STANDARD_APPLICATIONS[id].applications.flatMap((app) => (app.to === undefined || app.to === "same" ? [] : [app.to]))));
    for (const end of endings) expect(callsFrom(end).length, end).toBeGreaterThan(0);
  });

  it("from Eight Chain Thru: the facing-couples calls, not the two-faced-line ones", () => {
    const legal = callsFrom("eight-chain-thru");
    for (const id of ["pass-thru", "dosado", "swing-thru", "star-thru", "right-and-left-thru", "touch-a-quarter"] as const) expect(legal).toContain(id);
    for (const id of ["ferris-wheel", "bend-the-line", "couples-trade", "recycle"] as const) expect(legal).not.toContain(id);
  });

  it("a unit is legal wherever it's held: Dosado from 'any facing dancers' is legal from Facing Lines", () => {
    expect(callsFrom("facing-lines")).toContain("dosado");
    expect(callsFrom("facing-lines")).toContain("box-the-gnat");
  });

  it("U-Turn Back is from every formation", () => {
    // Cast (any-registry): FORMATIONS is a const object, so its keys are exactly `FormationId`.
    for (const f of Object.keys(FORMATIONS) as FormationId[]) expect(callsFrom(f)).toContain("u-turn-back");
  });

  it("'same' resolves to the formation it was danced from", () => {
    // Dosado to a Wave is filed under Dosado, so from Eight Chain Thru it can end either way.
    expect(endingsFrom("dosado", "eight-chain-thru")).toEqual(["eight-chain-thru", "rh-parallel-waves"]);
    expect(endingsFrom("dosado", "facing-lines")).toEqual(["facing-lines"]);
    expect(endingsFrom("couples-trade", "rh-two-faced-lines")).toEqual(["rh-two-faced-lines"]);
  });

  it("a chain walks: Heads Lead Right, Pass Thru, Trade By, Swing Thru, Boys Run, Ferris Wheel", () => {
    const chain: readonly [ApplicationCallId, FormationId][] = [
      ["lead-right", "eight-chain-thru"],
      ["pass-thru", "trade-by"],
      ["trade-by", "eight-chain-thru"],
      ["swing-thru", "rh-parallel-waves"],
      ["run", "rh-two-faced-lines"],
      ["ferris-wheel", "double-pass-thru"],
    ];
    let at: FormationId = "squared-set";
    for (const [call, next] of chain) {
      expect(callsFrom(at), `${call} from ${at}`).toContain(call);
      expect(endingsFrom(call, at), `${call} from ${at}`).toContain(next);
      at = next;
    }
  });

  it("not standard from there: no endings", () => {
    expect(endingsFrom("ferris-wheel", "eight-chain-thru")).toEqual([]);
  });
});
