/**
 * square-one — the square-dance engine.
 *
 * A pure library (ADR-0002): no storage, no UI, no IO. Consumers own persistence,
 * rendering and the clock.
 */

export * from "./geometry.js";
export * from "./types.js";
export * from "./blocks/index.js";
export * from "./compose.js";
export * from "./calls.js";
export * from "./stepper.js";
