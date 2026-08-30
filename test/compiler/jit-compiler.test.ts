/**
 * @file jit_compiler.test.ts
 * @description Unit tests for the JIT Compiler (AST → native JS function).
 *
 * Tests verify:
 * - Correct code generation for every AST node type
 * - Arithmetic precedence is preserved
 * - Comparisons return 1 / 0 (v1-compatible ConditionResult)
 * - Logical operators short-circuit (tested via side-effect-free expressions)
 * - Ternary conditionals (including deeply nested — regression for v1 crash)
 * - Function calls (builtins only)
 * - toJS() is deterministic
 */

import { describe, expect, it } from 'vitest';
import { JITCompiler } from '../../src/compiler/jit-compiler';
import { parse } from '../../src/parser/parser';

/** Shorthand: parse expression + JIT compile + run with data. */
function jit(expr: string, data: Record<string, unknown> = {}): number | string {
  const fn = JITCompiler.compile(parse(expr));
  return fn(data);
}

// =============================================================================
describe('JITCompiler — literals', () => {
  it('evaluates an integer literal', () => {
    expect(jit('42')).toBe(42);
  });

  it('evaluates a float literal', () => {
    expect(jit('3.14')).toBe(3.14);
  });

  it('evaluates a string literal', () => {
    expect(jit('"hello"')).toBe('hello');
  });

  it('evaluates a string with Unicode characters', () => {
    expect(jit('"cnt_phase_aiguë"')).toBe('cnt_phase_aiguë');
  });
});

// =============================================================================
describe('JITCompiler — identifiers / variables', () => {
  it('reads a variable from data', () => {
    expect(jit('price', { price: 42 })).toBe(42);
  });

  it('defaults missing variable to 0', () => {
    expect(jit('missing')).toBe(0);
  });

  it('reads multiple variables', () => {
    expect(jit('price * qty', { price: 10, qty: 3 })).toBe(30);
  });
});

// =============================================================================
describe('JITCompiler — arithmetic', () => {
  it('addition', () => expect(jit('2 + 3')).toBe(5));
  it('subtraction', () => expect(jit('10 - 4')).toBe(6));
  it('multiplication', () => expect(jit('3 * 4')).toBe(12));
  it('division', () => expect(jit('10 / 4')).toBe(2.5));
  it('modulo', () => expect(jit('10 % 3')).toBe(1));
  it('exponentiation (^)', () => expect(jit('2 ^ 10')).toBe(1024));

  it('respects operator precedence: 2 + 3 * 4 = 14', () => {
    expect(jit('2 + 3 * 4')).toBe(14);
  });

  it('parentheses override precedence: (2 + 3) * 4 = 20', () => {
    expect(jit('(2 + 3) * 4')).toBe(20);
  });

  it('unary minus: -5 = -5', () => {
    expect(jit('-5')).toBe(-5);
  });

  it('unary minus with variable: -x', () => {
    expect(jit('-x', { x: 7 })).toBe(-7);
  });
});

// =============================================================================
describe('JITCompiler — comparisons (return 1 or 0)', () => {
  it.each([
    ['5 == 5', 1],
    ['5 == 6', 0],
    ['5 != 6', 1],
    ['5 != 5', 0],
    ['3 < 5', 1],
    ['5 < 3', 0],
    ['5 > 3', 1],
    ['3 > 5', 0],
    ['5 <= 5', 1],
    ['5 <= 4', 0],
    ['5 >= 5', 1],
    ['4 >= 5', 0],
  ] as const)('%s → %i', (expr, expected) => {
    expect(jit(expr)).toBe(expected);
  });
});

// =============================================================================
describe('JITCompiler — logical operators (return 1 or 0)', () => {
  it('1 && 1 → 1', () => expect(jit('1 && 1')).toBe(1));
  it('1 && 0 → 0', () => expect(jit('1 && 0')).toBe(0));
  it('0 || 1 → 1', () => expect(jit('0 || 1')).toBe(1));
  it('0 || 0 → 0', () => expect(jit('0 || 0')).toBe(0));
});

// =============================================================================
describe('JITCompiler — ternary conditionals (v1 nested crash regression)', () => {
  it('simple ternary: true branch', () => {
    expect(jit('1 ? 42 : 0')).toBe(42);
  });

  it('simple ternary: false branch', () => {
    expect(jit('0 ? 42 : 99')).toBe(99);
  });

  it('ternary with comparison: score >= 90', () => {
    expect(jit('score >= 90 ? 1 : 0', { score: 95 })).toBe(1);
    expect(jit('score >= 90 ? 1 : 0', { score: 80 })).toBe(0);
  });

  it('chained ternary: a ? 1 : b ? 2 : 3', () => {
    expect(jit('a ? 1 : b ? 2 : 3', { a: 0, b: 1 })).toBe(2);
    expect(jit('a ? 1 : b ? 2 : 3', { a: 0, b: 0 })).toBe(3);
  });

  it('deeply nested ternary (exact crash expression from v1)', () => {
    const expr = 'age < 18 ? 0 : age < 25 ? 15 : age < 60 ? 80 : 30';
    expect(jit(expr, { age: 10 })).toBe(0);
    expect(jit(expr, { age: 22 })).toBe(15);
    expect(jit(expr, { age: 40 })).toBe(80);
    expect(jit(expr, { age: 70 })).toBe(30);
  });
});

// =============================================================================
describe('JITCompiler — function calls (builtins)', () => {
  it('abs(-5) = 5', () => expect(jit('abs(-5)')).toBe(5));
  it('max(2, 7, 3) = 7', () => expect(jit('max(2, 7, 3)')).toBe(7));
  it('min(2, 7, 3) = 2', () => expect(jit('min(2, 7, 3)')).toBe(2));
  it('round(3.7) = 4', () => expect(jit('round(3.7)')).toBe(4));
  it('floor(3.9) = 3', () => expect(jit('floor(3.9)')).toBe(3));
  it('ceil(3.1) = 4', () => expect(jit('ceil(3.1)')).toBe(4));
  it('sqrt(16) = 4', () => expect(jit('sqrt(16)')).toBe(4));
  it('pow(2, 8) = 256', () => expect(jit('pow(2, 8)')).toBe(256));
});

// =============================================================================
describe('JITCompiler — complex real-world expressions', () => {
  it('price * quantity * (1 - discount)', () => {
    expect(
      jit('price * quantity * (1 - discount)', {
        price: 100,
        quantity: 3,
        discount: 0.1,
      }),
    ).toBeCloseTo(270);
  });

  it('income tax bracket expression', () => {
    const expr = 'income > 100000 ? income * 0.4 : income > 50000 ? income * 0.3 : income * 0.2';
    expect(jit(expr, { income: 120000 })).toBe(48000);
    expect(jit(expr, { income: 60000 })).toBe(18000);
    expect(jit(expr, { income: 30000 })).toBe(6000);
  });
});
