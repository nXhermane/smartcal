/**
 * @file execution_strategy.ts
 * @description Hybrid JIT / VM execution strategy for SmartCal v1.1.
 *
 * Selects the fastest available execution mode at runtime:
 * - `'jit'`  — always use `new Function` (fastest, ~10M ops/s)
 * - `'vm'`   — always use the VM interpreter (CSP-safe, ~2M ops/s)
 * - `'auto'` — use JIT if available, fall back to VM automatically
 */

import type { ASTNode } from '../ast/nodes';
import type { ResolvedData } from '../resolver/formula-resolver';
import { type CompiledFn, isJITAvailable, JITCompiler } from './jit-compiler';
import { VMInterpreter } from './vm-interpreter';

export type ExecMode = 'auto' | 'jit' | 'vm';

/**
 * Compile an AST into a callable function using the selected execution mode.
 *
 * Returns a `CompiledFn` that accepts a `ResolvedData` record and returns
 * `number | string`.
 */
export function createExecutor(
  ast: ASTNode,
  mode: ExecMode = 'auto',
): (data: ResolvedData) => number | string {
  const useJIT = mode === 'jit' || (mode === 'auto' && isJITAvailable());

  if (useJIT) {
    const fn: CompiledFn = JITCompiler.compile(ast);
    return (data: ResolvedData) => fn(data as Record<string, unknown>);
  }

  const vm = new VMInterpreter();
  return (data: ResolvedData) => vm.evaluate(ast, data);
}
