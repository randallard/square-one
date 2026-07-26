/** Indexed access that fails loudly instead of leaning on a non-null assertion.
 *  `noUncheckedIndexedAccess` is on for a reason; suppressing it per-site in tests
 *  would train the habit of suppressing it everywhere. */
export function nth<T>(xs: readonly T[], i: number): T {
  const v = xs[i];
  if (v === undefined) {
    throw new Error(`expected an element at index ${String(i)}, but there are ${String(xs.length)}`);
  }
  return v;
}
