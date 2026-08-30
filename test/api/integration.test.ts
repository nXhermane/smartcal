/**
 * @file integration.test.ts
 * @description Integration tests for the v1.1 public API.
 *
 * Verifies that the new SmartCalV2 / compileV2 / isValidExpressionV2 functions
 * produce results identical to what the v1 API tests expect, and tests the
 * new capabilities (mode:'vm', f_* resolution, nested ternaries that crashed v1).
 */

import { describe, expect, it } from 'vitest';
import { compile as compileV2 } from '../../src/api/compile';
import { isValidExpression } from '../../src/api/is-valid-expression';
import SmartCalV2 from '../../src/api/smartcal';

// =============================================================================
describe('SmartCalV2 — basic expressions (v1 parity)', () => {
  it('1 + 2 = 3', () => expect(SmartCalV2('1 + 2')).toBe(3));
  it('5 * 3 = 15', () => expect(SmartCalV2('5 * 3')).toBe(15));
  it('expressions with variables', () => {
    expect(SmartCalV2('age + 5', { age: 25 })).toBe(30);
  });

  it('string literals (Unicode)', () => {
    expect(SmartCalV2('"cnt_phase_aiguë"')).toBe('cnt_phase_aiguë');
    expect(SmartCalV2("'café'")).toBe('café');
  });

  it('throws on empty expression', () => {
    expect(() => SmartCalV2('')).toThrow();
  });
});

// =============================================================================
describe('SmartCalV2 — nested ternaries (v1 crash fixed)', () => {
  it('evaluates a chained ternary correctly', () => {
    const expr = 'score >= 90 ? 1 : score >= 50 ? 2 : 0';
    expect(SmartCalV2(expr, { score: 95 })).toBe(1);
    expect(SmartCalV2(expr, { score: 70 })).toBe(2);
    expect(SmartCalV2(expr, { score: 30 })).toBe(0);
  });

  it('evaluates deeply nested ternary (the exact v1 crash case)', () => {
    const expr = 'age < 18 ? 0 : age < 25 ? 15 : age < 60 ? 80 : 30';
    expect(SmartCalV2(expr, { age: 10 })).toBe(0);
    expect(SmartCalV2(expr, { age: 22 })).toBe(15);
    expect(SmartCalV2(expr, { age: 40 })).toBe(80);
    expect(SmartCalV2(expr, { age: 70 })).toBe(30);
  });
});

// =============================================================================
describe('SmartCalV2 — mode:"vm" (CSP-safe path)', () => {
  it('evaluates simple expressions in VM mode', () => {
    expect(SmartCalV2('2 + 2', {}, { mode: 'vm' })).toBe(4);
  });

  it('VM mode produces same results as auto mode', () => {
    const data = { price: 50, qty: 3 };
    const auto = SmartCalV2('price * qty', data, { mode: 'auto' });
    const vmResult = SmartCalV2('price * qty', data, { mode: 'vm' });
    expect(vmResult).toBe(auto);
  });
});

// =============================================================================
describe('compileV2 — one compile, many evaluations', () => {
  it('satisfies the CompiledExpression interface (type + toString + evaluate)', () => {
    const expr = compileV2('age + 10');
    expect(expr.type).toBe('CompiledExpression');
    expect(expr.toString()).toBe('age + 10');
    expect(expr.evaluate({ age: 20 })).toBe(30);
    expect(expr.evaluate({ age: 25 })).toBe(35);
  });

  it('re-uses the compiled function without re-parsing', () => {
    const expr = compileV2('price * (1 - discount)');
    expect(expr.evaluate({ price: 100, discount: 0.2 })).toBeCloseTo(80);
    expect(expr.evaluate({ price: 200, discount: 0.1 })).toBeCloseTo(180);
  });

  it('compiles Unicode string expressions', () => {
    const expr = compileV2('"cnt_phase_aiguë"');
    expect(expr.evaluate({})).toBe('cnt_phase_aiguë');
  });

  it('compiles in VM mode', () => {
    const expr = compileV2('x * 2', { mode: 'vm' });
    expect(expr.evaluate({ x: 7 })).toBe(14);
  });
});

// =============================================================================
describe('isValidExpression — Pratt Parser powered', () => {
  it('returns true for valid expressions', () => {
    expect(isValidExpression('1 + 2')).toBe(true);
    expect(isValidExpression('(1 + 2) * 3')).toBe(true);
    expect(isValidExpression('age > 18')).toBe(true);
  });

  it('returns false for invalid expressions', () => {
    expect(isValidExpression('1 +')).toBe(false);
    expect(isValidExpression('(1 + 2')).toBe(false);
    expect(isValidExpression('1 + * 2')).toBe(false);
    expect(isValidExpression('')).toBe(false);
  });

  it('validates Unicode string expressions', () => {
    expect(isValidExpression('"cnt_phase_aiguë"')).toBe(true);
    expect(isValidExpression("'café'")).toBe(true);
    expect(isValidExpression('phase == "cnt_phase_aiguë"')).toBe(true);
  });

  it('validates nested ternaries (v1 would crash the tokenizer)', () => {
    expect(isValidExpression('a < 18 ? 0 : a < 60 ? 1 : 2')).toBe(true);
  });
});
