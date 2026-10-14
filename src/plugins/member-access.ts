import { VariableNotFoundError } from '../errors';
import type { SmartCalPlugin } from '../plugin/types';

export const memberAccessPlugin: SmartCalPlugin = {
  name: 'smartcal-member-access',
  version: '2.0.0',
  install(ctx) {
    ctx.jit.addNodeCodegen('MemberExpression', (node, compile) => {
      const obj = compile(node.object);
      const computed = node.computed as boolean;
      const prop = computed
        ? compile(node.property)
        : JSON.stringify((node.property as unknown as { name: string }).name);
      return `(${obj}[${prop}]??0)`;
    });

    ctx.vm.addNodeVisitor('MemberExpression', (node, visit, data, options) => {
      const obj = visit(node.object, data);
      const computed = node.computed as boolean;
      const prop = computed ? visit(node.property, data) : (node.property as { name: string }).name;

      const container = obj as unknown as Record<string | number, unknown>;
      const val = container[prop as string | number];

      if (val === undefined) {
        if (options.strict) {
          throw new VariableNotFoundError(String(prop));
        }
        return 0;
      }
      return typeof val === 'number' || typeof val === 'string' ? val : 0;
    });
  },
};
