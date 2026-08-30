/**
 * @file Precedence.ts
 * @description Operator Binding Power table for the SmartCal v1.1 Pratt Parser.
 *
 * ## How Binding Power works (from THEORY_COMPILERS_AND_PARSING.md §3.1)
 *
 * Each infix operator has a numeric "binding power" (BP).  The Pratt Parser's
 * main loop keeps consuming operators as long as the next operator's BP is
 * greater than the caller's *minimum* BP.  Higher BP = tighter binding.
 *
 * Right-associative operators (ternary `?:`, exponentiation `^`) are handled
 * by passing `BP - 1` as the minimum BP for the recursive right-hand call,
 * allowing the same operator to appear again on the right side.
 *
 * ## Extensibility (from ARCHITECTURE_AND_MIGRATION_PLAN.md §3.3)
 *
 * The table is a plain object indexed by `TokenKind` integers. Adding a new
 * operator for a plugin requires only one line here — no changes to the parser
 * core algorithm are needed.
 */

import { TokenKind } from '../scanner/token';

/**
 * Binding powers for all infix (LED) operators.
 * Tokens absent from this table have an implicit BP of 0 (they stop parsing).
 *
 * Values are chosen so there is room between levels for future operators.
 */
export const INFIX_BP: Partial<Record<TokenKind, number>> = {
  // Ternary — lowest precedence, right-associative
  [TokenKind.Question]: 2,

  // Logical OR
  [TokenKind.Or]: 4,

  // Logical AND
  [TokenKind.And]: 6,

  // Equality comparisons
  [TokenKind.Eq]: 8,
  [TokenKind.NotEq]: 8,

  // Relational comparisons
  [TokenKind.Lt]: 10,
  [TokenKind.Gt]: 10,
  [TokenKind.LtEq]: 10,
  [TokenKind.GtEq]: 10,

  // Additive
  [TokenKind.Plus]: 20,
  [TokenKind.Minus]: 20,

  // Multiplicative
  [TokenKind.Star]: 30,
  [TokenKind.Slash]: 30,
  [TokenKind.Percent]: 30,

  // Exponentiation — right-associative (handled in Parser.led)
  [TokenKind.Caret]: 40,

  // Postfix-style: function call `(` and index `[`
  [TokenKind.LParen]: 50,
  [TokenKind.LBracket]: 50,
  [TokenKind.Dot]: 50,
};

/**
 * Returns the infix binding power of `kind`, or `0` if it is not an infix
 * operator (i.e. it terminates the current expression).
 */
export function getInfixBP(kind: TokenKind): number {
  return INFIX_BP[kind] ?? 0;
}
