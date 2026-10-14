import { ASTChildrenExtractor } from '../ast/ast-extensions';
import type {
  JITBinaryOpGenerator,
  JITNodeGenerator,
  JITRuntimeHelperProvider,
} from '../compiler/jit-extensions';
import type {
  VMBinaryOpHandler,
  VMLazyBinaryOpHandler,
  VMNodeVisitor,
} from '../compiler/vm-extensions';
import type { SmartCalEngine } from '../engine';
import type {
  AfterEvalHook,
  AfterParseHook,
  AfterScanHook,
  BeforeEvalHook,
  BeforeScanHook,
} from '../lifecycle/lifecycle-hooks';
import type { LedHandler, NudHandler } from '../parser/parser-extensions';
import type { MathFn } from '../registry/function-registry';
import type { TokenHandler } from '../scanner/scanner-extensions';
import type { PluginContext } from './plugin-context';

/**
 * BoundPluginContext implements PluginContext by delegating
 * each call to the internal builders of the target SmartCalEngine.
 */
export class BoundPluginContext implements PluginContext {
  constructor(private readonly engine: SmartCalEngine) {}

  readonly ast = {
    addChildrenExtractor: (nodeType: string, extractor: ASTChildrenExtractor) =>
      this.engine._astBuilder.addChildrenExtractor(nodeType, extractor),
  };

  readonly scanner = {
    addTokenHandler: (h: TokenHandler) => this.engine._scannerBuilder.addTokenHandler(h),
    addTwoCharOp: (c1: number, c2: number, k: number) =>
      this.engine._scannerBuilder.addTwoCharOp(c1, c2, k),
    addSingleCharOp: (c: number, k: number) => this.engine._scannerBuilder.addSingleCharOp(c, k),
  };

  readonly parser = {
    addNud: (k: number, h: NudHandler) => this.engine._parserBuilder.addNud(k, h),
    addLed: (k: number, bp: number, h: LedHandler) => this.engine._parserBuilder.addLed(k, bp, h),
    addPrecedence: (k: number, bp: number) => this.engine._parserBuilder.addPrecedence(k, bp),
  };

  readonly jit = {
    addBinaryOp: (op: string, g: JITBinaryOpGenerator) =>
      this.engine._jitBuilder.addBinaryOp(op, g),
    addNodeCodegen: (t: string, g: JITNodeGenerator) =>
      this.engine._jitBuilder.addNodeCodegen(t, g),
    addRuntimeHelper: (id: string, provider: JITRuntimeHelperProvider) =>
      this.engine._jitBuilder.addRuntimeHelper(id, provider),
  };

  readonly vm = {
    addBinaryOp: (op: string, h: VMBinaryOpHandler) => this.engine._vmBuilder.addBinaryOp(op, h),
    addLazyBinaryOp: (op: string, h: VMLazyBinaryOpHandler) =>
      this.engine._vmBuilder.addLazyBinaryOp(op, h),
    addNodeVisitor: (t: string, v: VMNodeVisitor) => this.engine._vmBuilder.addNodeVisitor(t, v),
  };

  readonly functions = {
    register: (name: string, fn: MathFn) => this.engine._registry.register(name, fn),
    registerMany: (fns: Record<string, MathFn>) => this.engine._registry.registerMany(fns),
  };

  readonly hooks = {
    beforeScan: (h: BeforeScanHook) => this.engine._hooks.addBeforeScan(h),
    afterScan: (h: AfterScanHook) => this.engine._hooks.addAfterScan(h),
    afterParse: (h: AfterParseHook) => this.engine._hooks.addAfterParse(h),
    beforeEval: (h: BeforeEvalHook) => this.engine._hooks.addBeforeEval(h),
    afterEval: (h: AfterEvalHook) => this.engine._hooks.addAfterEval(h),
  };
}
