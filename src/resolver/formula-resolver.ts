import { FormulaResolutionError } from '../errors/index';
import type { CompiledExpression } from '../types';

/** A data object that may contain CompiledExpression sub-formulas. */
export type RawData = Record<string, number | string | CompiledExpression>;

/** A flat data object suitable for passing to JIT/VM - no nested formulas. */
export type ResolvedData = Record<string, number | string>;

/**
 * Resolves all `CompiledExpression` entries in `data` into concrete values,
 * producing a flat `ResolvedData` object.
 *
 * The resolver is **stateless** - call it once per `evaluate()` invocation.
 * AST caching happens inside `CompiledExpression.evaluate()`.
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
      // Already resolved - return cached value.
      if (done.has(key)) return result[key] as number | string;

      // Cycle detected.
      if (inProgress.has(key)) {
        throw new FormulaResolutionError(
          `Circular formula dependency detected: "${key}" depends on itself.`,
          [...inProgress, key],
        );
      }

      const val = data[key];

      // Primitive - no resolution needed.
      if (typeof val === 'number' || typeof val === 'string') {
        result[key] = val;
        done.add(key);
        return val;
      }

      // CompiledExpression - evaluate with currently resolved data.
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
