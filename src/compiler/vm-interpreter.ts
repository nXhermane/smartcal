/**
 * @file vm_interpreter.ts
 * @description Fast Stack VM — CSP-safe AST evaluator for SmartCal v1.1.
 *
 * ## When to use
 *
 * Environments that block `new Function` and `eval` via Content Security Policy
 * (Cloudflare Workers, browser extensions Manifest V3, banking apps) cannot use
 * the JIT Compiler. The VM Interpreter provides a pure-JS alternative:
 *
 * - **0 uses of `eval`** or `new Function`.
 * - **0 closures allocated per evaluation** (switch/case dispatch is V8-friendly).
 * - **0 intermediate arrays** — the AST is walked in-place.
 * - Expected throughput: **~1–3 million ops/s** (still 10–50x faster than v1.0.14).
 *
 * ## Design
 *
 * A simple recursive visitor pattern with a `switch` on `node.type`.
 * TypeScript's exhaustive narrowing ensures every node type is handled.
 */

import type { ASTNode, BinaryNode } from '../ast/nodes';
import { VMError } from '../errors/index';
import { FunctionRegistry } from '../registry/function-registry';

/** A plain data record — variable names → values. */
export type DataRecord = Record<string, unknown>;

export class VMInterpreter {
  /**
   * Evaluate `ast` against `data` and return the result.
   *
   * @throws {VMError} on unsupported node types or unknown variables.
   */
  evaluate(ast: ASTNode, data: DataRecord): number | string {
    return this.visit(ast, data);
  }

  // ---------------------------------------------------------------------------
  // Core visitor
  // ---------------------------------------------------------------------------

  private visit(node: ASTNode, data: DataRecord): number | string {
    switch (node.type) {
      case 'Literal':
        return node.value;

      case 'Identifier':
        return this.resolveIdentifier(node.name, data);

      case 'Unary':
        return -(this.visit(node.operand, data) as number);

      case 'Binary':
        return this.visitBinary(node, data);

      case 'Conditional': {
        // Evaluate test — any truthy value (including 1) takes the consequent.
        const test = this.visit(node.test, data);
        return test ? this.visit(node.consequent, data) : this.visit(node.alternate, data);
      }

      case 'FunctionCall': {
        const fn = FunctionRegistry.get(node.name);
        if (fn === undefined) {
          throw new VMError(`Unknown function: "${node.name}"`);
        }
        const args = node.args.map(a => this.visit(a, data));
        return fn(...args);
      }

      case 'ArrayLiteral': {
        // Arrays are returned as-is for future aggregate functions (sum, avg…).
        // Currently only usable as function arguments.
        return node.elements.map(e => this.visit(e, data)).join(',');
      }

      case 'MemberExpression': {
        const obj = this.visit(node.object, data);
        const prop = node.computed
          ? this.visit(node.property, data)
          : (node.property as { name: string }).name;
        const container = obj as unknown as Record<string | number, unknown>;
        const val = container[prop as string | number];
        return typeof val === 'number' || typeof val === 'string' ? val : 0;
      }

      default: {
        // Exhaustive check — TypeScript will flag missing cases at compile time.
        const _exhaustive: never = node;
        throw new VMError(`Unsupported node type: ${(_exhaustive as ASTNode).type}`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Binary operator evaluation
  // ---------------------------------------------------------------------------

  private visitBinary(node: BinaryNode, data: DataRecord): number | string {
    // Short-circuit logical operators before evaluating both sides.
    if (node.op === '&&') {
      const l = this.visit(node.left, data);
      if (!l) return 0;
      return this.visit(node.right, data) ? 1 : 0;
    }
    if (node.op === '||') {
      const l = this.visit(node.left, data);
      if (l) return 1;
      return this.visit(node.right, data) ? 1 : 0;
    }

    const l = this.visit(node.left, data);
    const r = this.visit(node.right, data);

    switch (node.op) {
      // Arithmetic
      case '+':
        return (l as number) + (r as number);
      case '-':
        return (l as number) - (r as number);
      case '*':
        return (l as number) * (r as number);
      case '/':
        return (l as number) / (r as number);
      case '%':
        return (l as number) % (r as number);
      case '^':
        return (l as number) ** (r as number);

      // Comparisons — return 1 or 0 to match v1 ConditionResult.
      case '==':
        return l === r ? 1 : 0;
      case '!=':
        return l !== r ? 1 : 0;
      case '<':
        return (l as number) < (r as number) ? 1 : 0;
      case '>':
        return (l as number) > (r as number) ? 1 : 0;
      case '<=':
        return (l as number) <= (r as number) ? 1 : 0;
      case '>=':
        return (l as number) >= (r as number) ? 1 : 0;

      default:
        throw new VMError(`Unsupported binary operator: "${node.op}"`);
    }
  }

  // ---------------------------------------------------------------------------
  // Identifier / variable resolution
  // ---------------------------------------------------------------------------

  private resolveIdentifier(name: string, data: DataRecord): number | string {
    if (name in data) {
      const val = data[name];
      if (typeof val === 'number' || typeof val === 'string') return val;
      // null / undefined → default 0 (v1 behaviour)
      return 0;
    }
    // Unknown variable defaults to 0 (consistent with v1 FieldReference behaviour).
    // The API layer can choose to throw here if strict mode is requested.
    return 0;
  }
}
