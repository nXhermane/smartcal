import { ExecutorOptions } from '../types';

/**
 * JIT code generator for a custom binary operator.
 * Receives the JS strings for the left and right operands.
 * Must return a valid JS string (expression, not statement).
 */
export type JITBinaryOpGenerator = (l: string, r: string) => string;

/**
 * JIT code generator for a custom AST node type.
 */
export type JITNodeGenerator = (
  node: Record<string, unknown>,
  compile: (subNode: unknown) => string,
  options: ExecutorOptions,
) => string;

/**
 *
 */
export type JITRuntimeHelperProvider = (options: ExecutorOptions) => unknown;

const FORBIDDEN_IDENTIFIERS = new Set([
  '__proto__',
  'prototype',
  'constructor',
  'd', // used by JIT as data record name : (d) => ...
  '__registry', // reserved for functions
  '__onMissing', // reserved for variable missing on strict mode
]);
/**
 * Convention : start with '__'.
 */
function assertValidHelperIdentifier(identifier: string): void {
  if (!/^__[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new RangeError(
      `Invalid JIT runtime helper identifier "${identifier}". ` +
        `Helper names must match pattern /^__[a-zA-Z0-9_]+$/ (e.g., "__myHelper").`,
    );
  }

  if (FORBIDDEN_IDENTIFIERS.has(identifier)) {
    throw new RangeError(`Cannot register reserved JIT runtime helper identifier "${identifier}".`);
  }
}

export interface JITExtensions {
  readonly binaryOps: ReadonlyMap<string, JITBinaryOpGenerator>;
  readonly nodeGenerators: ReadonlyMap<string, JITNodeGenerator>;
  readonly runtimeHelpers: ReadonlyMap<string, JITRuntimeHelperProvider>;
}

export class JITExtensionsBuilder {
  private readonly _binaryOps: Map<string, JITBinaryOpGenerator> = new Map();
  private readonly _nodeGenerators: Map<string, JITNodeGenerator> = new Map();
  private readonly _runtimeHelpers: Map<string, JITRuntimeHelperProvider> = new Map();

  addBinaryOp(op: string, generator: JITBinaryOpGenerator): void {
    this._binaryOps.set(op, generator);
  }

  addNodeCodegen(nodeType: string, generator: JITNodeGenerator): void {
    this._nodeGenerators.set(nodeType, generator);
  }

  addRuntimeHelper(identifier: string, provider: JITRuntimeHelperProvider): void {
    assertValidHelperIdentifier(identifier);

    if (this._runtimeHelpers.has(identifier)) {
      throw new RangeError(
        `JIT collision: Runtime helper "${identifier}" is already registered by another plugin.`,
      );
    }

    this._runtimeHelpers.set(identifier, provider);
  }

  build(): JITExtensions {
    return {
      binaryOps: new Map(this._binaryOps),
      nodeGenerators: new Map(this._nodeGenerators),
      runtimeHelpers: new Map(this._runtimeHelpers),
    };
  }
}
