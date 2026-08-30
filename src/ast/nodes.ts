/**
 * @file nodes.ts
 * @description Typed, immutable AST node definitions for SmartCal v1.1.
 *
 * Replaces the old mutable `AstNode` class (with 7 optional fields and no
 * discriminant) with a proper TypeScript discriminated union. Every node has a
 * mandatory `type` literal that allows exhaustive `switch` narrowing in the
 * compiler and VM — no runtime `instanceof` checks required.
 *
 * Future-proof nodes (FunctionCall, ArrayLiteral, MemberExpression) are
 * included from the start so the Pratt Parser and JIT can reference them
 * without a later refactor.
 */

// ---------------------------------------------------------------------------
// Leaf nodes
// ---------------------------------------------------------------------------

/** A numeric or string literal: `42`, `3.14`, `"hello"`. */
export interface LiteralNode {
  readonly type: 'Literal';
  readonly value: number | string;
}

/**
 * A variable reference or `f_*` sub-formula identifier.
 * Examples: `price`, `f_total`, `أسعار` (Unicode supported).
 */
export interface IdentifierNode {
  readonly type: 'Identifier';
  readonly name: string;
}

// ---------------------------------------------------------------------------
// Expression nodes
// ---------------------------------------------------------------------------

/**
 * A unary prefix expression.
 * Currently only the arithmetic negation operator `-` is produced by the parser.
 * Example: `-discount`, `-(a + b)`.
 */
export interface UnaryNode {
  readonly type: 'Unary';
  /** The operator symbol. Currently always `"-"`. */
  readonly op: string;
  readonly operand: ASTNode;
}

/**
 * A binary infix expression.
 * Operators: `+`, `-`, `*`, `/`, `%`, `^`, `==`, `!=`, `<`, `>`, `<=`, `>=`,
 * `&&`, `||`.
 */
export interface BinaryNode {
  readonly type: 'Binary';
  readonly op: string;
  readonly left: ASTNode;
  readonly right: ASTNode;
}

/**
 * A ternary conditional expression `test ? consequent : alternate`.
 * The Pratt Parser handles arbitrarily nested ternaries correctly via
 * right-associative recursion — the bug that crashed v1.0.14 is eliminated.
 */
export interface ConditionalNode {
  readonly type: 'Conditional';
  readonly test: ASTNode;
  readonly consequent: ASTNode;
  readonly alternate: ASTNode;
}

// ---------------------------------------------------------------------------
// Future-proof nodes (parsed but not yet compiled in v1.1 scope)
// ---------------------------------------------------------------------------

/**
 * A function call: `max(a, b)`, `round(price, 2)`.
 * The name is resolved against the `FunctionRegistry` at compile time.
 */
export interface FunctionCallNode {
  readonly type: 'FunctionCall';
  readonly name: string;
  readonly args: readonly ASTNode[];
}

/**
 * An array literal: `[1, 2, 3]`, `[a, b + c]`.
 * Used for future array-aware functions like `sum([...])`, `avg([...])`.
 */
export interface ArrayLiteralNode {
  readonly type: 'ArrayLiteral';
  readonly elements: readonly ASTNode[];
}

/**
 * A member access expression: `list[0]`, `obj.prop`.
 * `computed = true` means bracket access `obj[expr]`;
 * `computed = false` means dot access `obj.prop` (property is IdentifierNode).
 */
export interface MemberExpressionNode {
  readonly type: 'MemberExpression';
  readonly object: ASTNode;
  readonly property: ASTNode;
  readonly computed: boolean;
}

// ---------------------------------------------------------------------------
// Top-level union
// ---------------------------------------------------------------------------

/**
 * The complete set of AST node types recognized by the SmartCal engine.
 *
 * The discriminant field `type` allows TypeScript (and the JIT compiler) to
 * narrow exhaustively without any runtime `instanceof` checks.
 */
export type ASTNode =
  | LiteralNode
  | IdentifierNode
  | UnaryNode
  | BinaryNode
  | ConditionalNode
  | FunctionCallNode
  | ArrayLiteralNode
  | MemberExpressionNode;

// ---------------------------------------------------------------------------
// Type guards (convenience helpers for the JIT / VM)
// ---------------------------------------------------------------------------

export const isLiteral = (n: ASTNode): n is LiteralNode => n.type === 'Literal';
export const isIdentifier = (n: ASTNode): n is IdentifierNode => n.type === 'Identifier';
export const isUnary = (n: ASTNode): n is UnaryNode => n.type === 'Unary';
export const isBinary = (n: ASTNode): n is BinaryNode => n.type === 'Binary';
export const isConditional = (n: ASTNode): n is ConditionalNode => n.type === 'Conditional';
export const isFunctionCall = (n: ASTNode): n is FunctionCallNode => n.type === 'FunctionCall';
export const isArrayLiteral = (n: ASTNode): n is ArrayLiteralNode => n.type === 'ArrayLiteral';
export const isMemberExpression = (n: ASTNode): n is MemberExpressionNode =>
  n.type === 'MemberExpression';
