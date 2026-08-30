/**
 * @file compile.ts
 * @description SmartCal v1.1 implementation of compile().
 *
 * ## Key difference from v1
 *
 * In v1.0.14, `CompiledFormulaExpression.evaluate()` re-ran the full
 * tokenizer → parser → interpreter pipeline on every call.
 * Nothing was actually compiled.
 *
 * In v1.1, `compile()`:
 * 1. Parses the expression **once** into an AST (Pratt Parser).
 * 2. Compiles the AST into a native JS function **once** (JIT Compiler).
 * 3. `evaluate(data)` is then a single function call — no re-parsing, no
 *    re-compilation, ~10M ops/s.
 *
 * The returned object satisfies the **existing `CompiledExpression` interface**
 * so all v1 consumers work without modification.
 */

import { createExecutor, type ExecMode } from '../compiler/execution-strategy';
import { parse } from '../parser/parser';
import { FormulaResolver, type RawData } from '../resolver/formula-resolver';
import type { CompiledExpression, DataType } from '../types';

/** Options for `compile()`. */
export interface CompileOptions {
  /**
   * Execution mode:
   * - `'auto'` (default) — JIT if available, else VM.
   * - `'jit'`  — force JIT (`new Function`).
   * - `'vm'`   — force VM (CSP-safe).
   */
  mode?: ExecMode;
}

/**
 * Compile a formula expression into an object that can be evaluated
 * repeatedly with different data, without re-parsing.
 *
 * Signature identical to v1 `compile()`.
 *
 * @throws {ScanError | ParseError} if the expression is syntactically invalid.
 *
 * @example
 * const expr = compile('price * (1 - discount)');
 * expr.evaluate({ price: 100, discount: 0.2 }); // 80
 * expr.evaluate({ price: 200, discount: 0.1 }); // 180
 */
export function compile(expression: string, options: CompileOptions = {}): CompiledExpression {
  // Parse once — throws on invalid syntax.
  const ast = parse(expression);

  // Compile once — creates a native JS function (JIT) or a VM closure.
  const executor = createExecutor(ast, options.mode ?? 'auto');

  return {
    type: 'CompiledExpression' as const,

    evaluate<T extends DataType>(data: T): string | number {
      // Flatten any f_* CompiledExpression values before evaluation.
      const resolved = FormulaResolver.resolve(data as unknown as RawData);
      return executor(resolved);
    },

    toString(): string {
      return expression;
    },
  };
}
