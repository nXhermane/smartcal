import { ASTChildrenExtractor } from '../ast/ast-extensions';
import type { JITBinaryOpGenerator, JITNodeGenerator } from '../compiler/jit-extensions';
import type {
  VMBinaryOpHandler,
  VMLazyBinaryOpHandler,
  VMNodeVisitor,
} from '../compiler/vm-extensions';
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
import type { ExecutorOptions } from '../types';

/**
 * Extension surface exposed to a plugin during its `install(ctx)` call.
 *
 * Each sub-namespace maps directly to a layer in the SmartCal evaluation lifecycle:
 * - `ast`: AST traversal and introspection for custom node types
 * - `scanner`: Custom lexical tokenization rules and operator symbols
 * - `parser`: Pratt parsing rules (Null and Left Denotations, operator precedence)
 * - `jit`: Code generation and runtime helpers for V8-accelerated JIT execution
 * - `vm`: Interpretation and tree-walking visitors for CSP-safe execution
 * - `functions`: Custom and domain-specific function registration
 * - `hooks`: Interceptors triggered before and after pipeline phases
 */
export interface PluginContext {
  /**
   * AST introspection and traversal configuration.
   */
  ast: {
    /**
     * Registers a helper to extract child AST nodes from a custom AST node type.
     *
     * This is required for `extractVariables()` and static analysis passes to correctly
     * walk into custom nodes introduced by this plugin.
     *
     * @param nodeType - The unique discriminant `type` string of the AST node
     * @param extractor - Function returning child AST nodes contained in the given node
     *
     * @example
     * ctx.ast.addChildrenExtractor('AbsoluteValue', (node) => [node.operand as ASTNode]);
     */
    addChildrenExtractor(nodeType: string, extractor: ASTChildrenExtractor): void;
  };

  /**
   * Scanner (Lexer) extensions.
   */
  scanner: {
    /**
     * Registers a custom character/token handler in the scanner.
     *
     * Handlers run in registration order at step 0 of tokenization.
     * If the handler returns a `Token`, that token is consumed.
     * If it returns `null`, scanning proceeds to standard rules.
     *
     * @param handler - Function called when encountering a character
     *
     * @example
     * ctx.scanner.addTokenHandler((ch, src, pos, advance) => {
     *   if (ch === 35) { // '#'
     *     advance(1);
     *     return { kind: HashToken, value: '#', start: pos };
     *   }
     *   return null;
     * });
     */
    addTokenHandler(handler: TokenHandler): void;

    /**
     * Registers a custom two-character operator token (e.g. `//`, `**`, `?:`).
     *
     * Indexed via a fast 16-bit bitwise key `(ch1 << 8) | ch2` for zero-allocation lookup.
     *
     * @param ch1 - Char code of the first character
     * @param ch2 - Char code of the second character
     * @param kind - The unique numeric TokenKind to assign
     *
     * @example
     * const slash = '/'.charCodeAt(0);
     * ctx.scanner.addTwoCharOp(slash, slash, FloorDivToken);
     */
    addTwoCharOp(ch1: number, ch2: number, kind: number): void;

    /**
     * Registers a custom single-character operator or punctuation token (e.g. `~`, `@`, `;`).
     *
     * @param ch - Char code of the character
     * @param kind - The unique numeric TokenKind to assign
     *
     * @example
     * ctx.scanner.addSingleCharOp('~'.charCodeAt(0), BitNotToken);
     */
    addSingleCharOp(ch: number, kind: number): void;
  };

  /**
   * Pratt Parser extensions.
   */
  parser: {
    /**
     * Registers a Null Denotation (NUD) handler.
     *
     * NUD handlers parse tokens appearing in prefix position (literals, variables,
     * prefix unary operators, grouping parentheses, array literals).
     *
     * @param kind - The TokenKind that triggers this prefix rule
     * @param handler - Function parsing the prefix expression and returning an AST node
     *
     * @example
     * ctx.parser.addNud(BitNotToken, (token, parseExpr) => ({
     *   type: 'Unary',
     *   op: '~',
     *   operand: parseExpr(35),
     * }));
     */
    addNud(kind: number, handler: NudHandler): void;

    /**
     * Registers a Left Denotation (LED) handler.
     *
     * LED handlers parse tokens appearing in infix or postfix position,
     * consuming the left-hand side expression and parsing the right-hand side.
     *
     * @param kind - The TokenKind that triggers this infix/postfix rule
     * @param bp - Infix binding power (precedence) for this operator
     * @param handler - Function combining `left` with subsequent parsed expressions
     *
     * @example
     * ctx.parser.addLed(BitAndToken, 7, (op, left, parseExpr) => ({
     *   type: 'Binary',
     *   op: '&',
     *   left,
     *   right: parseExpr(7),
     * }));
     */
    addLed(kind: number, bp: number, handler: LedHandler): void;

    /**
     * Registers or overrides the binding power (precedence) of a token kind.
     * Higher numbers bind tighter.
     *
     * @param kind - The TokenKind to assign precedence to
     * @param bp - The binding power integer value
     */
    addPrecedence(kind: number, bp: number): void;
  };

