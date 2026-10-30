# `any` / `as` registry

Every `any`, and every `as` other than `as const`, in `src/` and `test/`, with why it's sound
([ADR-0027](adr/0027-every-cast-is-registered.md)). Each also carries the reason inline.

| Where | Cast | Why it's sound |
|---|---|---|
| `src/calls.ts`, `sized` | `{ [key]: wanted } as Record<K, number>` | A computed key widens to `{ [x: string]: number }`; `key` is a `K`, so the object has exactly the one `K` key with a number. The function returns it as `Partial<Record<K, number>>`, which it satisfies. |
| `test/partner-trade.test.ts`, "passes right shoulders" | `beau as Waypoint`, `belle as Waypoint` (×2 each) | `midpoint` returns `Waypoint \| undefined`; the two lines above assert both defined, and `expect` doesn't narrow. A wrong guess fails the test at the property access, not silently. |
| `src/calls.ts`, `ALL_CALL_NAMES` | `Object.keys(CALLS) as readonly CallName[]` | `Object.keys` is typed `string[]` whatever the object. `CALLS` is a const object literal with no other keys, so every key is a `CallName`. (Missed when the registry was made; found 2026-10-30.) |
| `src/standard-applications.ts`, `CALL_IDS` | `Object.keys(STANDARD_APPLICATIONS) as readonly ApplicationCallId[]` | Same reason: a const object literal, `satisfies` its record type, no other keys. |
| `test/standard-applications.test.ts`, top and "U-Turn Back is from every formation" | `Object.keys(...) as ApplicationCallId[]`, `as FormationId[]` | Same reason, for `STANDARD_APPLICATIONS` and `FORMATIONS`. |
| `test/clearance.test.ts`, "the same figure" | `room[0] as number` | `noUncheckedIndexedAccess` types it `number \| undefined`; the line above asserts `room` has length 2. A wrong guess fails `toBeCloseTo`, not silently. (Found 2026-10-30.) |
