import { TokenKind } from '../scanner/token';

/**
 * Binding powers for all infix (LED) operators.
 * Tokens absent from this table have an implicit BP of 0 (they stop parsing).
 */
export const INFIX_BP: Partial<Record<TokenKind, number>> = {
  // Ternary
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

  // Exponentiation
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
