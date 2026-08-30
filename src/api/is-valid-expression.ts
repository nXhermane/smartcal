/**
 * @file is_valid_expression.ts
 * @description SmartCal v1.1 implementation of isValidExpression().
 *
 * Uses the Pratt Parser to validate expressions without evaluation.
 * Replaces the v1 approach that depended on the Shunting-Yard pipeline.
 *
 * Signature is 100% backward compatible with the v1 export.
 */

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
