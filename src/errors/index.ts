import type { Token } from '../scanner/token';

/**
 * Thrown by `Scanner` when it encounters an unrecognized character or an
 * unterminated string literal.
 *
 * @example
 * // Source: "price @ 2"  ->  ScanError at pos 7 for '@'
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

/**
 * Thrown by `Parser` when the token stream does not match the grammar.
 *
 * Carries the offending `Token` for precise error reporting.
 *
 * @example
 * // Source: "2 + * 3"  ->  ParseError on token { kind: Star, value: "*", start: 4 }
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

/**
 * Thrown when `strict` mode is enabled and a variable referenced in the
 * expression is not present in the data object.
 */
export class VariableNotFoundError extends Error {
  override readonly name = 'VariableNotFoundError';

  constructor(
    /** The missing variable name. */
    public readonly variable: string,
    options?: ErrorOptions,
  ) {
    super(`Variable "${variable}" is not defined in the data object.`, options);
  }
}

/**
 * Thrown by `FormulaResolver` when a circular dependency is detected in
 * the `f_*` sub-formula DAG.
 *
 * @example
 * // data = { f_a: compile('f_b + 1'), f_b: compile('f_a + 1') }
 * // -> FormulaResolutionError: cycle ["f_a", "f_b", "f_a"]
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

function buildSnippet(source: string, pos: number): string {
  const line = source.replace(/\n/g, ' ');
  const clampedPos = Math.max(0, Math.min(pos, line.length));
  const caret = `${' '.repeat(clampedPos)}^`;
  return `${line}\n${caret}`;
}

export {
  FormulaInterpreterError,
  FormulaVariableNotFoundError,
  IncorrectSyntaxError,
  InvalidFormulaError,
} from './legacy';
