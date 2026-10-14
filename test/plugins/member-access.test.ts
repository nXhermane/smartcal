import { describe, expect, it } from 'vitest';
import { SmartCalEngine } from '../../src/engine';
import { coreOperatorsPlugin } from '../../src/plugins/core-operators';
import { memberAccessPlugin } from '../../src/plugins/member-access';

describe('memberAccessPlugin', () => {
  it('installs without error and keeps simple expressions working', () => {
    const engine = new SmartCalEngine().use(coreOperatorsPlugin).use(memberAccessPlugin);
    expect(engine.evaluate('1 + 2')).toBe(3);
    expect(engine.listPlugins()).toContain('smartcal-member-access@2.0.0');
  });
});
