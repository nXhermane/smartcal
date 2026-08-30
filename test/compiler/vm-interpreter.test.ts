/**
 * @file vm_interpreter.test.ts
 * @description Unit tests for the Fast VM (CSP-safe AST evaluator).
 *
 * The VM must produce **identical results** to the JIT Compiler for all
 * supported expressions. This test suite mirrors jit_compiler.test.ts exactly
 * to guarantee parity between the two execution paths.
 */

import { describe, expect, it } from 'vitest';
import { JITCompiler } from '../../src/compiler/jit-compiler';
import { VMInterpreter } from '../../src/compiler/vm-interpreter';
import { parse } from '../../src/parser/parser';

const vm = new VMInterpreter();

/** Shorthand: parse expression + VM evaluate with data. */
function vmRun(expr: string, data: Record<string, unknown> = {}): number | string {
  return vm.evaluate(parse(expr), data);
}

// =============================================================================
describe('VMInterpreter — literals', () => {
  it('evaluates an integer literal', () => expect(vmRun('42')).toBe(42));
  it('evaluates a float literal', () => expect(vmRun('3.14')).toBe(3.14));
  it('evaluates a string literal', () => expect(vmRun('"hello"')).toBe('hello'));
  it('evaluates Unicode string literal', () =>
    expect(vmRun('"cnt_phase_aiguë"')).toBe('cnt_phase_aiguë'));
});

// =============================================================================
describe('VMInterpreter — identifiers / variables', () => {
  it('reads a variable from data', () => {
    expect(vmRun('price', { price: 42 })).toBe(42);
  });

  it('defaults missing variable to 0', () => {
    expect(vmRun('missing')).toBe(0);
  });

  it('reads multiple variables', () => {
    expect(vmRun('price * qty', { price: 10, qty: 3 })).toBe(30);
  });
});

// =============================================================================
describe('VMInterpreter — arithmetic', () => {
  it('addition', () => expect(vmRun('2 + 3')).toBe(5));
  it('subtraction', () => expect(vmRun('10 - 4')).toBe(6));
  it('multiplication', () => expect(vmRun('3 * 4')).toBe(12));
  it('division', () => expect(vmRun('10 / 4')).toBe(2.5));
  it('modulo', () => expect(vmRun('10 % 3')).toBe(1));
  it('exponentiation (^)', () => expect(vmRun('2 ^ 10')).toBe(1024));

  it('operator precedence: 2 + 3 * 4 = 14', () => {
    expect(vmRun('2 + 3 * 4')).toBe(14);
  });

  it('parentheses: (2 + 3) * 4 = 20', () => {
    expect(vmRun('(2 + 3) * 4')).toBe(20);
  });

  it('unary minus: -5', () => expect(vmRun('-5')).toBe(-5));
  it('unary minus with variable', () => expect(vmRun('-x', { x: 7 })).toBe(-7));
});

// =============================================================================
describe('VMInterpreter — comparisons (return 1 or 0)', () => {
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
    expect(vmRun(expr)).toBe(expected);
  });
});

// =============================================================================
describe('VMInterpreter — logical short-circuit', () => {
  it('1 && 1 → 1', () => expect(vmRun('1 && 1')).toBe(1));
  it('1 && 0 → 0', () => expect(vmRun('1 && 0')).toBe(0));
  it('0 && 1 → 0 (short-circuit)', () => expect(vmRun('0 && 1')).toBe(0));
  it('0 || 1 → 1', () => expect(vmRun('0 || 1')).toBe(1));
  it('0 || 0 → 0', () => expect(vmRun('0 || 0')).toBe(0));
  it('1 || 0 → 1 (short-circuit)', () => expect(vmRun('1 || 0')).toBe(1));
});

// =============================================================================
describe('VMInterpreter — ternary conditionals', () => {
  it('simple ternary: true branch', () => expect(vmRun('1 ? 42 : 0')).toBe(42));
  it('simple ternary: false branch', () => expect(vmRun('0 ? 42 : 99')).toBe(99));

  it('ternary with comparison', () => {
    expect(vmRun('score >= 90 ? 1 : 0', { score: 95 })).toBe(1);
    expect(vmRun('score >= 90 ? 1 : 0', { score: 80 })).toBe(0);
  });

  it('deeply nested ternary (v1 crash regression)', () => {
    const expr = 'age < 18 ? 0 : age < 25 ? 15 : age < 60 ? 80 : 30';
    expect(vmRun(expr, { age: 10 })).toBe(0);
    expect(vmRun(expr, { age: 22 })).toBe(15);
    expect(vmRun(expr, { age: 40 })).toBe(80);
    expect(vmRun(expr, { age: 70 })).toBe(30);
  });
});

// =============================================================================
describe('VMInterpreter — function calls (builtins)', () => {
  it('abs(-5) = 5', () => expect(vmRun('abs(-5)')).toBe(5));
  it('max(2, 7, 3) = 7', () => expect(vmRun('max(2, 7, 3)')).toBe(7));
  it('min(2, 7, 3) = 2', () => expect(vmRun('min(2, 7, 3)')).toBe(2));
  it('round(3.7) = 4', () => expect(vmRun('round(3.7)')).toBe(4));
  it('floor(3.9) = 3', () => expect(vmRun('floor(3.9)')).toBe(3));
  it('ceil(3.1) = 4', () => expect(vmRun('ceil(3.1)')).toBe(4));
  it('sqrt(16) = 4', () => expect(vmRun('sqrt(16)')).toBe(4));
  it('pow(2, 8) = 256', () => expect(vmRun('pow(2, 8)')).toBe(256));
});

// =============================================================================
describe('VMInterpreter — JIT parity check', () => {
  /**
   * For every expression below, the VM and JIT MUST return the same result.
   * This is the key correctness invariant of the dual-engine architecture.
   */
  const cases: Array<[string, Record<string, unknown>]> = [
    ['price * (1 - discount)', { price: 100, discount: 0.2 }],
    ['a + b * c', { a: 1, b: 2, c: 3 }],
    ['x >= 10 ? x * 2 : x', { x: 15 }],
    ['x >= 10 ? x * 2 : x', { x: 5 }],
    ['max(a, b, c)', { a: 3, b: 9, c: 5 }],
    ['abs(-42)', {}],
  ];

  for (const [expr, data] of cases) {
    it(`parity: ${expr}`, () => {
      const vmResult = vmRun(expr, data);
      const jitResult = JITCompiler.compile(parse(expr))(data);
      expect(vmResult).toBe(jitResult);
    });
  }
});
