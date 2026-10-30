/**
 * square-one — the square-dance engine.
 *
 * A pure library (ADR-0002): no storage, no UI, no IO. Consumers own persistence,
 * rendering and the clock.
 */

export * from "./geometry.js";
export * from "./types.js";
export * from "./shape.js";
export * from "./blocks/index.js";
export * from "./compose.js";
export * from "./calls.js";
export * from "./couple.js";
export * from "./sequence.js";
export * from "./facing-couples.js";
export * from "./star-thru.js";
export * from "./stepper.js";
export * from "./formations.js";
export * from "./standard-applications.js";
