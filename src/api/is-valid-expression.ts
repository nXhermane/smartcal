import { globalEngine } from '../global-engine';

/**
 * Returns `true` if the expression can be parsed without errors,
 * `false` otherwise. Never throws.
 *
 * @example
 * isValidExpression('price * (1 - discount)') // true
 * isValidExpression('price *')                 // false
 */
export function isValidExpression(expression: string): boolean {
  return globalEngine.isValidExpression(expression);
}
