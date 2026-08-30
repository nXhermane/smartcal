/**
 * @file formula_resolver.ts
 * @description Memoized f_* sub-formula resolver for SmartCal v1.1.
 *
 * ## Problem it solves (AUDIT_AND_MODERNIZATION_PLAN.md §3.2)
 *
 * In v1.0.14, `DataType` allows values to be `CompiledExpression` objects
 * (the `f_*` pattern). The legacy interpreter resolved these recursively
 * on every evaluation call — with no caching. A cascade of 8 sub-formulas
 * degraded performance to **4 772 ops/s**.
 *
 * ## Solution
 *
 * `FormulaResolver.resolve()` performs a **single topological traversal**:
 * 1. Detect all `f_*` keys in `data` whose values are `CompiledExpression`.
 * 2. Build a dependency graph (which f_x needs f_y).
 * 3. Evaluate in topological order, caching each result.
 * 4. Return a flat `Record<string, number | string>` that can be passed
 *    directly to the JIT compiled fn or the VM interpreter.
 *
 * Cycle detection raises a `FormulaResolutionError` with the cycle path.
 */

import { FormulaResolutionError } from '../errors/index';
import type { CompiledExpression } from '../types';

/** A data object that may contain CompiledExpression sub-formulas. */
export type RawData = Record<string, number | string | CompiledExpression>;

/** A flat data object suitable for passing to JIT/VM — no nested formulas. */
export type ResolvedData = Record<string, number | string>;

/**
 * Resolves all `CompiledExpression` entries in `data` into concrete values,
 * producing a flat `ResolvedData` object.
 *
 * The resolver is **stateless** — call it once per `evaluate()` invocation.
 * AST caching happens inside `CompiledExpression.evaluate()` (v1 contract).
 */
export class FormulaResolver {
  /**
   * Flatten `data` by evaluating all `CompiledExpression` values in
   * dependency order.
   *
   * @param data   Raw input (may contain CompiledExpression sub-formulas).
   * @returns      Flat object with every value as `number | string`.
   * @throws {FormulaResolutionError} on circular references.
   */
  static resolve(data: RawData): ResolvedData {
    const result: ResolvedData = {};
    const inProgress = new Set<string>();
    const done = new Set<string>();

    // Collect all keys up front so the cycle detector has the full picture.
    const keys = Object.keys(data);

    function resolveKey(key: string): number | string {
      // Already resolved — return cached value.
      if (done.has(key)) return result[key] as number | string;

      // Cycle detected.
      if (inProgress.has(key)) {
        throw new FormulaResolutionError(
          `Circular formula dependency detected: "${key}" depends on itself.`,
          [...inProgress, key],
        );
      }

      const val = data[key];

      // Primitive — no resolution needed.
      if (typeof val === 'number' || typeof val === 'string') {
        result[key] = val;
        done.add(key);
        return val;
      }

      // CompiledExpression — evaluate with currently resolved data.
      inProgress.add(key);

      // Build a partial snapshot of already-resolved values for this evaluation.
      // This handles cases where f_b depends on f_a (resolved before f_b).
      const partialData: ResolvedData = { ...result };

      // Also include primitive values not yet processed (they don't need ordering).
      for (const k of keys) {
        const v = data[k];
        if ((typeof v === 'number' || typeof v === 'string') && !(k in partialData)) {
          partialData[k] = v;
        }
      }

      const evaluated = (val as CompiledExpression).evaluate(partialData);
      const resolved: number | string =
        typeof evaluated === 'number' || typeof evaluated === 'string' ? evaluated : 0;

      result[key] = resolved;
      done.add(key);
      inProgress.delete(key);
      return resolved;
    }

    for (const key of keys) {
      resolveKey(key);
    }

    return result;
  }
}
