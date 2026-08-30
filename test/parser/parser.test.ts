/**
 * @file parser.test.ts
 * @description Unit tests for the SmartCal v1.1 Pratt Parser.
 *
 * Coverage goals:
 * - Literal numbers and strings
 * - Single identifiers and f_* sub-formula references
 * - Arithmetic precedence and associativity
 * - Parenthesised grouping
 * - Unary minus
 * - Boolean comparisons
 * - Logical AND / OR
 * - Ternary conditionals (simple, chained, deeply nested)
 * - Function calls (zero / one / many args)
 * - Array literals
 * - Member access (dot and bracket)
 * - Error cases (unexpected tokens, mismatched parentheses)
 *
 * KEY REGRESSION TEST:
 *   The crash discovered in v1.0.14 on deeply-nested ternaries is the very
 *   first thing verified below.  The old `checkTernaryConditionSyntax` flag
 *   toggling caused `IncorrectSyntaxError: found ':' before '?'`.
 */

import { describe, expect, it } from 'vitest';
import type {
  ArrayLiteralNode,
  ASTNode,
  BinaryNode,
  ConditionalNode,
  FunctionCallNode,
  MemberExpressionNode,
  UnaryNode,
} from '../../src/ast/nodes';
import { ParseError } from '../../src/errors/index';
import { parse } from '../../src/parser/parser';

// =============================================================================
// Helpers
// =============================================================================

/** Assert that the root is a BinaryNode with the given operator. */
function binary(node: ASTNode, op: string): BinaryNode {
  expect(node.type).toBe('Binary');
  expect((node as BinaryNode).op).toBe(op);
  return node as BinaryNode;
}

/** Assert that the root is a ConditionalNode. */
function conditional(node: ASTNode): ConditionalNode {
  expect(node.type).toBe('Conditional');
  return node as ConditionalNode;
}

/** Narrow an ASTNode to FunctionCallNode with a runtime assertion. */
function asFunc(node: ASTNode): FunctionCallNode {
  expect(node.type).toBe('FunctionCall');
  return node as FunctionCallNode;
}

/** Narrow an ASTNode to ArrayLiteralNode with a runtime assertion. */
function asArr(node: ASTNode): ArrayLiteralNode {
  expect(node.type).toBe('ArrayLiteral');
  return node as ArrayLiteralNode;
}

/** Narrow an ASTNode to MemberExpressionNode with a runtime assertion. */
function asMember(node: ASTNode): MemberExpressionNode {
  expect(node.type).toBe('MemberExpression');
  return node as MemberExpressionNode;
}

// =============================================================================
// 🔴 CRITICAL REGRESSION — v1.0.14 crash on nested ternaries
// =============================================================================
describe('REGRESSION — nested ternaries (v1.0.14 crash)', () => {
  it('parses a simple ternary: a ? b : c', () => {
    const ast = parse('score >= 90 ? 1 : 0');
    const cond = conditional(ast);
    expect(cond.test.type).toBe('Binary');
    expect(cond.consequent).toEqual({ type: 'Literal', value: 1 });
    expect(cond.alternate).toEqual({ type: 'Literal', value: 0 });
  });

  it('parses chained ternary (right-assoc): a ? b : c ? d : e', () => {
    // Equivalent to: a ? b : (c ? d : e)
    const ast = parse('x > 10 ? 1 : x > 5 ? 2 : 0');
    const outer = conditional(ast);
    // The alternate must be another conditional (right-associative)
    expect(outer.alternate.type).toBe('Conditional');
  });

  it('parses deeply-nested ternary (the exact expression that crashed v1)', () => {
    // This expression raised IncorrectSyntaxError in v1.0.14.
    const expr = 'age < 18 ? 0 : (age < 25 ? 15 : (age < 60 ? (income > 50000 ? 120 : 80) : 30))';
    const ast = parse(expr);
    expect(ast.type).toBe('Conditional');
    const outer = conditional(ast);
    expect(outer.consequent).toEqual({ type: 'Literal', value: 0 });
    // The alternate branch should be another conditional
    expect(outer.alternate.type).toBe('Conditional');
  });

  it('parses 4-level nested ternary', () => {
    const ast = parse('a ? 1 : b ? 2 : c ? 3 : 4');
    // a ? 1 : (b ? 2 : (c ? 3 : 4))
    expect(ast.type).toBe('Conditional');
    const l1 = conditional(ast);
    expect(l1.alternate.type).toBe('Conditional');
    const l2 = conditional(l1.alternate);
    expect(l2.alternate.type).toBe('Conditional');
  });
});

