import { describe, expect, it } from 'vitest';
import { SmartCalEngine } from '../../src/engine';
import { coreFunctionsPlugin } from '../../src/plugins/core-functions';
import { coreOperatorsPlugin } from '../../src/plugins/core-operators';

describe('coreFunctionsPlugin', () => {
  it('registers all builtin math functions', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin).use(coreFunctionsPlugin);
    expect(engine.evaluate('abs(0 - 5)')).toBe(5);
    expect(engine.evaluate('min(3, 1, 2)')).toBe(1);
    expect(engine.evaluate('max(3, 1, 2)')).toBe(3);
    expect(engine.evaluate('sqrt(16)')).toBe(4);
    expect(engine.evaluate('pow(2, 10)')).toBe(1024);
    expect(engine.evaluate('round(2.5)')).toBe(3);
  });
});
