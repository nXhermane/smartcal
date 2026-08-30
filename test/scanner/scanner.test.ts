/**
 * @file scanner.test.ts
 * @description Unit tests for the SmartCal v1.1 Zero-Allocation Scanner.
 *
 * Coverage goals:
 * - All token kinds (numbers, strings, identifiers, every operator)
 * - Multi-character operators (<=, >=, ==, !=, &&, ||)
 * - Unicode identifiers (U+0080+)
 * - String literals with embedded spaces ("John Doe") — the v1 split bug
 * - Whitespace skipping
 * - peek() / next() / expect() contract
 * - Error: unterminated strings, unrecognised characters
 */

import { describe, expect, it } from 'vitest';
import { ScanError } from '../../src/errors/index';
import { Scanner } from '../../src/scanner/scanner';
import { TokenKind } from '../../src/scanner/token';

// Helper: fully tokenize a source string into an array of token kinds
function tokenKinds(src: string): TokenKind[] {
  const s = new Scanner(src);
  const kinds: TokenKind[] = [];
  for (;;) {
    const t = s.next();
    kinds.push(t.kind);
    if (t.kind === TokenKind.EOF) break;
  }
  return kinds;
}

// Helper: fully tokenize a source string into an array of [kind, value] pairs
function tokens(src: string): Array<{ kind: TokenKind; value: string | number }> {
  const s = new Scanner(src);
  const result: Array<{ kind: TokenKind; value: string | number }> = [];
  for (;;) {
    const { kind, value } = s.next();
    result.push({ kind, value });
    if (kind === TokenKind.EOF) break;
  }
  return result;
}

/**
 * Type-safe array accessor — throws a descriptive error instead of silently
 * returning undefined. Avoids both `!` (noNonNullAssertion) and the
 * `noUncheckedIndexedAccess` issue caused by `arr[n]`.
 */
function at<T>(arr: T[], index: number): T {
  const item = arr[index];
  if (item === undefined) {
    throw new Error(`Expected element at index ${index} but array has length ${arr.length}`);
  }
  return item;
}

// =============================================================================
describe('Scanner — numbers', () => {
  it('scans an integer', () => {
    const t = tokens('42');
    expect(at(t, 0)).toEqual({ kind: TokenKind.Number, value: 42 });
    expect(at(t, 1).kind).toBe(TokenKind.EOF);
  });

  it('scans a floating-point number', () => {
    const t = tokens('3.14');
    expect(at(t, 0)).toEqual({ kind: TokenKind.Number, value: 3.14 });
  });

  it('scans zero', () => {
    expect(at(tokens('0'), 0)).toEqual({ kind: TokenKind.Number, value: 0 });
  });

  it('scans multiple numbers separated by operators', () => {
    const kinds = tokenKinds('2 + 3.5');
    expect(kinds).toEqual([TokenKind.Number, TokenKind.Plus, TokenKind.Number, TokenKind.EOF]);
  });
});

// =============================================================================
describe('Scanner — string literals', () => {
  it('scans a double-quoted string', () => {
    const t = tokens('"hello"');
    expect(at(t, 0)).toEqual({ kind: TokenKind.String, value: 'hello' });
  });

  it('scans a single-quoted string', () => {
    const t = tokens("'world'");
    expect(at(t, 0)).toEqual({ kind: TokenKind.String, value: 'world' });
  });

  it('scans a string with embedded spaces (v1 split bug fix)', () => {
    // In v1.0.14, 'John Doe' would be split into two invalid tokens.
    const t = tokens('"John Doe"');
    expect(at(t, 0)).toEqual({ kind: TokenKind.String, value: 'John Doe' });
    expect(at(t, 1).kind).toBe(TokenKind.EOF);
  });

  it('scans a string with special characters', () => {
    const t = tokens('"price >= 10"');
    expect(at(t, 0).kind).toBe(TokenKind.String);
    expect(at(t, 0).value).toBe('price >= 10');
  });

  it('throws ScanError on unterminated string', () => {
    expect(() => tokens('"unterminated')).toThrow(ScanError);
  });
});

// =============================================================================
describe('Scanner — identifiers', () => {
  it('scans a simple identifier', () => {
    const t = tokens('price');
    expect(at(t, 0)).toEqual({ kind: TokenKind.Identifier, value: 'price' });
  });

  it('scans an underscore-prefixed identifier', () => {
    expect(at(tokens('_count'), 0).value).toBe('_count');
  });

  it('scans an f_* sub-formula identifier', () => {
    expect(at(tokens('f_total'), 0)).toEqual({ kind: TokenKind.Identifier, value: 'f_total' });
  });

  it('scans identifiers with digits (not at start)', () => {
    expect(at(tokens('var1'), 0).value).toBe('var1');
  });

  it('scans Unicode identifiers (U+0080+)', () => {
    // Arabic identifier — required for full Unicode support
    const t = tokens('السعر');
    expect(at(t, 0).kind).toBe(TokenKind.Identifier);
    expect(at(t, 0).value).toBe('السعر');
  });

  it('scans accented Latin identifiers', () => {
    const t = tokens('montantHT');
    expect(at(t, 0).kind).toBe(TokenKind.Identifier);
  });
});

// =============================================================================
describe('Scanner — arithmetic operators', () => {
  it.each([
    ['+', TokenKind.Plus],
    ['-', TokenKind.Minus],
    ['*', TokenKind.Star],
    ['/', TokenKind.Slash],
    ['%', TokenKind.Percent],
    ['^', TokenKind.Caret],
  ] as const)('scans %s', (src, expected) => {
    expect(at(tokenKinds(src), 0)).toBe(expected);
  });
});

