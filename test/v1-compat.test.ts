import { describe, expect, it } from 'vitest';
import SmartCal, {
  compile,
  extractVariables,
  FunctionRegistry,
  isValidExpression,
  VariableNotFoundError,
} from '../src/index';

describe('v1 backward compatibility', () => {
  it('SmartCal() works as before', () => {
    expect(SmartCal('price * (1 - discount)', { price: 100, discount: 0.2 })).toBe(80);
  });

  it('compile() works as before', () => {
    const expr = compile('price * qty');
    expect(expr.evaluate({ price: 10, qty: 3 })).toBe(30);
  });

  it('FunctionRegistry.register() stays functional', () => {
    FunctionRegistry.register('triple', x => (x as number) * 3);
    expect(SmartCal('triple(5)')).toBe(15);
    FunctionRegistry.unregister('triple');
  });

  it('f_* sub-formulas work', () => {
    const sub = compile('price * 0.1');
    expect(SmartCal('f_tax + price', { price: 100, f_tax: sub })).toBe(110);
  });

  it('vm mode works', () => {
    expect(SmartCal('2 ^ 10', {}, { mode: 'vm' })).toBe(1024);
  });

  it('strict mode throws VariableNotFoundError', () => {
    expect(() => SmartCal('x + 1', {}, { strict: true })).toThrow(VariableNotFoundError);
  });

  it('extractVariables and isValidExpression are unchanged', () => {
    expect(extractVariables('price * tax')).toEqual(['price', 'tax']);
    expect(isValidExpression('1 + 2')).toBe(true);
    expect(isValidExpression('1 +')).toBe(false);
  });
});