  /**
   * JIT Compiler extensions (`new Function` code generation).
   */
  jit: {
    /**
     * Registers a code generator for a binary operator symbol in JIT mode.
     *
     * @param op - The binary operator string (e.g. `&`, `//`)
     * @param generator - Pure function receiving JS expression strings for left and right operands
     *
     * @example
     * ctx.jit.addBinaryOp('&', (l, r) => `((${l})&(${r}))`);
     */
    addBinaryOp(op: string, generator: JITBinaryOpGenerator): void;

    /**
     * Registers a code generator for a custom AST node type in JIT mode.
     *
     * @param nodeType - The `type` property of the AST node to compile
     * @param generator - Function translating the node into a valid JS expression string
     *
     * @example
     * ctx.jit.addNodeCodegen('AbsoluteValue', (node, compile) => {
     *   return `Math.abs(${compile(node.operand)})`;
     * });
     */
    addNodeCodegen(nodeType: string, generator: JITNodeGenerator): void;

    /**
     * Injects a shared runtime helper or object into the closure scope of `new Function`.
     *
     * The identifier must be a valid JS identifier starting with `__` (e.g. `__myHelper`).
     *
     * @param identifier - Variable name accessible inside generated JIT code
     * @param valueProvider - Factory returning the actual runtime value/function for the given options
     *
     * @example
     * ctx.jit.addRuntimeHelper('__customLog', () => (msg: string) => console.log(msg));
     */
    addRuntimeHelper(
      identifier: string,
      valueProvider: (options: ExecutorOptions) => unknown,
    ): void;
  };

  /**
   * VM Interpreter extensions (CSP-safe AST evaluation).
   */
  vm: {
    /**
     * Registers an eager evaluation handler for a binary operator in VM mode.
     *
     * Both operands are fully evaluated before this handler is invoked.
     *
     * @param op - The binary operator string
     * @param handler - Function computing the result from evaluated left and right values
     *
     * @example
     * ctx.vm.addBinaryOp('&', (l, r) => (l as number) & (r as number));
     */
    addBinaryOp(op: string, handler: VMBinaryOpHandler): void;

    /**
     * Registers a short-circuit (lazy) evaluation handler for a binary operator in VM mode.
     *
     * Receives raw, unevaluated AST nodes and an evaluation callback, allowing conditional
     * or partial evaluation (e.g. `&&`, `||`, `??`).
     *
     * @param op - The binary operator string
     * @param handler - Function controlling when and if child nodes are evaluated
     *
     * @example
     * ctx.vm.addLazyBinaryOp('&&', (left, right, evaluate) => {
     *   const l = evaluate(left);
     *   if (!l) return 0;
     *   return evaluate(right) ? 1 : 0;
     * });
     */
    addLazyBinaryOp(op: string, handler: VMLazyBinaryOpHandler): void;

    /**
     * Registers a tree-walking visitor for a custom AST node type in VM mode.
     *
     * @param nodeType - The `type` property of the AST node to visit
     * @param visitor - Function evaluating the node in the current execution context
     *
     * @example
     * ctx.vm.addNodeVisitor('AbsoluteValue', (node, visit, evalCtx) => {
     *   const val = visit(node.operand, evalCtx);
     *   return Math.abs(val as number);
     * });
     */
    addNodeVisitor(nodeType: string, visitor: VMNodeVisitor): void;
  };

  /**
   * Mathematical and domain-specific function registry.
   */
  functions: {
    /**
     * Registers a custom function available inside formula expressions.
     * Case-insensitive lookup. Overwrites existing functions with the same name.
     *
     * @param name - Function name (e.g. 'avg', 'clamp')
     * @param fn - Implementation accepting number or string arguments
     *
     * @example
     * ctx.functions.register('double', (x) => (x as number) * 2);
     */
    register(name: string, fn: MathFn): void;

    /**
     * Convenience method to register multiple functions at once.
     *
     * @param fns - Record mapping function names to their implementations
     */
    registerMany(fns: Record<string, MathFn>): void;
  };

  /**
   * Lifecycle interceptor hooks.
   */
  hooks: {
    /**
     * Intercepts the raw source string before the scanner runs.
     * Useful for preprocessing, comment stripping, source rewrites, or macro replacements.
     */
    beforeScan(hook: BeforeScanHook): void;

    /**
     * Intercepts the scanned token list before parsing starts.
     * Useful for token filtering, macro expansion, or token-level validation.
     */
    afterScan(hook: AfterScanHook): void;

    /**
     * Intercepts the generated AST after parsing completes and before compilation/evaluation.
     * Useful for static analysis, AST validation, type-checking, or AST transformations.
     */
    afterParse(hook: AfterParseHook): void;

    /**
     * Intercepts the data bindings and execution options before evaluation starts.
     * Useful for resolving sub-formulas, setting default variables, or telemetry.
     */
    beforeEval(hook: BeforeEvalHook): void;

    /**
     * Intercepts the evaluated result before returning to the caller.
     * Useful for rounding, unit conversions, post-processing, or logging.
     */
    afterEval(hook: AfterEvalHook): void;
  };
}
