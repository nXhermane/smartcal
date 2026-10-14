import type { ASTNode } from '../ast/nodes';
import type { InstanceFunctionRegistry } from '../registry/instance-registry';
import { DataType, ExecutorOptions } from '../types';
import { type CompiledFn, isJITAvailable, JITCompiler } from './jit-compiler';
import type { JITExtensions } from './jit-extensions';
import type { VMExtensions } from './vm-extensions';
import { VMInterpreter } from './vm-interpreter';

export interface ExecutorContext {
  functions?: InstanceFunctionRegistry;
  jitExtensions?: JITExtensions;
  vmExtensions?: VMExtensions;
}

/**
 * Compile an AST into a callable function using the selected execution mode.
 *
 * Returns a `CompiledFn` that accepts a `DataType` record and returns
 * `number | string`.
 */
export function createExecutor(
  ast: ASTNode,
  options: ExecutorOptions,
  ctx: ExecutorContext = {},
): (data: DataType) => number | string {
  const { mode = 'auto', strict = false } = options;
  const useJIT = mode === 'jit' || (mode === 'auto' && isJITAvailable());

  if (useJIT) {
    const fn: CompiledFn = new JITCompiler(
      { mode: 'jit', strict },
      ctx.functions,
      ctx.jitExtensions,
    ).compile(ast);
    return (data: DataType) => fn(data as Record<string, unknown>);
  }

  const vm = new VMInterpreter({ mode: 'vm', strict }, ctx.functions, ctx.vmExtensions);
  return (data: DataType) => vm.evaluate(ast, data);
}
