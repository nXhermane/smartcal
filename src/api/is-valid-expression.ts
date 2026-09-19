import { parse } from '../parser/parser';

/**
 * Returns `true` if the expression can be parsed without errors,
 * `false` otherwise. Never throws.
 *
 * @example
 * isValidExpression('price * (1 - discount)') // true
 * isValidExpression('price *')                 // false
 */
export function isValidExpression(expression: string): boolean {
  if (!expression || expression.trim().length === 0) return false;
  try {
    parse(expression);
    return true;
  } catch {
    return false;
  }
}
