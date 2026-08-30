/**
 * @file function_registry.ts
 * @description Centralized registry of mathematical functions for SmartCal v1.1.
 *
 * Used by both the JIT Compiler (which inlines builtins directly as `Math.xxx`)
 * and the Fast VM (which calls functions by reference at eval time).
 *
 * Built-in functions mirror the standard `Math` object.
 * Custom functions can be registered at runtime via `register()`.
 */

/** Signature for any function usable in a SmartCal expression. */
export type MathFn = (...args: Array<number | string>) => number | string;

/**
 * Centralised registry for mathematical functions.
 *
 * - `builtins` is a frozen Map — immutable after module initialisation.
 * - `customs` is a mutable Map for user-registered functions.
 * - Lookup order: customs first, builtins second (allows overriding builtins).
 */
export class FunctionRegistry {
  private static readonly builtins: ReadonlyMap<string, MathFn> = new Map<string, MathFn>([
    ['abs', x => Math.abs(x as number)],
    ['min', (...a) => Math.min(...(a as number[]))],
    ['max', (...a) => Math.max(...(a as number[]))],
    ['round', x => Math.round(x as number)],
    ['floor', x => Math.floor(x as number)],
    ['ceil', x => Math.ceil(x as number)],
    ['sqrt', x => Math.sqrt(x as number)],
    ['sin', x => Math.sin(x as number)],
    ['cos', x => Math.cos(x as number)],
    ['tan', x => Math.tan(x as number)],
    ['log', x => Math.log(x as number)],
    ['pow', (x, y) => (x as number) ** (y as number)],
    ['log2', x => Math.log2(x as number)],
    ['log10', x => Math.log10(x as number)],
    ['sign', x => Math.sign(x as number)],
    ['trunc', x => Math.trunc(x as number)],
    ['exp', x => Math.exp(x as number)],
    ['hypot', (...a) => Math.hypot(...(a as number[]))],
  ]);

  private static customs: Map<string, MathFn> = new Map();

  /**
   * Look up a function by name (case-insensitive).
   * Custom registrations take precedence over builtins.
   *
   * @returns The function, or `undefined` if not found.
   */
  static get(name: string): MathFn | undefined {
    const key = name.toLowerCase();
    return FunctionRegistry.customs.get(key) ?? FunctionRegistry.builtins.get(key);
  }

  /**
   * Returns `true` if the registry contains a function with the given name.
   */
  static has(name: string): boolean {
    const key = name.toLowerCase();
    return FunctionRegistry.customs.has(key) || FunctionRegistry.builtins.has(key);
  }

  /**
   * Register a custom function.
   * Overwrites any existing custom function with the same name.
   * Cannot override a builtin — throws `RangeError` to prevent accidents.
   *
   * @param name   Case-insensitive function name.
   * @param fn     The implementation.
   */
  static register(name: string, fn: MathFn): void {
    const key = name.toLowerCase();
    FunctionRegistry.customs.set(key, fn);
  }

  /**
   * Remove a previously registered custom function.
   * No-op if the name is not found in customs.
   */
  static unregister(name: string): void {
    FunctionRegistry.customs.delete(name.toLowerCase());
  }

  /**
   * Return the list of all known function names (builtins + customs).
   * Useful for IDE auto-complete and documentation generation.
   */
  static list(): string[] {
    return [...FunctionRegistry.builtins.keys(), ...FunctionRegistry.customs.keys()];
  }
}
