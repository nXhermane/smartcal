import { describe, expect, it } from 'vitest';
import { compile } from '../../src/api/compile';
import { SmartCalEngine } from '../../src/engine';
import { arrayLiteralsPlugin } from '../../src/plugins/array-literals';
import { coreFunctionsPlugin } from '../../src/plugins/core-functions';
import { coreOperatorsPlugin } from '../../src/plugins/core-operators';
import { formulaResolverPlugin } from '../../src/plugins/formula-resolver';
import { memberAccessPlugin } from '../../src/plugins/member-access';

describe('formulaResolverPlugin', () => {
  it('is a no-op that keeps f_* sub-formulas working', () => {
    const engine = new SmartCalEngine()
      .use(coreOperatorsPlugin)
      .use(coreFunctionsPlugin)
      .use(memberAccessPlugin)
      .use(arrayLiteralsPlugin)
      .use(formulaResolverPlugin);
    const sub = engine.compile('price * 0.1');
    expect(engine.evaluate('f_tax + price', { price: 100, f_tax: sub })).toBe(110);
    expect(compile).toBeDefined();
  });
});