// =============================================================================
describe('Scanner — comparison operators (single-char)', () => {
  it.each([
    ['<', TokenKind.Lt],
    ['>', TokenKind.Gt],
  ] as const)('scans %s', (src, expected) => {
    expect(at(tokenKinds(src), 0)).toBe(expected);
  });
});

// =============================================================================
describe('Scanner — multi-character operators', () => {
  it.each([
    ['<=', TokenKind.LtEq],
    ['>=', TokenKind.GtEq],
    ['==', TokenKind.Eq],
    ['!=', TokenKind.NotEq],
    ['&&', TokenKind.And],
    ['||', TokenKind.Or],
  ] as const)('scans %s as a single token', (src, expected) => {
    const kinds = tokenKinds(src);
    expect(at(kinds, 0)).toBe(expected);
    expect(at(kinds, 1)).toBe(TokenKind.EOF);
  });
});

// =============================================================================
describe('Scanner — grouping and ternary punctuation', () => {
  it.each([
    ['(', TokenKind.LParen],
    [')', TokenKind.RParen],
    ['?', TokenKind.Question],
    [':', TokenKind.Colon],
    [',', TokenKind.Comma],
    ['[', TokenKind.LBracket],
    [']', TokenKind.RBracket],
    ['.', TokenKind.Dot],
  ] as const)('scans %s', (src, expected) => {
    expect(at(tokenKinds(src), 0)).toBe(expected);
  });
});

// =============================================================================
describe('Scanner — whitespace handling', () => {
  it('ignores leading and trailing whitespace', () => {
    const kinds = tokenKinds('  42  ');
    expect(kinds).toEqual([TokenKind.Number, TokenKind.EOF]);
  });

  it('ignores whitespace between tokens', () => {
    const kinds = tokenKinds('a   +   b');
    expect(kinds).toEqual([
      TokenKind.Identifier,
      TokenKind.Plus,
      TokenKind.Identifier,
      TokenKind.EOF,
    ]);
  });

  it('handles tab and newline as whitespace', () => {
    const kinds = tokenKinds('a\t+\nb');
    expect(kinds).toEqual([
      TokenKind.Identifier,
      TokenKind.Plus,
      TokenKind.Identifier,
      TokenKind.EOF,
    ]);
  });
});

// =============================================================================
describe('Scanner — peek / next / expect contract', () => {
  it('peek does not consume the token', () => {
    const s = new Scanner('42');
    const first = s.peek();
    const second = s.peek();
    expect(first).toBe(second); // same object reference (cached)
    expect(s.next().value).toBe(42); // now consumed
    expect(s.next().kind).toBe(TokenKind.EOF);
  });

  it('expect succeeds when kind matches', () => {
    const s = new Scanner('(');
    expect(() => s.expect(TokenKind.LParen)).not.toThrow();
  });

  it('expect throws ScanError when kind does not match', () => {
    const s = new Scanner('+');
    expect(() => s.expect(TokenKind.LParen)).toThrow(ScanError);
  });

  it('returns EOF at end of input', () => {
    const s = new Scanner('');
    expect(s.next().kind).toBe(TokenKind.EOF);
    expect(s.next().kind).toBe(TokenKind.EOF); // idempotent
  });
});

// =============================================================================
describe('Scanner — error reporting', () => {
  it('throws ScanError for unrecognised character @', () => {
    expect(() => tokens('price @ 2')).toThrow(ScanError);
  });

  it('ScanError includes the source and position', () => {
    try {
      tokens('a @ b');
    } catch (err) {
      expect(err).toBeInstanceOf(ScanError);
      expect((err as ScanError).source).toBe('a @ b');
      expect((err as ScanError).pos).toBe(2);
    }
  });

  it('ScanError message contains a caret snippet', () => {
    try {
      tokens('x @ y');
    } catch (err) {
      expect((err as ScanError).message).toContain('^');
    }
  });
});

// =============================================================================
describe('Scanner — complex real-world expressions', () => {
  it('tokenizes a full arithmetic expression', () => {
    const kinds = tokenKinds('price * quantity * (1 - discount)');
    expect(kinds).toEqual([
      TokenKind.Identifier, // price
      TokenKind.Star,
      TokenKind.Identifier, // quantity
      TokenKind.Star,
      TokenKind.LParen,
      TokenKind.Number, // 1
      TokenKind.Minus,
      TokenKind.Identifier, // discount
      TokenKind.RParen,
      TokenKind.EOF,
    ]);
  });

  it('tokenizes a simple ternary expression', () => {
    const kinds = tokenKinds('score >= 90 ? 1 : 0');
    expect(kinds).toEqual([
      TokenKind.Identifier,
      TokenKind.GtEq,
      TokenKind.Number,
      TokenKind.Question,
      TokenKind.Number,
      TokenKind.Colon,
      TokenKind.Number,
      TokenKind.EOF,
    ]);
  });

  it('tokenizes function call syntax', () => {
    const kinds = tokenKinds('max(a, b)');
    expect(kinds).toEqual([
      TokenKind.Identifier, // max
      TokenKind.LParen,
      TokenKind.Identifier, // a
      TokenKind.Comma,
      TokenKind.Identifier, // b
      TokenKind.RParen,
      TokenKind.EOF,
    ]);
  });
});