// =============================================================================
// Literals
// =============================================================================
describe('Parser — literals', () => {
  it('parses an integer literal', () => {
    expect(parse('42')).toEqual({ type: 'Literal', value: 42 });
  });

  it('parses a floating-point literal', () => {
    expect(parse('3.14')).toEqual({ type: 'Literal', value: 3.14 });
  });

  it('parses a zero literal', () => {
    expect(parse('0')).toEqual({ type: 'Literal', value: 0 });
  });

  it('parses a double-quoted string literal', () => {
    expect(parse('"hello"')).toEqual({ type: 'Literal', value: 'hello' });
  });

  it('parses a single-quoted string literal', () => {
    expect(parse("'world'")).toEqual({ type: 'Literal', value: 'world' });
  });

  it('parses a string literal with embedded spaces', () => {
    expect(parse('"John Doe"')).toEqual({ type: 'Literal', value: 'John Doe' });
  });
});

// =============================================================================
// Identifiers
// =============================================================================
describe('Parser — identifiers', () => {
  it('parses a plain variable', () => {
    expect(parse('price')).toEqual({ type: 'Identifier', name: 'price' });
  });

  it('parses a f_* sub-formula reference', () => {
    expect(parse('f_total')).toEqual({ type: 'Identifier', name: 'f_total' });
  });

  it('parses a Unicode identifier', () => {
    expect(parse('السعر')).toEqual({ type: 'Identifier', name: 'السعر' });
  });
});

// =============================================================================
// Arithmetic — precedence and associativity
// =============================================================================
describe('Parser — arithmetic precedence', () => {
  it('parses addition: 2 + 3', () => {
    const ast = binary(parse('2 + 3'), '+');
    expect(ast.left).toEqual({ type: 'Literal', value: 2 });
    expect(ast.right).toEqual({ type: 'Literal', value: 3 });
  });

  it('respects * over +: 2 + 3 * 4 → 2 + (3 * 4)', () => {
    const ast = binary(parse('2 + 3 * 4'), '+');
    expect(ast.right.type).toBe('Binary');
    expect((ast.right as BinaryNode).op).toBe('*');
  });

  it('respects left-associativity: 8 - 3 - 2 → (8-3)-2', () => {
    const ast = binary(parse('8 - 3 - 2'), '-');
    expect(ast.left.type).toBe('Binary');
    expect((ast.left as BinaryNode).op).toBe('-');
  });

  it('parses exponentiation right-associatively: 2^3^4 → 2^(3^4)', () => {
    const ast = binary(parse('2 ^ 3 ^ 4'), '^');
    // Right operand must be another ^
    expect((ast.right as BinaryNode).op).toBe('^');
  });

  it('parses modulo: 10 % 3', () => {
    expect(binary(parse('10 % 3'), '%')).toBeDefined();
  });
});

// =============================================================================
// Parentheses
// =============================================================================
describe('Parser — parentheses', () => {
  it('overrides default precedence: (2 + 3) * 4 → * at root', () => {
    const ast = binary(parse('(2 + 3) * 4'), '*');
    expect(ast.left.type).toBe('Binary');
    expect((ast.left as BinaryNode).op).toBe('+');
  });

  it('handles nested parentheses', () => {
    const ast = parse('((42))');
    expect(ast).toEqual({ type: 'Literal', value: 42 });
  });
});

// =============================================================================
// Unary minus
// =============================================================================
describe('Parser — unary minus', () => {
  it('parses -5 as UnaryNode', () => {
    const ast = parse('-5') as UnaryNode;
    expect(ast.type).toBe('Unary');
    expect(ast.op).toBe('-');
    expect(ast.operand).toEqual({ type: 'Literal', value: 5 });
  });

  it('parses -x as UnaryNode with Identifier operand', () => {
    const ast = parse('-discount') as UnaryNode;
    expect(ast.type).toBe('Unary');
    expect(ast.operand).toEqual({ type: 'Identifier', name: 'discount' });
  });

  it('parses -(a + b)', () => {
    const ast = parse('-(a + b)') as UnaryNode;
    expect(ast.type).toBe('Unary');
    expect(ast.operand.type).toBe('Binary');
  });

  it('handles unary minus in a larger expression: 2 * -3', () => {
    const ast = binary(parse('2 * -3'), '*');
    expect(ast.right.type).toBe('Unary');
  });
});

// =============================================================================
// Comparison operators
// =============================================================================
describe('Parser — comparison operators', () => {
  it.each(['==', '!=', '<', '>', '<=', '>='])('parses %s', op => {
    const ast = binary(parse(`a ${op} b`), op);
    expect(ast.left).toEqual({ type: 'Identifier', name: 'a' });
    expect(ast.right).toEqual({ type: 'Identifier', name: 'b' });
  });
});

