import type { ASTNode } from '../ast/nodes';
import { ParseError, ScanError } from '../errors/index';
import { Scanner } from '../scanner/scanner';
import { EOF_TOKEN, type Token, TokenKind } from '../scanner/token';
import type { ParserExtensions } from './parser-extensions';
import { getInfixBP } from './precedence';

interface TokenReader {
  peek(): Token;
  next(): Token;
  expect(kind: TokenKind): Token;
}

class TokenArrayReader implements TokenReader {
  private index = 0;

  constructor(
    private readonly tokens: readonly Token[],
    private readonly src: string,
  ) {}

  peek(): Token {
    return this.tokens[this.index] ?? EOF_TOKEN;
  }

  next(): Token {
    const t = this.tokens[this.index];
    if (t === undefined) return EOF_TOKEN;
    this.index++;
    return t;
  }

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
}

export class Parser {
  private readonly scanner: TokenReader;
  private readonly extensions?: ParserExtensions;

  constructor(sourceOrReader: string | TokenReader, extensions?: ParserExtensions) {
    this.scanner =
      typeof sourceOrReader === 'string' ? new Scanner(sourceOrReader) : sourceOrReader;
    this.extensions = extensions;
  }

  static fromTokens(src: string, tokens: Token[], extensions?: ParserExtensions): Parser {
    const instance = new Parser(new TokenArrayReader(tokens, src), extensions);
    return instance;
  }

  /**
   * Parse the full source expression and return the root `ASTNode`.
   *
   * @throws {ParseError} on any syntactic error.
   */
  parse(): ASTNode {
    const node = this.parseExpression(0);

    // After parsing a complete expression, only EOF is allowed.
    const trailing = this.scanner.peek();
    if (trailing.kind !== TokenKind.EOF) {
      throw new ParseError(`Unexpected token "${trailing.value}" after expression`, trailing);
    }

    return node;
  }

  private _getInfixBP(kind: number): number {
    const custom = this.extensions?.bindingPowers.get(kind);
    if (custom !== undefined) return custom;
    return getInfixBP(kind as TokenKind);
  }

  private parseExpression(minBP: number): ASTNode {
    // 1. Parse the prefix part (NUD)
    let left = this.nud(this.scanner.next());

    // 2. Consume infix / postfix operators as long as they bind tighter
    while (minBP < this._getInfixBP(this.scanner.peek().kind)) {
      left = this.led(this.scanner.next(), left);
    }

    return left;
  }

  /**
   * NUD - Null Denotation (prefix position)
   */
  private nud(token: Token): ASTNode {
    const customNud = this.extensions?.nudHandlers.get(token.kind);
    if (customNud) {
      return customNud(token, minBP => this.parseExpression(minBP));
    }
    switch (token.kind) {
      // Literals
      case TokenKind.Number:
        return { type: 'Literal', value: token.value };

      case TokenKind.String:
        return { type: 'Literal', value: token.value };

      // Variables and sub-formula references (f_*)
      case TokenKind.Identifier: {
        const name = token.value as string;
        // Peek ahead: if the next token is `(`, this is a function call.
        // We let `led` handle it because `(` has an infix BP of 50.
        return { type: 'Identifier', name };
      }

      // Unary minus: -expr
      case TokenKind.Minus: {
        // Parse the operand with a high BP so it binds tightly
        // (e.g. `-2 * 3` should parse as `(-2) * 3` not `-(2 * 3)`)
        const operand = this.parseExpression(35);
        return { type: 'Unary', op: '-', operand };
      }

      // Grouped expression: (expr)
      case TokenKind.LParen: {
        const inner = this.parseExpression(0);
        this.scanner.expect(TokenKind.RParen);
        return inner;
      }

      // Array literal: [expr, expr, ...]
      case TokenKind.LBracket: {
        return this.parseArrayLiteral();
      }

      case TokenKind.EOF:
        throw new ParseError('Unexpected end of expression', token);

      default:
        throw new ParseError(`Unexpected token "${token.value}" in expression`, token);
    }
  }

