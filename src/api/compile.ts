import { CompileOptions } from '../engine';
import { globalEngine } from '../global-engine';
import type { CompiledExpression } from '../types';

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
  return globalEngine.compile(expression, options);
}
