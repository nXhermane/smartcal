import { ASTExtensions, ASTExtensionsBuilder } from './ast/ast-extensions';
import { type ASTNode, extractRequiredVariables } from './ast/nodes';
import { createExecutor } from './compiler/execution-strategy';
import { type JITExtensions, JITExtensionsBuilder } from './compiler/jit-extensions';
import { type VMExtensions, VMExtensionsBuilder } from './compiler/vm-extensions';
import { IncorrectSyntaxError, InvalidFormulaError, ParseError, ScanError } from './errors/index';
import { LifecycleHooks } from './lifecycle/lifecycle-hooks';
import { Parser } from './parser/parser';
import { type ParserExtensions, ParserExtensionsBuilder } from './parser/parser-extensions';
import { BoundPluginContext } from './plugin/bound-plugin-context';
import { PluginRegistry } from './plugin/plugin-registry';
import type { SmartCalPlugin } from './plugin/types';
import { InstanceFunctionRegistry } from './registry/instance-registry';
import { Scanner } from './scanner/scanner';
import { type ScannerExtensions, ScannerExtensionsBuilder } from './scanner/scanner-extensions';
import type { CompiledExpression, DataType, ExecutorOptions } from './types';

export type EngineOptions = ExecutorOptions;
export type EvalOptions = ExecutorOptions;
export type CompileOptions = ExecutorOptions;

export class SmartCalEngine {
  /** @internal */ readonly _scannerBuilder = new ScannerExtensionsBuilder();
  /** @internal */ readonly _parserBuilder = new ParserExtensionsBuilder();
  /** @internal */ readonly _jitBuilder = new JITExtensionsBuilder();
  /** @internal */ readonly _vmBuilder = new VMExtensionsBuilder();
  /** @internal */ readonly _astBuilder = new ASTExtensionsBuilder();
  /** @internal */ readonly _registry = new InstanceFunctionRegistry();
  /** @internal */ readonly _hooks = new LifecycleHooks();

  private readonly pluginRegistry = new PluginRegistry();
  private _cacheValid = false;
  private _cachedScanner!: ScannerExtensions;
  private _cachedParser!: ParserExtensions;
  private _cachedJit!: JITExtensions;
  private _cachedVm!: VMExtensions;
  private _cacheAst!: ASTExtensions;

  constructor(_options: EngineOptions = {}) {}

  /**
   * Registers a plugin on this instance.
   * Idempotent: an already-installed plugin (same name) is silently ignored.
   */
  use(plugin: SmartCalPlugin): this {
    if (this.pluginRegistry.has(plugin.name)) return this;
    const ctx = new BoundPluginContext(this);
    plugin.install(ctx);
    this.pluginRegistry.register(plugin);
    this._cacheValid = false;
    return this;
  }

  private _ensureCache(): void {
    if (this._cacheValid) return;
    this._cachedScanner = this._scannerBuilder.build();
    this._cachedParser = this._parserBuilder.build();
    this._cachedJit = this._jitBuilder.build();
    this._cachedVm = this._vmBuilder.build();
    this._cacheAst = this._astBuilder.build();
    this._cacheValid = true;
  }

  evaluate(expression: string, data: DataType = {}, options: EvalOptions = {}): number | string {
    if (!expression || expression.trim().length === 0) {
      throw new InvalidFormulaError('Expression cannot be empty.', expression ?? '');
    }

    this._ensureCache();

    const source = this._hooks.runBeforeScan(expression);

    const scanner = new Scanner(source, this._cachedScanner);
    let tokens = scanner.scanTokens();
    tokens = this._hooks.runAfterScan(tokens);

    let ast: ASTNode;
    try {
      const parser = Parser.fromTokens(source, tokens, this._cachedParser);
      ast = parser.parse();
    } catch (err) {
      if (err instanceof ScanError || err instanceof ParseError) {
        throw new IncorrectSyntaxError(
          err instanceof Error ? err.message : 'Syntax error',
          expression,
        );
      }
      throw err;
    }

    ast = this._hooks.runAfterParse(ast);

    const resolved = this._hooks.runBeforeEval(data, options);

    const executor = createExecutor(ast, options, {
      functions: this._registry,
      jitExtensions: this._cachedJit,
      vmExtensions: this._cachedVm,
    });
    let result = executor(resolved);
    result = this._hooks.runAfterEval(result, options);

    return result;
  }

  compile(expression: string, options: CompileOptions = {}): CompiledExpression {
    if (!expression || expression.trim().length === 0) {
      throw new InvalidFormulaError('Expression cannot be empty.', expression ?? '');
    }

    this._ensureCache();

    const source = this._hooks.runBeforeScan(expression);
    const scanner = new Scanner(source, this._cachedScanner);
    let tokens = scanner.scanTokens();
    tokens = this._hooks.runAfterScan(tokens);

    let ast: ASTNode;
    try {
      const parser = Parser.fromTokens(source, tokens, this._cachedParser);
      ast = parser.parse();
    } catch (err) {
      if (err instanceof ScanError || err instanceof ParseError) {
        throw new IncorrectSyntaxError(
          err instanceof Error ? err.message : 'Syntax error',
          expression,
        );
      }
      throw err;
    }

    ast = this._hooks.runAfterParse(ast);

    const executor = createExecutor(ast, options, {
      functions: this._registry,
      jitExtensions: this._cachedJit,
      vmExtensions: this._cachedVm,
    });

    const hooks = this._hooks;

    return {
      type: 'CompiledExpression' as const,
      evaluate<T extends DataType>(data: T): number | string {
        const resolved = hooks.runBeforeEval(data, options);
        let result = executor(resolved);
        result = hooks.runAfterEval(result, options);
        return result;
      },
      toString(): string {
        return expression;
      },
    };
  }

  /** Lists installed plugins (useful for debugging). */
  listPlugins(): string[] {
    return this.pluginRegistry.list().map(p => `${p.name}${p.version ? `@${p.version}` : ''}`);
  }

  extractVariables(expressionOrAst: string | ASTNode): string[] {
    let ast: ASTNode;

    if (typeof expressionOrAst === 'string') {
      this._ensureCache();
      const source = this._hooks.runBeforeScan(expressionOrAst);
      const scanner = new Scanner(source, this._cachedScanner);
      const tokens = this._hooks.runAfterScan(scanner.scanTokens());
      ast = Parser.fromTokens(source, tokens, this._cachedParser).parse();
      ast = this._hooks.runAfterParse(ast);
    } else {
      ast = expressionOrAst;
    }

    return extractRequiredVariables(ast, this._cacheAst);
  }

  isValidExpression(expression: string): boolean {
    if (!expression || expression.trim().length === 0) return false;
    try {
      this._ensureCache();
      const source = this._hooks.runBeforeScan(expression);
      const scanner = new Scanner(source, this._cachedScanner);
      const tokens = this._hooks.runAfterScan(scanner.scanTokens());
      Parser.fromTokens(source, tokens, this._cachedParser).parse();
      return true;
    } catch {
      return false;
    }
  }
}
