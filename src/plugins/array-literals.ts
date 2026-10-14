import type { SmartCalPlugin } from '../plugin/types';

export const arrayLiteralsPlugin: SmartCalPlugin = {
  name: 'smartcal-array-literals',
  version: '2.0.0',
  install(ctx) {
    ctx.jit.addNodeCodegen('ArrayLiteral', (node, compile) => {
      const elements = (node.elements as unknown[]).map(e => compile(e));
      return `[${elements.join(',')}]`;
    });

    ctx.vm.addNodeVisitor('ArrayLiteral', (node, visit, data) => {
      return (node.elements as unknown[]).map(e => visit(e, data)).join(',');
    });
  },
};
