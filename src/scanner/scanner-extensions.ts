import type { Token } from './token';

/**
 * A TokenHandler is called by the scanner while processing a character.
 * It may return a Token (successful scan) or null (defer to later handlers).
 */
export type TokenHandler = (
  ch: number,
  src: string,
  pos: number,
  advance: (n: number) => void,
) => Token | null;

/**
 * Container for the extensions registered for the Scanner.
 * Immutable after construction — extensions are added
 * via ScannerExtensionsBuilder then frozen.
 */
export interface ScannerExtensions {
  /** Handlers called in order before the core rules. */
  readonly tokenHandlers: readonly TokenHandler[];
  /** Map char1+char2 → TokenKind for custom two-character operators. */
  readonly twoCharOps: ReadonlyMap<number, number>; // key = ch1 << 8 | ch2
  /** Map char → TokenKind for custom single-character operators. */
  readonly singleCharOps: ReadonlyMap<number, number>;
}

/**
 * Mutable builder for ScannerExtensions.
 * Used by BoundPluginContext.
 */
export class ScannerExtensionsBuilder {
  private readonly _tokenHandlers: TokenHandler[] = [];
  private readonly _twoCharOps: Map<number, number> = new Map();
  private readonly _singleCharOps: Map<number, number> = new Map();

  addTokenHandler(handler: TokenHandler): void {
    this._tokenHandlers.push(handler);
  }

  /**
   * Registers a custom two-character operator token.
   *
   * The operator is indexed using a 16-bit bitwise shift `(ch1 << 8) | ch2`
   * (via `encodeTwoCharKey`) to avoid any string allocation during the scanner's
   * hot lookup path.
   *
   * @param ch1 - Character code of the first character
   * @param ch2 - Character code of the second character
   * @param kind - TokenKind to produce when both characters match consecutively
   *
   * @example
   * // Register '//' (floor division)
   * const slash = '/'.charCodeAt(0);
   * builder.addTwoCharOp(slash, slash, FloorDivToken);
   */
  addTwoCharOp(ch1: number, ch2: number, kind: number): void {
    const key = encodeTwoCharKey(ch1, ch2);
    if (this._twoCharOps.has(key)) {
      throw new RangeError(
        `Scanner collision: Two-character operator "${String.fromCharCode(ch1, ch2)}" ` +
          `is already registered as TokenKind ${this._twoCharOps.get(key)}.`,
      );
    }
    this._twoCharOps.set(key, kind);
  }

  addSingleCharOp(ch: number, kind: number): void {
    this._singleCharOps.set(ch, kind);
  }

  build(): ScannerExtensions {
    return {
      tokenHandlers: Object.freeze([...this._tokenHandlers]),
      twoCharOps: new Map(this._twoCharOps),
      singleCharOps: new Map(this._singleCharOps),
    };
  }
}

/**
 * Encodes two 16-bit character codes into a single 32-bit integer key
 * for fast Map lookups without string concatenation or allocation overhead.
 *
 * @param ch1 - Char code of the first character (e.g. 60 for '<')
 * @param ch2 - Char code of the second character (e.g. 61 for '=')
 * @returns A unique numeric key representing the pair: `(ch1 << 8) | ch2`
 *
 * @example
 * // For "<=" : '<'.charCodeAt(0) is 60, '='.charCodeAt(0) is 61
 * encodeTwoCharKey(60, 61); // returns 15421 ((60 << 8) | 61)
 */
export function encodeTwoCharKey(ch1: number, ch2: number): number {
  return (ch1 << 8) | ch2;
}
