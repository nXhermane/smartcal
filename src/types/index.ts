/**
 * @file index.ts
 * @description Core types and contracts for SmartCal v1.1.
 */

/**
 * Represents the interface for pre-compiled formula expressions.
 * Compatible with v1 contract for seamless backward compatibility.
 */
export interface CompiledExpression {
  /** Type identifier for the compiled expression */
  type: 'CompiledExpression';

  /**
   * Evaluates the compiled expression with the provided data.
   *
   * @param data - Object containing variable bindings.
   * @returns Evaluated result as number or string.
   */
  evaluate<T extends DataType>(data: T): string | number;

  /**
   * Returns the string representation of the original formula expression.
   */
  toString(): string;
}

/**
 * Represents the data object passed to expression evaluation functions.
 * Keys are variable names, and values can be numbers, strings, or precompiled expressions.
 */
export type DataType = Record<string, number | string | CompiledExpression>;

/**
 * Enumeration for boolean condition results in expressions.
 * Used for ternary operations and logical evaluations.
 */
export const ConditionResult = {
  /** Represents true (evaluates to 1 in numeric context) */
  True: 1,
  /** Represents false (evaluates to 0 in numeric context) */
  False: 0,
} as const;

export type ConditionResultType = (typeof ConditionResult)[keyof typeof ConditionResult];
