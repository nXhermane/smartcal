import { describe, expect, it } from 'vitest';
import { SmartCalEngine } from '../src/engine';
import { arrayLiteralsPlugin } from '../src/plugins/array-literals';
import { coreFunctionsPlugin } from '../src/plugins/core-functions';
import { coreOperatorsPlugin } from '../src/plugins/core-operators';
import { formulaResolverPlugin } from '../src/plugins/formula-resolver';
import { memberAccessPlugin } from '../src/plugins/member-access';

describe('SmartCalEngine', () => {
  it('evaluates a simple expression', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin);
    expect(engine.evaluate('2 + 3')).toBe(5);
  });

  it('use() is idempotent', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin);
    engine.use(coreOperatorsPlugin);
    expect(engine.listPlugins()).toHaveLength(1);
  });

  it('two instances are isolated', () => {
    const e1 = new SmartCalEngine().use({
      name: 'custom',
      install(ctx) {
        ctx.functions.register('double', x => (x as number) * 2);
      },
    });
    const e2 = new SmartCalEngine();
    expect(e1.evaluate('double(5)', {}, { strict: true })).toBe(10);
    expect(() => e2.evaluate('double(5)', {}, { strict: true })).toThrow();
  });

  it('beforeScan hook rewrites the source', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin).use(coreFunctionsPlugin);
    engine.use({
      name: 'alias',
      install(ctx) {
        ctx.hooks.beforeScan(src => src.replace(/PI/g, '3.14159'));
      },
    });
    expect(engine.evaluate('PI * 2')).toBeCloseTo(6.28318, 4);
  });

  it('afterEval hook post-processes the result', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin);
    engine.use({
      name: 'rounder',
      install(ctx) {
        ctx.hooks.afterEval(r => Math.round(r as number));
      },
    });
    expect(engine.evaluate('1 / 3')).toBe(0);
  });

  it('compile() parses once and reuses the executor', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin);
    const expr = engine.compile('price * qty');
    expect(expr.evaluate({ price: 10, qty: 3 })).toBe(30);
    expect(expr.evaluate({ price: 5, qty: 4 })).toBe(20);
  });

  it('full default stack evaluates simple expressions', () => {
    const engine = new SmartCalEngine()
      .use(coreOperatorsPlugin)
      .use(coreFunctionsPlugin)
      .use(memberAccessPlugin)
      .use(arrayLiteralsPlugin)
      .use(formulaResolverPlugin);
    expect(engine.evaluate('a + b', { a: 2, b: 3 })).toBe(5);
    expect(engine.listPlugins()).toHaveLength(5);
  });
});

describe('Custom plugin', () => {
  it('a plugin can add a custom operator via JIT and VM', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin).use({
      name: 'test-floor-div',
      install(ctx) {
        const FloorDivToken = 1000;
        ctx.scanner.addTwoCharOp('\\'.charCodeAt(0), '\\'.charCodeAt(0), FloorDivToken);
        ctx.parser.addLed(FloorDivToken, 30, (_op, left, parseExpr) => ({
          type: 'Binary',
          op: '//',
          left,
          right: parseExpr(30),
        }));
        ctx.jit.addBinaryOp('//', (l, r) => `Math.floor((${l})/(${r}))`);
        ctx.vm.addBinaryOp('//', (l, r) => Math.floor((l as number) / (r as number)));
      },
    });

    expect(engine.evaluate('7 \\\\ 2', {}, { mode: 'vm' })).toBe(3);
    expect(engine.evaluate('7 \\\\ 2', {}, { mode: 'jit' })).toBe(3);
  });
});
