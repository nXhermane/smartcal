import { globalEngine } from '../global-engine';
import type { DataType, ExecutorOptions } from '../types';

export type SmartCalOptions = ExecutorOptions;
/**
 * Evaluate a formula expression against a data object.
 *
 * @param expression  The formula string to evaluate.
 * @param data        Variable bindings. Values can be numbers, strings, or
 *                    `CompiledExpression` objects (f_* sub-formula pattern).
 * @param options.mode   Execution engine: `'auto'` (default) | `'jit'` | `'vm'`.
 * @param options.strict When `true`, throws VariableNotFoundError if a variable
 *                       referenced in the expression is absent from `data`.
 *                       When `false` (default), missing variables silently default to `0`.
 * @returns           The result of the expression as a `number` or `string`.
 *
 * @throws {ScanError}   If the expression contains an unrecognized character.
 * @throws {ParseError}  If the expression is syntactically invalid.
 * @throws {VariableNotFoundError} If `strict` is `true` and a variable is missing.
 *
 * @throws {IncorrectSyntaxError} _(deprecated)_ — use {@link ScanError} / {@link ParseError} instead.
 * @throws {InvalidFormulaError}  _(deprecated)_ — use an explicit empty-string guard instead.
 *
 * @example
 * SmartCal('price * (1 - discount)', { price: 100, discount: 0.2 }); // 80
 * SmartCal('missing_var', {}, { strict: true }); // throws VariableNotFoundError
 */

export default function SmartCal(
  expression: string,
  data: DataType = {},
  options: SmartCalOptions = {},
): number | string {
  return globalEngine.evaluate(expression, data, options);
}
