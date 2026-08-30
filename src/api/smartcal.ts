/**
 * @file smartcal.ts
 * @description SmartCal v1.1 implementation of the default SmartCal() function.
 *
 * Signature is 100% backward compatible with v1.
 * Each call: parse → resolve f_* → JIT/VM evaluate.
 *
 * For repeated evaluations of the same expression, use `compile()` instead —
 * it amortizes the parse cost over multiple calls.
 */

import type { ASTNode } from '../ast/nodes';
import { createExecutor, type ExecMode } from '../compiler/execution-strategy';
import { IncorrectSyntaxError, InvalidFormulaError, ParseError, ScanError } from '../errors/index';
import { parse } from '../parser/parser';
import { FormulaResolver, type RawData } from '../resolver/formula-resolver';
import type { DataType } from '../types';

export interface SmartCalOptions {
  /**
   * Execution mode:
   * - `'auto'` (default) — JIT if available, else VM.
   * - `'jit'`  — force JIT (`new Function`).
   * - `'vm'`   — force VM (CSP-safe).
   */
  mode?: ExecMode;
}

/**
 * Evaluate a formula expression against a data object.
 *
 * @param expression  The formula string to evaluate.
 * @param data        Variable bindings. Values can be numbers, strings, or
 *                    `CompiledExpression` objects (f_* sub-formula pattern).
 * @param options     Execution options (mode: 'auto' | 'jit' | 'vm').
 * @returns           The result of the expression as a `number` or `string`.
 *
 * @throws {IncorrectSyntaxError} For backward compatibility — wraps scan/parse errors.
 * @throws {InvalidFormulaError}  For backward compatibility — wraps empty input.
 *
 * @example
 * SmartCal('price * (1 - discount)', { price: 100, discount: 0.2 }); // 80
 */
export default function SmartCal(
  expression: string,
  data: DataType = {},
  options: SmartCalOptions = {},
): number | string {
  // Guard: empty expression — same error as v1.
  if (!expression || expression.trim().length === 0) {
    throw new InvalidFormulaError('Expression cannot be empty.', expression ?? '');
  }

  let ast: ASTNode;
  try {
    ast = parse(expression);
  } catch (err) {
    // Map new ScanError / ParseError → legacy IncorrectSyntaxError so that
    // existing catch blocks in consumer code continue to work.
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
  const executor = createExecutor(ast, options.mode ?? 'auto');
  return executor(resolved);
}
