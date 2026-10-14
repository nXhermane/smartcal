import { describe, expect, it } from 'vitest';
import { SmartCalEngine } from '../../src/engine';
import { arrayLiteralsPlugin } from '../../src/plugins/array-literals';
import { coreOperatorsPlugin } from '../../src/plugins/core-operators';

describe('arrayLiteralsPlugin', () => {
  it('installs and parses array literals', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin).use(arrayLiteralsPlugin);
    expect(engine.evaluate('[1,2,3]', {}, { mode: 'vm' })).toBe('1,2,3');
    expect(engine.listPlugins()).toContain('smartcal-array-literals@2.0.0');
  });
});
