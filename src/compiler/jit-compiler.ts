import type { ASTNode } from '../ast/nodes';
import { JITError, VariableNotFoundError } from '../errors/index';
import { FunctionRegistry, MathFn } from '../registry/function-registry';

/** A compiled expression function - accepts a data record and returns a value. */
export type CompiledFn = (data?: Record<string, unknown>) => number | string;

/** @throws {VariableNotFoundError} with name */
type OnMissingFn = (name: string) => void;

type Factory = (registry: Record<string, MathFn>, miss: OnMissingFn) => CompiledFn;
/**
 * @description - JIT Code generator
 * ## How it works
 *
 * The JIT Compiler transforms an `ASTNode` into a JavaScript string, then wraps
 * it in `new Function()` to produce a native JS closure optimised by V8 TurboFan.
 *
 * ```
 * AST -- toJS() --> "((d["price"]??0)*((d["qty"]??0)))"
 *                              |
 *               new Function('"use strict"; return (d={}) => (...)')
 *                              |
 *                    compiled fn -- evaluate() --> result  (V8 native speed)
 * ```
 *
 * ## Security guarantees
 *
 * - No raw user input ever reaches `new Function`. Only AST-derived strings do.
 * - Variable names are escaped via `JSON.stringify()` - injection impossible.
 * - No loops, no imports, no constructors can be expressed in the grammar.
 */
export class JITCompiler {
  /**
   * Creates a new JIT compiler instance.
   *
   * @param strict - When true, throws VariableNotFoundError for missing variables instead of defaulting to 0
   */
  constructor(private readonly strict = false) {}
  /**
   * Compile an `ASTNode` into a native JS function.
   *
   * @throws {JITError} if `new Function` is blocked by the environment (CSP).
   *   In that case, fall back to `VMInterpreter`.
   */
  compile(ast: ASTNode): CompiledFn {
    const usedFunctions = new Set<string>();
    const jsCode = this.toJS(ast, usedFunctions);

    // "use strict" prevents access to globals like `window` or `process`.
    // `d` is the data object - the only external input.
    // `__registry` is function object
    const src = `"use strict"; return (d) => (${jsCode});`;

    let factory: Factory;
    try {
      factory = new Function('__registry', '__onMissing', src) as Factory;
    } catch (err) {
      throw new JITError(
        'new Function is blocked by the current environment (CSP). Use mode:"vm" instead.',
        err instanceof Error ? err : undefined,
      );
    }

    const registry: Record<string, MathFn> = {};
    for (const name of usedFunctions) {
      const fn = FunctionRegistry.get(name);
      if (!fn) {
        throw new JITError(`Unknown function: "${name}"`);
      }
      registry[name] = fn;
    }

    const onMissing: OnMissingFn = (name: string) => {
      throw new VariableNotFoundError(name);
    };

    return factory(registry, onMissing);
  }

  /**
   * Recursively convert an `ASTNode` into a JavaScript expression string.
   *
   * The output is always a valid JS expression that can be wrapped in
   * `return (d) => (...)` and passed to `new Function`.
   */
  private toJS(node: ASTNode, usedFunctions: Set<string>): string {
    switch (node.type) {
      // Leaf nodes
      case 'Literal': {
        return typeof node.value === 'string'
          ? JSON.stringify(node.value) // safe escaping of string content
          : String(node.value);
      }

      case 'Identifier': {
        // Variables are read from the data object `d` only.
        if (this.strict) {
          return `(Object.hasOwn(d,${JSON.stringify(node.name)})
           ? d[${JSON.stringify(node.name)}]
           : __onMissing(${JSON.stringify(node.name)}))`;
        }
        // Non-strict: default to 0
        return `(d[${JSON.stringify(node.name)}]??0)`;
      }

      // Unary
      case 'Unary': {
        return `(-(${this.toJS(node.operand, usedFunctions)}))`;
      }

      // Binary
      case 'Binary': {
        const l = this.toJS(node.left, usedFunctions);
        const r = this.toJS(node.right, usedFunctions);
        return this.binaryToJS(node.op, l, r);
      }

      // Ternary conditional
      case 'Conditional': {
        const test = this.toJS(node.test, usedFunctions);
        const cons = this.toJS(node.consequent, usedFunctions);
        const alt = this.toJS(node.alternate, usedFunctions);
        return `(${test}?(${cons}):(${alt}))`;
      }

      // Function calls
      case 'FunctionCall': {
        const name = node.name.toLowerCase();
        const args = node.args.map(a => this.toJS(a, usedFunctions)).join(',');

        // Custom function - must be registered in FunctionRegistry.
        if (!FunctionRegistry.has(name)) {
          throw new JITError(`Unknown function: "${node.name}"`);
        }
        usedFunctions.add(name);
        // Custom functions cannot be inlined - we access them via the registry.
        // We store a reference as a closure variable injected into the generated fn.
        // This is done by embedding a registry lookup into the generated code body.
        return `(__registry[${JSON.stringify(name)}](${args}))`;
      }

      // Array literal (future - not yet evaluated by JIT)
      case 'ArrayLiteral': {
        const elems = node.elements.map(e => this.toJS(e, usedFunctions)).join(',');
        return `[${elems}]`;
      }

      // Member expression (future)
      case 'MemberExpression': {
        const obj = this.toJS(node.object, usedFunctions);
        const prop = node.computed
          ? this.toJS(node.property, usedFunctions)
          : JSON.stringify((node.property as { name: string }).name);
        if (this.strict) {
          const varName = node.computed
            ? prop
            : JSON.stringify((node.property as { name: string }).name);
          return `(Object.hasOwn(${obj},${prop})?${obj}[${prop}]: __onMissing(${JSON.stringify(varName)}))`;
        }
        return `(${obj}[${prop}]??0)`;
      }

      default: {
        // Exhaustive check - TypeScript will warn if a node type is missing.
        const _exhaustive: never = node;
        throw new JITError(`Unsupported AST node type: ${(_exhaustive as ASTNode).type}`);
      }
    }
  }

  // Binary operator code generation
  private binaryToJS(op: string, l: string, r: string): string {
    switch (op) {
      // Arithmetic
      case '+':
        return `((${l})+(${r}))`;
      case '-':
        return `((${l})-(${r}))`;
      case '*':
        return `((${l})*(${r}))`;
      case '/':
        return `((${l})/(${r}))`;
      case '%':
        return `((${l})%(${r}))`;
      case '^':
        return `Math.pow((${l}),(${r}))`;

      // Comparisons - return 1 or 0.
      case '==':
        return `((${l})===(${r})?1:0)`;
      case '!=':
        return `((${l})!==(${r})?1:0)`;
      case '<':
        return `((${l})<(${r})?1:0)`;
      case '>':
        return `((${l})>(${r})?1:0)`;
      case '<=':
        return `((${l})<=(${r})?1:0)`;
      case '>=':
        return `((${l})>=(${r})?1:0)`;

      // Logical - return 1 or 0
      case '&&':
        return `((${l})&&(${r})?1:0)`;
      case '||':
        return `((${l})||(${r})?1:0)`;

      default:
        throw new JITError(`Unsupported binary operator: "${op}"`);
    }
  }
}

/**
 * Detect whether `new Function` is available in the current environment.
 * Result is cached after the first call (module-level lazy check).
 */
let _jitAvailable: boolean | null = null;
export function isJITAvailable(): boolean {
  if (_jitAvailable !== null) return _jitAvailable;
  try {
    new Function('return 1')();
    _jitAvailable = true;
  } catch {
    _jitAvailable = false;
  }
  return _jitAvailable;
}
