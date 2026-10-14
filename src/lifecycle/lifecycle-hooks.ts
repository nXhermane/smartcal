import type { ASTNode } from '../ast/nodes';
import type { Token } from '../scanner/token';
import { DataType, ExecutorOptions } from '../types';

export type BeforeScanHook = (source: string) => string;
export type AfterScanHook = (tokens: Token[]) => Token[];
export type AfterParseHook = (ast: ASTNode) => ASTNode;
export type BeforeEvalHook = (data: DataType, options: ExecutorOptions) => DataType;
export type AfterEvalHook = (result: number | string, options: ExecutorOptions) => number | string;

/**
 * LifecycleHooks holds the hook arrays for each pipeline stage.
 * Hooks run in registration order (FIFO).
 */
export class LifecycleHooks {
  private readonly _beforeScan: BeforeScanHook[] = [];
  private readonly _afterScan: AfterScanHook[] = [];
  private readonly _afterParse: AfterParseHook[] = [];
  private readonly _beforeEval: BeforeEvalHook[] = [];
  private readonly _afterEval: AfterEvalHook[] = [];

  addBeforeScan(hook: BeforeScanHook): void {
    this._beforeScan.push(hook);
  }

  addAfterScan(hook: AfterScanHook): void {
    this._afterScan.push(hook);
  }

  addAfterParse(hook: AfterParseHook): void {
    this._afterParse.push(hook);
  }

  addBeforeEval(hook: BeforeEvalHook): void {
    this._beforeEval.push(hook);
  }

  addAfterEval(hook: AfterEvalHook): void {
    this._afterEval.push(hook);
  }

  runBeforeScan(source: string): string {
    let s = source;
    for (const hook of this._beforeScan) s = hook(s);
    return s;
  }

  runAfterScan(tokens: Token[]): Token[] {
    let t = tokens;
    for (const hook of this._afterScan) t = hook(t);
    return t;
  }

  runAfterParse(ast: ASTNode): ASTNode {
    let a = ast;
    for (const hook of this._afterParse) a = hook(a);
    return a;
  }

  runBeforeEval(data: DataType, options: ExecutorOptions): DataType {
    let d = data;
    for (const hook of this._beforeEval) d = hook(d, options);
    return d;
  }

  runAfterEval(result: number | string, options: ExecutorOptions): number | string {
    let r = result;
    for (const hook of this._afterEval) r = hook(r, options);
    return r;
  }
}
