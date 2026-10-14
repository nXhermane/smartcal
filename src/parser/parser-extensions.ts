import type { ASTNode } from '../ast/nodes';
import type { Token } from '../scanner/token';

/**
 * Callback injected into NUD/LED handlers so a handler
 * can recursively invoke the Pratt parser.
 */
export type ParseExprFn = (minBP: number) => ASTNode;

/**
 * NUD handler (Null Denotation = prefix position).
 * Called when the token appears at the start of an expression or after an operator.
 */
export type NudHandler = (token: Token, parseExpr: ParseExprFn) => ASTNode;

/**
 * LED handler (Left Denotation = infix/postfix position).
 * Called when the token appears after an expression (left).
 */
export type LedHandler = (op: Token, left: ASTNode, parseExpr: ParseExprFn) => ASTNode;

/**
 * Container for the extensions registered for the Parser.
 */
export interface ParserExtensions {
  readonly nudHandlers: ReadonlyMap<number, NudHandler>;
  readonly ledHandlers: ReadonlyMap<number, LedHandler>;
  readonly bindingPowers: ReadonlyMap<number, number>;
}

/**
 * Mutable builder for ParserExtensions.
 */
export class ParserExtensionsBuilder {
  private readonly _nudHandlers: Map<number, NudHandler> = new Map();
  private readonly _ledHandlers: Map<number, LedHandler> = new Map();
  private readonly _bindingPowers: Map<number, number> = new Map();

  addNud(kind: number, handler: NudHandler): void {
    this._nudHandlers.set(kind, handler);
  }

  addLed(kind: number, bp: number, handler: LedHandler): void {
    this._ledHandlers.set(kind, handler);
    this._bindingPowers.set(kind, bp);
  }

  addPrecedence(kind: number, bp: number): void {
    this._bindingPowers.set(kind, bp);
  }

  build(): ParserExtensions {
    return {
      nudHandlers: new Map(this._nudHandlers),
      ledHandlers: new Map(this._ledHandlers),
      bindingPowers: new Map(this._bindingPowers),
    };
  }
}
