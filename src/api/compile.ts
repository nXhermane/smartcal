import { createExecutor, type ExecMode } from '../compiler/execution-strategy';
import { parse } from '../parser/parser';
import { FormulaResolver, type RawData } from '../resolver/formula-resolver';
import type { CompiledExpression, DataType } from '../types';

/** Options for `compile()`. */
export interface CompileOptions {
  mode?: ExecMode;
}

/**
 * Compile a formula expression into an object that can be evaluated
 * repeatedly with different data, without re-parsing.
 *
 *
 * @throws {ScanError | ParseError} if the expression is syntactically invalid.
 *
 * @example
 * const expr = compile('price * (1 - discount)');
 * expr.evaluate({ price: 100, discount: 0.2 }); // 80
 * expr.evaluate({ price: 200, discount: 0.1 }); // 180
 */
export function compile(expression: string, options: CompileOptions = {}): CompiledExpression {
  // Parse once - throws on invalid syntax.
  const ast = parse(expression);

  // Compile once - creates a native JS function (JIT) or a VM closure.
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
