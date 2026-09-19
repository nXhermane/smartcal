import { describe, expect, it } from 'vitest';
import { compile } from '../../src/api/compile';
import { isValidExpression } from '../../src/api/is-valid-expression';
import SmartCal from '../../src/api/smartcal';

describe('SmartCal : basic expressions', () => {
  it('1 + 2 = 3', () => expect(SmartCal('1 + 2')).toBe(3));
  it('5 * 3 = 15', () => expect(SmartCal('5 * 3')).toBe(15));
  it('expressions with variables', () => {
    expect(SmartCal('age + 5', { age: 25 })).toBe(30);
  });

  it('string literals (Unicode)', () => {
    expect(SmartCal('"cnt_phase_aiguë"')).toBe('cnt_phase_aiguë');
    expect(SmartCal("'café'")).toBe('café');
  });

  it('throws on empty expression', () => {
    expect(() => SmartCal('')).toThrow();
  });
});

describe('SmartCal : nested ternaries', () => {
  it('evaluates a chained ternary correctly', () => {
    const expr = 'score >= 90 ? 1 : score >= 50 ? 2 : 0';
    expect(SmartCal(expr, { score: 95 })).toBe(1);
    expect(SmartCal(expr, { score: 70 })).toBe(2);
    expect(SmartCal(expr, { score: 30 })).toBe(0);
  });

  it('evaluates deeply nested ternary (the exact v1 crash case)', () => {
    const expr = 'age < 18 ? 0 : age < 25 ? 15 : age < 60 ? 80 : 30';
    expect(SmartCal(expr, { age: 10 })).toBe(0);
    expect(SmartCal(expr, { age: 22 })).toBe(15);
    expect(SmartCal(expr, { age: 40 })).toBe(80);
    expect(SmartCal(expr, { age: 70 })).toBe(30);
  });
});

describe('SmartCal : mode:"vm" (CSP-safe path)', () => {
  it('evaluates simple expressions in VM mode', () => {
    expect(SmartCal('2 + 2', {}, { mode: 'vm' })).toBe(4);
  });

  it('VM mode produces same results as auto mode', () => {
    const data = { price: 50, qty: 3 };
    const auto = SmartCal('price * qty', data, { mode: 'auto' });
    const vmResult = SmartCal('price * qty', data, { mode: 'vm' });
    expect(vmResult).toBe(auto);
  });
});

describe('compile : one compile, many evaluations', () => {
  it('satisfies the CompiledExpression interface (type + toString + evaluate)', () => {
    const expr = compile('age + 10');
    expect(expr.type).toBe('CompiledExpression');
    expect(expr.toString()).toBe('age + 10');
    expect(expr.evaluate({ age: 20 })).toBe(30);
    expect(expr.evaluate({ age: 25 })).toBe(35);
  });

  it('re-uses the compiled function without re-parsing', () => {
    const expr = compile('price * (1 - discount)');
    expect(expr.evaluate({ price: 100, discount: 0.2 })).toBeCloseTo(80);
    expect(expr.evaluate({ price: 200, discount: 0.1 })).toBeCloseTo(180);
  });

  it('compiles Unicode string expressions', () => {
    const expr = compile('"cnt_phase_aiguë"');
    expect(expr.evaluate({})).toBe('cnt_phase_aiguë');
  });

  it('compiles in VM mode', () => {
    const expr = compile('x * 2', { mode: 'vm' });
    expect(expr.evaluate({ x: 7 })).toBe(14);
  });
});

describe('isValidExpression : Pratt Parser powered', () => {
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

  it('validates nested ternaries', () => {
    expect(isValidExpression('a < 18 ? 0 : a < 60 ? 1 : 2')).toBe(true);
  });
});
