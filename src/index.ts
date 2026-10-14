import { globalEngine } from './global-engine';
import type { SmartCalPlugin } from './plugin/types';

export { compile } from './api/compile';
export { extractVariables } from './api/extract-variables';
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
  extractRequiredVariables,
  isArrayLiteral,
  isBinary,
  isConditional,
  isFunctionCall,
  isIdentifier,
  isLiteral,
  isMemberExpression,
  isUnary,
} from './ast/nodes';
export { createExecutor } from './compiler/execution-strategy';
export type { CompiledFn } from './compiler/jit-compiler';
export { isJITAvailable, JITCompiler } from './compiler/jit-compiler';
export { VMInterpreter } from './compiler/vm-interpreter';
export type { EngineOptions, EvalOptions } from './engine';
export { SmartCalEngine } from './engine';
export {
  FormulaInterpreterError,
  FormulaResolutionError,
  FormulaVariableNotFoundError,
  IncorrectSyntaxError,
  InvalidFormulaError,
  JITError,
  ParseError,
  ScanError,
  VariableNotFoundError,
  VMError,
} from './errors/index';
export { globalEngine } from './global-engine';
export { Parser, parse } from './parser/parser';
export type { ParseExprFn } from './parser/parser-extensions';
export { getInfixBP, INFIX_BP } from './parser/precedence';
export type { PluginContext } from './plugin/plugin-context';
export type { SmartCalPlugin } from './plugin/types';
export { arrayLiteralsPlugin } from './plugins/array-literals';
export { coreFunctionsPlugin } from './plugins/core-functions';
export { coreOperatorsPlugin } from './plugins/core-operators';
export { formulaResolverPlugin } from './plugins/formula-resolver';
export { memberAccessPlugin } from './plugins/member-access';
export type { MathFn } from './registry/function-registry';
export { FunctionRegistry } from './registry/function-registry';
export { Scanner } from './scanner/scanner';
export type { Token } from './scanner/token';
export { TokenKind } from './scanner/token';
export type {
  CompiledExpression,
  ConditionResultType,
  DataType,
  ExecMode,
} from './types';
export { ConditionResult } from './types';

/**
 * Registers a plugin on the global instance.
 * Affects all subsequent SmartCal() calls.
 */
export function usePlugin(plugin: SmartCalPlugin): void {
  globalEngine.use(plugin);
}
