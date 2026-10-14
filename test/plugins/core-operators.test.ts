import { describe, expect, it } from 'vitest';
import { SmartCalEngine } from '../../src/engine';
import { coreOperatorsPlugin } from '../../src/plugins/core-operators';

describe('coreOperatorsPlugin', () => {
  it('evaluates arithmetic and comparisons in jit and vm', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin);
    for (const mode of ['jit', 'vm'] as const) {
      expect(engine.evaluate('2 + 3 * 4', {}, { mode })).toBe(14);
      expect(engine.evaluate('2 ^ 10', {}, { mode })).toBe(1024);
      expect(engine.evaluate('1 < 2 ? 10 : 20', {}, { mode })).toBe(10);
      expect(engine.evaluate('1 && 0', {}, { mode })).toBe(0);
      expect(engine.evaluate('1 || 0', {}, { mode })).toBe(1);
    }
  });
});
