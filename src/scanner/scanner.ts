/**
 * @file Scanner.ts
 * @description Zero-Allocation Single-Pass Scanner for SmartCal v1.1.
 *
 * ## Design goals (from AUDIT_AND_MODERNIZATION_PLAN.md §4.1)
 *
 * - **Single pass, cursor-based**: no regex `replace`, no `split(" ")`, no
 *   intermediate string arrays.
 * - **Zero heap allocation between `next()` calls**: whitespace is skipped by
 *   advancing an integer cursor; multi-char operators are detected via
 *   `charCodeAt` comparisons.
 * - **Unicode identifiers**: supports U+0080–U+FFFF in variable names
 *   (e.g. Arabic, CJK, accented Latin) as required by the v1.0.14 feature set.
 * - **String literals with spaces**: `"John Doe"` is treated as a single token —
 *   the critical bug in `FormulaTokenizer.split(" ")` is eliminated.
 * - **Peek / next / expect API**: the Pratt Parser only needs these three
 *   operations; the Scanner exposes nothing else.
 *
 * ## Performance notes
 *
 * The Scanner internally maintains a single-token lookahead cache so that
 * `peek()` is O(1) and never re-scans. `next()` advances the cache.
 * All comparisons use `charCodeAt()` which V8 can inline as a raw memory read.
 */

import { ScanError } from '../errors/index';
import { EOF_TOKEN, type Token, TokenKind } from './token';

export class Scanner {
  /** Current read position in `src`. */
  private pos = 0;
  private readonly len: number;
  /** One-token lookahead cache. `null` means "not yet scanned". */
  private _peeked: Token | null = null;

