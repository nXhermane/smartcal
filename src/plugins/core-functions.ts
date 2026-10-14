import type { SmartCalPlugin } from '../plugin/types';

export const coreFunctionsPlugin: SmartCalPlugin = {
  name: 'smartcal-core-functions',
  version: '2.0.0',
  install(ctx) {
    ctx.functions.registerMany({
      abs: x => Math.abs(x as number),
      min: (...a) => Math.min(...(a as number[])),
      max: (...a) => Math.max(...(a as number[])),
      round: x => Math.round(x as number),
      floor: x => Math.floor(x as number),
      ceil: x => Math.ceil(x as number),
      sqrt: x => Math.sqrt(x as number),
      sin: x => Math.sin(x as number),
      cos: x => Math.cos(x as number),
      tan: x => Math.tan(x as number),
      log: x => Math.log(x as number),
      pow: (x, y) => (x as number) ** (y as number),
      log2: x => Math.log2(x as number),
      log10: x => Math.log10(x as number),
      sign: x => Math.sign(x as number),
      trunc: x => Math.trunc(x as number),
      exp: x => Math.exp(x as number),
      hypot: (...a) => Math.hypot(...(a as number[])),
    });
  },
};
