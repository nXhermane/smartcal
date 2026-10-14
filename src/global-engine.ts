import { SmartCalEngine } from './engine';
import { arrayLiteralsPlugin } from './plugins/array-literals';
import { coreFunctionsPlugin } from './plugins/core-functions';
import { coreOperatorsPlugin } from './plugins/core-operators';
import { formulaResolverPlugin } from './plugins/formula-resolver';
import { memberAccessPlugin } from './plugins/member-access';

export const globalEngine = new SmartCalEngine()
  .use(coreOperatorsPlugin)
  .use(coreFunctionsPlugin)
  .use(memberAccessPlugin)
  .use(arrayLiteralsPlugin)
  .use(formulaResolverPlugin);
