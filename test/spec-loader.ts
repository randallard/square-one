/**
 * Reads the worked examples out of `docs/spec/**` and turns them into conformance
 * fixtures (ADR-0009).
 *
 * This is **test-only**. Nothing in `src/` reads markdown; the published build is
 * unaffected. The markdown is authoritative for the examples it contains, because
 * it is the artifact that gets reviewed under the talk-first cadence — so the code
 * conforms to it, not the reverse.
 *
 * The convention it keys off (documented in `docs/spec/blocks/README.md`):
 *
 * ```
 * `blockname(arg, arg, …)` — N beats[; any extra notes]:
 *
 * | Beat | x | y | Doing |
 * ```
 *
 * A signature line whose table does not match the convention is an **error**, not a
 * skip. A silently ignored fixture looks like passing coverage, which is worse than
 * having no loader at all.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SPEC_ROOT = fileURLToPath(new URL("../docs/spec", import.meta.url));

export interface SpecRow {
  readonly beat: number;
  readonly x: number;
  readonly y: number;
  /** Degrees CCW from `+x`, or `undefined` when the table omits the column
   *  (facing is constant for that block and stated in prose). */
  readonly facing: number | undefined;
}

export interface SpecVector {
  readonly file: string;
  readonly signature: string;
  readonly block: string;
  readonly args: readonly string[];
  readonly beats: number;
  readonly rows: readonly SpecRow[];
}

/** `` `pass(forward, right, lane)` — 2 beats: `` — em dash, optional trailing notes. */
const SIGNATURE = /^`([a-z-]+)\(([^)]*)\)`\s*[—-]\s*([\d.]+)\s*beats?\b/;

/** The specs use U+2212 MINUS SIGN in cardinals (`−y`), not a hyphen. */
const CARDINAL: Readonly<Record<string, number>> = {
  "+x": 0,
  "+y": 90,
  "-x": 180,
  "-y": 270,
};

function normaliseMinus(s: string): string {
  return s.replace(/−/g, "-");
}

/** Parse a facing cell. Cells may carry trailing prose (`+x→rotating`), so only the
 *  leading cardinal token is read. */
function parseFacing(cell: string): number | undefined {
  const token = normaliseMinus(cell).trim().match(/^[+-][xy]/);
  if (token === null) return undefined;
  return CARDINAL[token[0]];
}

function parseNumber(cell: string): number | undefined {
  const n = Number(normaliseMinus(cell).trim());
  return Number.isFinite(n) ? n : undefined;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

function relative(file: string): string {
  return file.slice(SPEC_ROOT.length + 1);
}

/**
 * Extract every waypoint-table fixture under `docs/spec/`.
 *
 * @throws if a signature line is not followed by a well-formed table.
 */
export function loadSpecVectors(root: string = SPEC_ROOT): SpecVector[] {
  const vectors: SpecVector[] = [];

  for (const file of walk(root).sort()) {
    const lines = readFileSync(file, "utf8").split("\n");

    lines.forEach((line, i) => {
      const sig = SIGNATURE.exec(line.trim());
      if (sig === null) return;

      const [, block = "", rawArgs = "", rawBeats = ""] = sig;
      const signature = `${block}(${rawArgs})`;

      // The table header is the next non-blank line.
      let j = i + 1;
      while (j < lines.length && lines[j]?.trim() === "") j += 1;

      const header = lines[j]?.trim() ?? "";
      if (!header.startsWith("| Beat |")) {
        throw new Error(
          `${relative(file)}: signature \`${signature}\` is not followed by a ` +
            `waypoint table (found: ${header || "end of file"}). ` +
            `See docs/spec/blocks/README.md for the convention.`,
        );
      }

      const cols = header.split("|").map((c) => c.trim()).filter((c) => c !== "");
      const facingCol = cols.indexOf("Facing");

      const rows: SpecRow[] = [];
      // Skip the header and its `|---|` separator.
      for (let k = j + 2; k < lines.length; k += 1) {
        const row = lines[k]?.trim() ?? "";
        if (!row.startsWith("|")) break;

        const cells = row.split("|").slice(1, -1).map((c) => c.trim());
        const beat = parseNumber(cells[0] ?? "");
        const x = parseNumber(cells[1] ?? "");
        const y = parseNumber(cells[2] ?? "");

        if (beat === undefined || x === undefined || y === undefined) {
          throw new Error(
            `${relative(file)}: \`${signature}\` row ${String(rows.length + 1)} ` +
              `has an unparseable Beat/x/y cell: ${row}`,
          );
        }

        rows.push({
          beat,
          x,
          y,
          facing: facingCol >= 0 ? parseFacing(cells[facingCol] ?? "") : undefined,
        });
      }

      if (rows.length === 0) {
        throw new Error(`${relative(file)}: \`${signature}\` has an empty waypoint table`);
      }

      vectors.push({
        file: relative(file),
        signature,
        block,
        args: rawArgs.split(",").map((a) => a.trim()).filter((a) => a !== ""),
        beats: Number(rawBeats),
        rows,
      });
    });
  }

  return vectors;
}