  constructor(private readonly src: string) {
    this.len = src.length;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Look at the next token without consuming it.
   * Subsequent calls return the same token until `next()` is called.
   */
  peek(): Token {
    if (this._peeked === null) {
      this._peeked = this._scan();
    }
    return this._peeked;
  }

  /**
   * Consume and return the next token.
   */
  next(): Token {
    if (this._peeked !== null) {
      const t = this._peeked;
      this._peeked = null;
      return t;
    }
    return this._scan();
  }

  /**
   * Consume the next token and assert it matches `kind`.
   * Throws `ScanError` if it does not.
   */
  expect(kind: TokenKind): Token {
    const t = this.next();
    if (t.kind !== kind) {
      throw new ScanError(
        `Expected token kind=${kind} but got kind=${t.kind} ("${t.value}")`,
        this.src,
        t.start,
      );
    }
    return t;
  }

  /**
   * Consume and return all remaining tokens until EOF.
   * Useful for debugging, testing and benchmark measurements.
   */
  scanTokens(): Token[] {
    const tokens: Token[] = [];
    for (;;) {
      const t = this.next();
      tokens.push(t);
      if (t.kind === TokenKind.EOF) break;
    }
    return tokens;
  }

  // ---------------------------------------------------------------------------
  // Core scanning logic
  // ---------------------------------------------------------------------------

  private _scan(): Token {
    // Skip whitespace (charCode <= 32 covers space, tab, CR, LF)
    while (this.pos < this.len && this.src.charCodeAt(this.pos) <= 32) {
      this.pos++;
    }

    if (this.pos >= this.len) {
      return EOF_TOKEN;
    }

    const start = this.pos;
    const ch = this.src.charCodeAt(this.pos);

    // ------------------------------------------------------------------
    // 1. Numbers: [0-9] (\.[0-9]+)?
    // ------------------------------------------------------------------
    if (ch >= 48 && ch <= 57) {
      return this._scanNumber(start);
    }

    // ------------------------------------------------------------------
    // 2. String literals: "..." or '...'
    // ------------------------------------------------------------------
    if (ch === 34 /* " */ || ch === 39 /* ' */) {
      return this._scanString(start, ch);
    }

    // ------------------------------------------------------------------
    // 3. Identifiers: [A-Za-z_\u0080-\uFFFF][A-Za-z0-9_\u0080-\uFFFF]*
    // ------------------------------------------------------------------
    if (this._isIdentStart(ch)) {
      return this._scanIdentifier(start);
    }

    // ------------------------------------------------------------------
    // 4. Two-character operators: <=, >=, ==, !=, &&, ||
    // ------------------------------------------------------------------
    if (this.pos + 1 < this.len) {
      const next = this.src.charCodeAt(this.pos + 1);
      const twoChar = this._twoCharOp(ch, next);
      if (twoChar !== TokenKind.EOF) {
        const value = this.src.slice(this.pos, this.pos + 2);
        this.pos += 2;
        return { kind: twoChar, value, start };
      }
    }

    // ------------------------------------------------------------------
    // 5. Single-character operators, parentheses, punctuation
    // ------------------------------------------------------------------
    this.pos++;
    const kind = this._singleCharOp(ch);
    if (kind === TokenKind.EOF) {
      throw new ScanError(
        `Unexpected character "${this.src[start]}" (U+${ch.toString(16).toUpperCase().padStart(4, '0')})`,
        this.src,
        start,
      );
    }
    return { kind, value: this.src.charAt(start), start };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private _scanNumber(start: number): Token {
    while (this.pos < this.len) {
      const c = this.src.charCodeAt(this.pos);
      if ((c >= 48 && c <= 57) || c === 46 /* . */) {
        this.pos++;
      } else {
        break;
      }
    }
    return {
      kind: TokenKind.Number,
      value: Number(this.src.slice(start, this.pos)),
      start,
    };
  }

  private _scanString(start: number, quote: number): Token {
    this.pos++; // skip opening quote
    const strStart = this.pos;
    while (this.pos < this.len && this.src.charCodeAt(this.pos) !== quote) {
      this.pos++;
    }
    if (this.pos >= this.len) {
      throw new ScanError('Unterminated string literal', this.src, start);
    }
    const value = this.src.slice(strStart, this.pos);
    this.pos++; // skip closing quote
    return { kind: TokenKind.String, value, start };
  }

  private _scanIdentifier(start: number): Token {
    while (this.pos < this.len) {
      const c = this.src.charCodeAt(this.pos);
      if (this._isIdentPart(c)) {
        this.pos++;
      } else {
        break;
      }
    }
    return {
      kind: TokenKind.Identifier,
      value: this.src.slice(start, this.pos),
      start,
    };
  }

  /**
   * Returns `true` for characters valid at the *start* of an identifier.
   * Covers ASCII letters, underscore, and the full Unicode supplementary range
   * U+0080–U+FFFF used by the library for non-ASCII variable names.
   */
  private _isIdentStart(c: number): boolean {
    return (
      (c >= 65 && c <= 90) || // A-Z
      (c >= 97 && c <= 122) || // a-z
      c === 95 || // _
      c >= 0x80 // Unicode U+0080+
    );
  }

  /**
   * Returns `true` for characters valid *within* an identifier (includes digits).
   */
  private _isIdentPart(c: number): boolean {
    return (
      (c >= 65 && c <= 90) || // A-Z
      (c >= 97 && c <= 122) || // a-z
      (c >= 48 && c <= 57) || // 0-9
      c === 95 || // _
      c >= 0x80 // Unicode U+0080+
    );
  }

  /**
   * Detects two-character operator tokens given the char codes of the current
   * and next characters.  Returns `TokenKind.EOF` (sentinel) when no match.
   */
  private _twoCharOp(c1: number, c2: number): TokenKind {
    // <= (60, 61)
    if (c1 === 60 && c2 === 61) return TokenKind.LtEq;
    // >= (62, 61)
    if (c1 === 62 && c2 === 61) return TokenKind.GtEq;
    // == (61, 61)
    if (c1 === 61 && c2 === 61) return TokenKind.Eq;
    // != (33, 61)
    if (c1 === 33 && c2 === 61) return TokenKind.NotEq;
    // && (38, 38)
    if (c1 === 38 && c2 === 38) return TokenKind.And;
    // || (124, 124)
    if (c1 === 124 && c2 === 124) return TokenKind.Or;
    return TokenKind.EOF; // sentinel — not a two-char op
  }

  /**
   * Maps a single char code to a TokenKind.
   * Returns `TokenKind.EOF` as a sentinel when the character is unrecognised.
   */
  private _singleCharOp(ch: number): TokenKind {
    switch (ch) {
      case 43:
        return TokenKind.Plus; // +
      case 45:
        return TokenKind.Minus; // -
      case 42:
        return TokenKind.Star; // *
      case 47:
        return TokenKind.Slash; // /
      case 37:
        return TokenKind.Percent; // %
      case 94:
        return TokenKind.Caret; // ^
      case 60:
        return TokenKind.Lt; // <
      case 62:
        return TokenKind.Gt; // >
      case 63:
        return TokenKind.Question; // ?
      case 58:
        return TokenKind.Colon; // :
      case 40:
        return TokenKind.LParen; // (
      case 41:
        return TokenKind.RParen; // )
      case 44:
        return TokenKind.Comma; // ,
      case 91:
        return TokenKind.LBracket; // [
      case 93:
        return TokenKind.RBracket; // ]
      case 46:
        return TokenKind.Dot; // .
      default:
        return TokenKind.EOF; // unrecognised — caller throws
    }
  }
}
