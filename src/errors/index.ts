/**
 * @file index.ts
 * @description Error classes for the SmartCal v1.1 Scanner, Parser, and Compiler.
 *
 * ## Design rationale
 *
 * These error classes are used by the modern `src/` pipeline.
 * They carry structured metadata (source string, position, token) so that
 * callers can produce IDE-quality diagnostics.
 *
 * Legacy error classes (`IncorrectSyntaxError`, `InvalidFormulaError`, etc.)
 * are also cleanly implemented and exported here to guarantee 100% backward compatibility.
 */

import type { Token } from '../scanner/token';

// ---------------------------------------------------------------------------
// ScanError
// ---------------------------------------------------------------------------

/**
 * Thrown by `Scanner` when it encounters an unrecognized character or an
 * unterminated string literal.
 *
 * @example
 * // Source: "price @ 2"  →  ScanError at pos 7 for '@'
 */
export class ScanError extends Error {
  override readonly name = 'ScanError';

  constructor(
    message: string,
    /** The full source string that was being scanned. */
    public readonly source: string,
    /** Byte offset of the offending character in `source`. */
    public readonly pos: number,
    options?: ErrorOptions,
  ) {
    const snippet = buildSnippet(source, pos);
    super(`${message}\n${snippet}`, options);
  }
}

// ---------------------------------------------------------------------------
// ParseError
// ---------------------------------------------------------------------------

/**
 * Thrown by `Parser` when the token stream does not match the grammar.
 *
 * Carries the offending `Token` for precise error reporting.
 *
 * @example
 * // Source: "2 + * 3"  →  ParseError on token { kind: Star, value: "*", start: 4 }
 */
export class ParseError extends Error {
  override readonly name = 'ParseError';

  constructor(
    message: string,
    /** The token that triggered the error. */
    public readonly token: Token,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

// ---------------------------------------------------------------------------
// JITError
// ---------------------------------------------------------------------------

/**
 * Thrown by `JITCompiler` when code generation fails or when `new Function`
 * is blocked by a Content Security Policy.
 */
export class JITError extends Error {
  override readonly name = 'JITError';

  constructor(message: string, cause?: Error) {
    super(message, cause !== undefined ? { cause } : undefined);
  }
}

// ---------------------------------------------------------------------------
// VMError
// ---------------------------------------------------------------------------

/**
 * Thrown by `VMInterpreter` when an AST node cannot be evaluated
 * (unknown function, unsupported node type, etc.).
 */
export class VMError extends Error {
  override readonly name = 'VMError';

  constructor(message: string) {
    super(message);
  }
}

// ---------------------------------------------------------------------------
// FormulaResolutionError
// ---------------------------------------------------------------------------

/**
 * Thrown by `FormulaResolver` when a circular dependency is detected in
 * the `f_*` sub-formula DAG.
 *
 * @example
 * // data = { f_a: compile('f_b + 1'), f_b: compile('f_a + 1') }
 * // → FormulaResolutionError: cycle ["f_a", "f_b", "f_a"]
 */
export class FormulaResolutionError extends Error {
  override readonly name = 'FormulaResolutionError';

  constructor(
    message: string,
    /** The cycle path, e.g. ["f_a", "f_b", "f_a"] */
    public readonly cycle: string[],
  ) {
    super(`${message} (cycle: ${cycle.join(' → ')})`);
  }
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function buildSnippet(source: string, pos: number): string {
  const line = source.replace(/\n/g, ' ');
  const clampedPos = Math.max(0, Math.min(pos, line.length));
  const caret = `${' '.repeat(clampedPos)}^`;
  return `${line}\n${caret}`;
}

// ---------------------------------------------------------------------------
// Legacy Error Exports
// ---------------------------------------------------------------------------
export {
  FormulaInterpreterError,
  FormulaVariableNotFoundError,
  IncorrectSyntaxError,
  InvalidFormulaError,
} from './legacy';
