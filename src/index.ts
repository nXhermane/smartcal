/**
 * @file index.ts
 * @description Public exports for the SmartCal v1.1 core engine (src/).
 *
 * This barrel file exposes the new Scanner + Pratt Parser + JIT/VM pipeline.
 */

export { type CompileOptions, compile } from './api/compile';
export { isValidExpression } from './api/is-valid-expression';

export { default, type SmartCalOptions } from './api/smartcal';

export type {
  ArrayLiteralNode,
  ASTNode,
  BinaryNode,
  ConditionalNode,
  FunctionCallNode,
  IdentifierNode,
  LiteralNode,
  MemberExpressionNode,
  UnaryNode,
} from './ast/nodes';
export {
  isArrayLiteral,
  isBinary,
  isConditional,
  isFunctionCall,
  isIdentifier,
  isLiteral,
  isMemberExpression,
  isUnary,
} from './ast/nodes';
export type { ExecMode } from './compiler/execution-strategy';
export { createExecutor } from './compiler/execution-strategy';
export type { CompiledFn } from './compiler/jit-compiler';
export { isJITAvailable, JITCompiler } from './compiler/jit-compiler';
export { VMInterpreter } from './compiler/vm-interpreter';
export {
  FormulaInterpreterError,
  FormulaResolutionError,
  FormulaVariableNotFoundError,
  IncorrectSyntaxError,
  InvalidFormulaError,
  JITError,
  ParseError,
  ScanError,
  VMError,
} from './errors/index';
export { Parser, parse } from './parser/parser';
export { getInfixBP, INFIX_BP } from './parser/precedence';
export type { MathFn } from './registry/function-registry';
export { FunctionRegistry } from './registry/function-registry';
export type { RawData, ResolvedData } from './resolver/formula-resolver';
export { FormulaResolver } from './resolver/formula-resolver';
export { Scanner } from './scanner/scanner';
export type { Token } from './scanner/token';
export { TokenKind } from './scanner/token';
export type {
  CompiledExpression,
  ConditionResultType,
  DataType,
} from './types';
export { ConditionResult } from './types';
