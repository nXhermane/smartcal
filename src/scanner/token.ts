/**
 * @file Token.ts
 * @description Token types and the Token interface for the SmartCal v1.1 Scanner.
 *
 * Using a `const enum` gives us nominal integer discriminants that are
 * **inlined by TypeScript at compile time** — zero runtime object overhead
 * and branch-free comparisons in `switch` statements.
 */

/**
 * All token kinds recognized by the SmartCal Scanner.
 *
 * Integer values are stable and used directly as keys in the Binding Power
 * table (`Precedence.ts`) to avoid any Map/object lookup overhead.
 */
export enum TokenKind {
  // -------------------------------------------------------------------------
  // Literals
  // -------------------------------------------------------------------------
  /** An integer or floating-point number: `42`, `3.14`. */
  Number = 1,
  /** A quoted string literal: `"hello"` or `'world'`. */
  String = 2,

  // -------------------------------------------------------------------------
  // Identifiers
  // -------------------------------------------------------------------------
  /**
   * A variable name or `f_*` sub-formula reference.
   * Unicode identifiers (U+0080–U+FFFF) are fully supported.
   */
  Identifier = 3,

  // -------------------------------------------------------------------------
  // Arithmetic operators
  // -------------------------------------------------------------------------
  Plus = 10,
  Minus = 11,
  Star = 12,
  Slash = 13,
  Percent = 14,
  Caret = 15, // ^ exponentiation

  // -------------------------------------------------------------------------
  // Comparison operators
  // -------------------------------------------------------------------------
  Eq = 20, // ==
  NotEq = 21, // !=
  Lt = 22, // <
  Gt = 23, // >
  LtEq = 24, // <=
  GtEq = 25, // >=

  // -------------------------------------------------------------------------
  // Logical operators
  // -------------------------------------------------------------------------
  And = 30, // &&
  Or = 31, // ||

  // -------------------------------------------------------------------------
  // Ternary operators
  // -------------------------------------------------------------------------
  Question = 40, // ?
  Colon = 41, // :

  // -------------------------------------------------------------------------
  // Grouping / function calls / indexing
  // -------------------------------------------------------------------------
  LParen = 50, // (
  RParen = 51, // )
  Comma = 52, // ,  (argument separator)
  LBracket = 53, // [
  RBracket = 54, // ]
  Dot = 55, // .  (member access)

  // -------------------------------------------------------------------------
  // Control
  // -------------------------------------------------------------------------
  /** Signals end-of-input. Always the last token returned by the Scanner. */
  EOF = 99,
}

/**
 * A single lexical unit produced by the Scanner.
 *
 * `start` is the byte offset in the original source string and is used
 * to produce precise error messages (`ScanError`, `ParseError`).
 */
export interface Token {
  /** The syntactic category of this token. */
  readonly kind: TokenKind;
  /**
   * The semantic value:
   * - `TokenKind.Number`     → parsed `number`
   * - `TokenKind.String`     → the raw string content (quotes stripped)
   * - `TokenKind.Identifier` → the identifier text
   * - all others             → the literal source characters (e.g. `"+"`)
   */
  readonly value: string | number;
  /** Byte offset of the first character of this token in the source. */
  readonly start: number;
}

/** A sentinel EOF token — reused to avoid repeated allocations. */
export const EOF_TOKEN: Token = { kind: TokenKind.EOF, value: '', start: -1 };