// =============================================================================
// Logical operators
// =============================================================================
describe('Parser — logical operators', () => {
  it('parses &&', () => {
    expect(binary(parse('a && b'), '&&')).toBeDefined();
  });

  it('parses ||', () => {
    expect(binary(parse('a || b'), '||')).toBeDefined();
  });

  it('&& binds tighter than ||: a || b && c → a || (b && c)', () => {
    const ast = binary(parse('a || b && c'), '||');
    expect((ast.right as BinaryNode).op).toBe('&&');
  });
});

// =============================================================================
// Function calls
// =============================================================================
describe('Parser — function calls', () => {
  it('parses a zero-argument function call: fn()', () => {
    const ast = asFunc(parse('fn()'));
    expect(ast.name).toBe('fn');
    expect(ast.args).toHaveLength(0);
  });

  it('parses a one-argument call: abs(x)', () => {
    const ast = asFunc(parse('abs(x)'));
    expect(ast.args).toHaveLength(1);
  });

  it('parses a multi-argument call: max(a, b, c)', () => {
    const ast = asFunc(parse('max(a, b, c)'));
    expect(ast.args).toHaveLength(3);
  });

  it('parses nested function calls: round(abs(x), 2)', () => {
    const ast = asFunc(parse('round(abs(x), 2)'));
    expect(ast.name).toBe('round');
    const firstArg = ast.args[0];
    expect(firstArg?.type).toBe('FunctionCall');
  });

  it('parses expression arguments: max(a + 1, b * 2)', () => {
    const ast = asFunc(parse('max(a + 1, b * 2)'));
    expect(ast.args[0]?.type).toBe('Binary');
    expect(ast.args[1]?.type).toBe('Binary');
  });
});

// =============================================================================
// Array literals
// =============================================================================
describe('Parser — array literals', () => {
  it('parses an empty array []', () => {
    const ast = asArr(parse('[]'));
    expect(ast.elements).toHaveLength(0);
  });

  it('parses [1, 2, 3]', () => {
    const ast = asArr(parse('[1, 2, 3]'));
    expect(ast.elements).toHaveLength(3);
  });

  it('parses array with expression elements', () => {
    const ast = asArr(parse('[a + 1, b * 2]'));
    expect(ast.elements[0]?.type).toBe('Binary');
  });
});

// =============================================================================
// Member access
// =============================================================================
describe('Parser — member access', () => {
  it('parses bracket indexing: arr[0]', () => {
    const ast = asMember(parse('arr[0]'));
    expect(ast.computed).toBe(true);
    expect(ast.object).toEqual({ type: 'Identifier', name: 'arr' });
    expect(ast.property).toEqual({ type: 'Literal', value: 0 });
  });

  it('parses dot access: obj.prop', () => {
    const ast = asMember(parse('obj.prop'));
    expect(ast.computed).toBe(false);
    expect(ast.property).toEqual({ type: 'Identifier', name: 'prop' });
  });
});

// =============================================================================
// Complex real-world expressions
// =============================================================================
describe('Parser — complex real-world expressions', () => {
  it('parses: price * quantity * (1 - discount)', () => {
    const ast = parse('price * quantity * (1 - discount)');
    expect(ast.type).toBe('Binary');
  });

  it('parses: score >= 90 ? (points * 1.5) : (score >= 50 ? points : 0)', () => {
    const ast = parse('score >= 90 ? (points * 1.5) : (score >= 50 ? points : 0)');
    expect(ast.type).toBe('Conditional');
    const cond = conditional(ast);
    expect(cond.alternate.type).toBe('Conditional');
  });

  it('parses the adversarial benchmark polynomial: a*b + c*d - e/f + g%h', () => {
    const ast = parse('a*b + c*d - e/f + g%h');
    expect(ast.type).toBe('Binary');
  });

  it('parses f_* DAG reference in expression', () => {
    const ast = parse('f_subtotal * (1 + f_taxRate)');
    expect(ast.type).toBe('Binary');
  });
});

// =============================================================================
// Error cases
// =============================================================================
describe('Parser — error cases', () => {
  it('throws on trailing garbage: 2 + 3 }', () => {
    // '}' is not a valid token — ScanError from the Scanner
    expect(() => parse('2 + 3 }')).toThrow();
  });

  it('throws on double operator: 2 + * 3', () => {
    expect(() => parse('2 + * 3')).toThrow();
  });

  it('throws on mismatched parentheses: (2 + 3', () => {
    expect(() => parse('(2 + 3')).toThrow();
  });

  it('throws on empty expression', () => {
    expect(() => parse('')).toThrow();
  });

  it('throws when ternary is missing the colon: a ? b', () => {
    expect(() => parse('a ? b')).toThrow();
  });

  it('throws ParseError on non-identifier function call: 42(arg)', () => {
    expect(() => parse('42(arg)')).toThrow(ParseError);
  });
});
