import type { SmartCalPlugin } from '../plugin/types';

export const coreOperatorsPlugin: SmartCalPlugin = {
  name: 'smartcal-core-operators',
  version: '2.0.0',
  install(ctx) {
    ctx.jit.addBinaryOp('+', (l, r) => `((${l})+(${r}))`);
    ctx.jit.addBinaryOp('-', (l, r) => `((${l})-(${r}))`);
    ctx.jit.addBinaryOp('*', (l, r) => `((${l})*(${r}))`);
    ctx.jit.addBinaryOp('/', (l, r) => `((${l})/(${r}))`);
    ctx.jit.addBinaryOp('%', (l, r) => `((${l})%(${r}))`);
    ctx.jit.addBinaryOp('^', (l, r) => `Math.pow((${l}),(${r}))`);
    ctx.jit.addBinaryOp('==', (l, r) => `((${l})===(${r})?1:0)`);
    ctx.jit.addBinaryOp('!=', (l, r) => `((${l})!==(${r})?1:0)`);
    ctx.jit.addBinaryOp('<', (l, r) => `((${l})<(${r})?1:0)`);
    ctx.jit.addBinaryOp('>', (l, r) => `((${l})>(${r})?1:0)`);
    ctx.jit.addBinaryOp('<=', (l, r) => `((${l})<=(${r})?1:0)`);
    ctx.jit.addBinaryOp('>=', (l, r) => `((${l})>=(${r})?1:0)`);
    ctx.jit.addBinaryOp('&&', (l, r) => `((${l})&&(${r})?1:0)`);
    ctx.jit.addBinaryOp('||', (l, r) => `((${l})||(${r})?1:0)`);

    ctx.vm.addBinaryOp('+', (l, r) => (l as number) + (r as number));
    ctx.vm.addBinaryOp('-', (l, r) => (l as number) - (r as number));
    ctx.vm.addBinaryOp('*', (l, r) => (l as number) * (r as number));
    ctx.vm.addBinaryOp('/', (l, r) => (l as number) / (r as number));
    ctx.vm.addBinaryOp('%', (l, r) => (l as number) % (r as number));
    ctx.vm.addBinaryOp('^', (l, r) => (l as number) ** (r as number));
    ctx.vm.addBinaryOp('==', (l, r) => (l === r ? 1 : 0));
    ctx.vm.addBinaryOp('!=', (l, r) => (l !== r ? 1 : 0));
    ctx.vm.addBinaryOp('<', (l, r) => ((l as number) < (r as number) ? 1 : 0));
    ctx.vm.addBinaryOp('>', (l, r) => ((l as number) > (r as number) ? 1 : 0));
    ctx.vm.addBinaryOp('<=', (l, r) => ((l as number) <= (r as number) ? 1 : 0));
    ctx.vm.addBinaryOp('>=', (l, r) => ((l as number) >= (r as number) ? 1 : 0));
    ctx.vm.addLazyBinaryOp('&&', (left, right, evaluate) => {
      const l = evaluate(left);
      if (!l) return 0;
      return evaluate(right) ? 1 : 0;
    });

    ctx.vm.addLazyBinaryOp('||', (left, right, evaluate) => {
      const l = evaluate(left);
      if (l) return 1;
      return evaluate(right) ? 1 : 0;
    });
  },
};
