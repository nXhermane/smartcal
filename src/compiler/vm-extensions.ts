import { ASTNode } from '../ast/nodes';
import { ExecutorOptions } from '../types';
import type { DataRecord } from './vm-interpreter';

export type VMBinaryOpHandler = (l: unknown, r: unknown) => number | string;

export type VMLazyBinaryOpHandler = (
  leftNode: ASTNode,
  rightNode: ASTNode,
  evalNode: (node: ASTNode) => number | string,
  options: ExecutorOptions,
) => number | string;

export type VMNodeVisitor = (
  node: Record<string, unknown>,
  visit: (subNode: unknown, data: DataRecord) => number | string,
  data: DataRecord,
  options: ExecutorOptions,
) => number | string;

export interface VMExtensions {
  readonly binaryOps: ReadonlyMap<string, VMBinaryOpHandler>;
  readonly lazyBinaryOps: ReadonlyMap<string, VMLazyBinaryOpHandler>;
  readonly nodeVisitors: ReadonlyMap<string, VMNodeVisitor>;
}

export class VMExtensionsBuilder {
  private readonly _binaryOps: Map<string, VMBinaryOpHandler> = new Map();
  private readonly _lazyBinaryOps: Map<string, VMLazyBinaryOpHandler> = new Map();
  private readonly _nodeVisitors: Map<string, VMNodeVisitor> = new Map();

  addBinaryOp(op: string, handler: VMBinaryOpHandler): void {
    this._binaryOps.set(op, handler);
  }

  addLazyBinaryOp(op: string, handler: VMLazyBinaryOpHandler): void {
    this._lazyBinaryOps.set(op, handler);
  }

  addNodeVisitor(nodeType: string, visitor: VMNodeVisitor): void {
    this._nodeVisitors.set(nodeType, visitor);
  }

  build(): VMExtensions {
    return {
      binaryOps: new Map(this._binaryOps),
      lazyBinaryOps: new Map(this._lazyBinaryOps),
      nodeVisitors: new Map(this._nodeVisitors),
    };
  }
}
