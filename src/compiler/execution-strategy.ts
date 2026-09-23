import type { ASTNode } from '../ast/nodes';
import type { VariableNotFoundError } from '../errors';
import type { ResolvedData } from '../resolver/formula-resolver';
import { type CompiledFn, isJITAvailable, JITCompiler } from './jit-compiler';
import { VMInterpreter } from './vm-interpreter';

/**
 * Execution mode at runtime:
 * - `'jit'`  - always use `new Function` (fastest)
 * - `'vm'`   - always use the VM interpreter (CSP-safe)
 * - `'auto'` - use JIT if available, fall back to VM automatically
 */
export type ExecMode = 'auto' | 'jit' | 'vm';

/**
 * Options for configuring the executor behavior.
 *
 * @property mode   - `'auto'` (default) | `'jit'` | `'vm'`. See {@link ExecMode}.
 * @property strict - If `true`, throws {@link VariableNotFoundError} on missing variables
 *                    instead of defaulting to `0`.
 */
export interface ExecutorOptions {
  mode?: ExecMode;
  strict?: boolean;
}

/**
 * Compile an AST into a callable function using the selected execution mode.
 *
 * Returns a `CompiledFn` that accepts a `ResolvedData` record and returns
 * `number | string`.
 */
export function createExecutor(
  ast: ASTNode,
  options: ExecutorOptions,
): (data: ResolvedData) => number | string {
  const { mode = 'auto', strict = false } = options;
  const useJIT = mode === 'jit' || (mode === 'auto' && isJITAvailable());

  if (useJIT) {
    const fn: CompiledFn = new JITCompiler(strict).compile(ast);
    return (data: ResolvedData) => fn(data as Record<string, unknown>);
  }

  const vm = new VMInterpreter(strict);
  return (data: ResolvedData) => vm.evaluate(ast, data);
}
