import type { ASTNode } from '../ast/nodes';
import { createExecutor, ExecutorOptions } from '../compiler/execution-strategy';
import {
  IncorrectSyntaxError,
  InvalidFormulaError,
  ParseError,
  ScanError,
  type VariableNotFoundError,
} from '../errors/index';
import { parse } from '../parser/parser';
import { FormulaResolver, type RawData } from '../resolver/formula-resolver';
import type { DataType } from '../types';

export type SmartCalOptions = ExecutorOptions;
/**
 * Evaluate a formula expression against a data object.
 *
 * @param expression  The formula string to evaluate.
 * @param data        Variable bindings. Values can be numbers, strings, or
 *                    `CompiledExpression` objects (f_* sub-formula pattern).
 * @param options.mode   Execution engine: `'auto'` (default) | `'jit'` | `'vm'`.
 *                       - `'auto'` — uses JIT when available, falls back to VM (CSP-safe).
 *                       - `'jit'`  — always uses `new Function` (fastest, V8-optimised).
 *                       - `'vm'`   — always uses the tree-walker interpreter (CSP-safe).
 * @param options.strict When `true`, throws {@link VariableNotFoundError} if a variable
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
  // Guard: empty expression - same error as v1.0.14.
  if (!expression || expression.trim().length === 0) {
    throw new InvalidFormulaError('Expression cannot be empty.', expression ?? '');
    // TODO v2: throw new Error('Expression cannot be empty.')
  }

  let ast: ASTNode;
  try {
    ast = parse(expression);
  } catch (err) {
    // Backward compat: wrap in legacy error.
    // TODO v2: remove this try/catch and let ScanError/ParseError propagate directly.
    if (err instanceof ScanError || err instanceof ParseError) {
      throw new IncorrectSyntaxError(
        err instanceof Error ? err.message : 'Syntax error',
        expression,
      );
    }
    throw err;
  }

  // Resolve f_* sub-formulas (CompiledExpression values) into primitives.
  const resolved = FormulaResolver.resolve(data as unknown as RawData);

  // Compile + execute.
  const executor = createExecutor(ast, options);
  return executor(resolved);
}