  /**
   * LED - Left Denotation (infix / postfix position)
   */
  private led(op: Token, left: ASTNode): ASTNode {
    const customLed = this.extensions?.ledHandlers.get(op.kind);
    if (customLed) {
      return customLed(op, left, minBP => this.parseExpression(minBP));
    }
    switch (op.kind) {
      // Standard left-associative binary operators
      case TokenKind.Plus:
      case TokenKind.Minus:
      case TokenKind.Star:
      case TokenKind.Slash:
      case TokenKind.Percent:
      case TokenKind.Eq:
      case TokenKind.NotEq:
      case TokenKind.Lt:
      case TokenKind.Gt:
      case TokenKind.LtEq:
      case TokenKind.GtEq:
      case TokenKind.And:
      case TokenKind.Or: {
        const bp = this._getInfixBP(op.kind);
        const right = this.parseExpression(bp); // left-associative: same BP
        return {
          type: 'Binary',
          op: op.value as string,
          left,
          right,
        };
      }

      // Exponentiation: right-associative
      case TokenKind.Caret: {
        const bp = this._getInfixBP(op.kind);
        const right = this.parseExpression(bp - 1);
        return { type: 'Binary', op: '^', left, right };
      }

      // Ternary conditional: test ? consequent : alternate
      case TokenKind.Question: {
        // Parse the consequent with minBP = 0 (all operators are allowed)
        const consequent = this.parseExpression(0);
        // Expect the mandatory `:` separator
        const colon = this.scanner.peek();
        if (colon.kind !== TokenKind.Colon) {
          throw new ParseError(
            `Expected ":" in ternary expression but got "${colon.value}"`,
            colon,
          );
        }
        this.scanner.next(); // consume ':'
        // Parse the alternate right-associatively:
        // BP[?] - 1 allows another `?` to appear inside the alternate branch.
        const ternaryBP = this._getInfixBP(TokenKind.Question);
        const alternate = this.parseExpression(ternaryBP - 1);
        return {
          type: 'Conditional',
          test: left,
          consequent,
          alternate,
        };
      }

      // Function call: identifier(arg1, arg2, ...)
      case TokenKind.LParen: {
        if (left.type !== 'Identifier') {
          throw new ParseError(`Cannot call non-identifier expression`, op);
        }
        const args = this.parseArgList();
        return { type: 'FunctionCall', name: left.name, args };
      }

      // Index access: obj[expr]
      case TokenKind.LBracket: {
        const property = this.parseExpression(0);
        this.scanner.expect(TokenKind.RBracket);
        return { type: 'MemberExpression', object: left, property, computed: true };
      }

      // Dot member access: obj.prop
      case TokenKind.Dot: {
        const propToken = this.scanner.next();
        if (propToken.kind !== TokenKind.Identifier) {
          throw new ParseError(
            `Expected property name after "." but got "${propToken.value}"`,
            propToken,
          );
        }
        const property: ASTNode = { type: 'Identifier', name: propToken.value as string };
        return { type: 'MemberExpression', object: left, property, computed: false };
      }

      default:
        throw new ParseError(`Unexpected infix operator "${op.value}"`, op);
    }
  }

  /** Parse a comma-separated argument list up to the closing `)`. */
  private parseArgList(): ASTNode[] {
    const args: ASTNode[] = [];

    // Handle the empty-argument case: fn()
    if (this.scanner.peek().kind === TokenKind.RParen) {
      this.scanner.next(); // consume ')'
      return args;
    }

    args.push(this.parseExpression(0));

    while (this.scanner.peek().kind === TokenKind.Comma) {
      this.scanner.next(); // consume ','
      args.push(this.parseExpression(0));
    }

    this.scanner.expect(TokenKind.RParen);
    return args;
  }

  /** Parse an array literal `[expr, expr, ...]` (opening `[` already consumed). */
  private parseArrayLiteral(): ASTNode {
    const elements: ASTNode[] = [];

    if (this.scanner.peek().kind === TokenKind.RBracket) {
      this.scanner.next(); // consume ']'
      return { type: 'ArrayLiteral', elements };
    }

    elements.push(this.parseExpression(0));

    while (this.scanner.peek().kind === TokenKind.Comma) {
      this.scanner.next(); // consume ','
      elements.push(this.parseExpression(0));
    }

    this.scanner.expect(TokenKind.RBracket);
    return { type: 'ArrayLiteral', elements };
  }
}

/**
 * Parse `source` into an `ASTNode`.  Shorthand for `new Parser(source).parse()`.
 *
 * @throws {ParseError | ScanError}
 */
export function parse(source: string, extensions?: ParserExtensions): ASTNode {
  return new Parser(source, extensions).parse();
}
