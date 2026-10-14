import { describe, expect, it } from 'vitest';
import { LifecycleHooks } from '../../src/lifecycle/lifecycle-hooks';

describe('LifecycleHooks', () => {
  it('passes through untouched when no hooks registered', () => {
    const hooks = new LifecycleHooks();
    expect(hooks.runBeforeScan('1 + 2')).toBe('1 + 2');
    const tokens: never[] = [];
    expect(hooks.runAfterScan(tokens)).toBe(tokens);
    const ast = { type: 'Literal', value: 1 } as const;
    expect(hooks.runAfterParse(ast)).toBe(ast);
    expect(hooks.runBeforeEval({}, {})).toEqual({});
    expect(hooks.runAfterEval(42, {})).toBe(42);
  });

  it('runs hooks in registration order (FIFO)', () => {
    const hooks = new LifecycleHooks();
    hooks.addBeforeScan(s => `${s}!`);
    hooks.addBeforeScan(s => `${s}?`);
    expect(hooks.runBeforeScan('a')).toBe('a!?');
  });

  it('chains afterEval hooks', () => {
    const hooks = new LifecycleHooks();
    hooks.addAfterEval(r => (r as number) + 1);
    hooks.addAfterEval(r => (r as number) * 2);
    expect(hooks.runAfterEval(5, {})).toBe(12);
  });
});
