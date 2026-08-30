/**
 * @file Parser.ts
 * @description Pratt Parser (Top-Down Operator Precedence) for SmartCal v1.1.
 *
 * ## Algorithm overview (THEORY_COMPILERS_AND_PARSING.md §3)
 *
 * The Pratt Parser replaces the 6-to-7-pass pipeline of v1.0.14
 * (Tokenize → check parentheses → check operators → check ternary →
 *  Shunting-Yard → RPN → AST) with a **single recursive descent**.
 *
 * Core concepts:
 * - **NUD** ("Null Denotation"): how a token behaves in *prefix* position
 *   (start of an expression).  E.g. a number, a variable, a unary `-`, `(`.
 * - **LED** ("Left Denotation"): how a token behaves in *infix/postfix*
 *   position (after a left operand has already been parsed).  E.g. `+`, `*`,
 *   `?`, `(` for a function call.
 * - **Binding Power (BP)**: numeric "strength" of each operator.  The main
 *   loop keeps consuming operators as long as the next one's BP > current BP.
 *
 * ## Key correctness fix over v1.0.14
 *
 * The old `checkTernaryConditionSyntax` used a naive boolean flag that was
 * toggled for every `?` and `:`.  This caused a crash on any nested ternary:
 *   `age < 18 ? 0 : (age < 25 ? 15 : 30)`  →  IncorrectSyntaxError.
 *
 * The Pratt Parser handles ternaries via right-associative recursion: when it
 * sees `?` it parses the consequent with `minBP = 0`, then expects `:`, then
 * parses the alternate with `minBP = BP[?] - 1`.  Arbitrarily deep nesting
 * works naturally.
 *
 * ## Single responsibility
 *
 * The `Parser` class only produces an `ASTNode` tree from a `Scanner`.  It
 * does **not** evaluate expressions, resolve variables, or generate code — that
 * is the job of the JIT Compiler / Fast VM (Étape 3).
 */

import type { ASTNode } from '../ast/nodes';
import { ParseError } from '../errors/index';
import { Scanner } from '../scanner/scanner';
import { type Token, TokenKind } from '../scanner/token';
import { getInfixBP } from './precedence';

export class Parser {
  private readonly scanner: Scanner;

  constructor(source: string) {
    this.scanner = new Scanner(source);
  }

  // ---------------------------------------------------------------------------
  // Public entry point
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Core Pratt loop
  // ---------------------------------------------------------------------------

  /**
   * Parse an expression whose operators must have a binding power strictly
   * greater than `minBP`.
   *
   * This is the fundamental Pratt loop described in THEORY_COMPILERS_AND_PARSING.md §3.1:
   * ```
   * let left = nud(next())
   * while (minBP < BP[peek()]) { left = led(next(), left) }
   * return left
   * ```
   */
  private parseExpression(minBP: number): ASTNode {
    // 1. Parse the prefix part (NUD)
    let left = this.nud(this.scanner.next());

    // 2. Consume infix / postfix operators as long as they bind tighter
    while (minBP < getInfixBP(this.scanner.peek().kind)) {
      left = this.led(this.scanner.next(), left);
    }

    return left;
  }

  // ---------------------------------------------------------------------------
  // NUD — Null Denotation (prefix position)
  // ---------------------------------------------------------------------------

  private nud(token: Token): ASTNode {
    switch (token.kind) {
      // Literals
      case TokenKind.Number:
        return { type: 'Literal', value: token.value as number };

      case TokenKind.String:
        return { type: 'Literal', value: token.value as string };

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

  // ---------------------------------------------------------------------------
  // LED — Left Denotation (infix / postfix position)
  // ---------------------------------------------------------------------------

  private led(op: Token, left: ASTNode): ASTNode {
    switch (op.kind) {
      // ------------------------------------------------------------------
      // Standard left-associative binary operators
      // ------------------------------------------------------------------
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
        const bp = getInfixBP(op.kind);
        const right = this.parseExpression(bp); // left-associative: same BP
        return {
          type: 'Binary',
          op: op.value as string,
          left,
          right,
        };
      }

      // ------------------------------------------------------------------
      // Exponentiation: right-associative
      // ------------------------------------------------------------------
      case TokenKind.Caret: {
        const bp = getInfixBP(op.kind);
        // Pass bp - 1 so that `2 ^ 3 ^ 4` parses as `2 ^ (3 ^ 4)`.
        const right = this.parseExpression(bp - 1);
        return { type: 'Binary', op: '^', left, right };
      }

      // ------------------------------------------------------------------
      // Ternary conditional: test ? consequent : alternate
      // ------------------------------------------------------------------
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
        // This is what fixes the v1.0.14 crash on nested ternaries.
        const ternaryBP = getInfixBP(TokenKind.Question);
        const alternate = this.parseExpression(ternaryBP - 1);
        return {
          type: 'Conditional',
          test: left,
          consequent,
          alternate,
        };
      }

      // ------------------------------------------------------------------
      // Function call: identifier(arg1, arg2, ...)
      // ------------------------------------------------------------------
      case TokenKind.LParen: {
        if (left.type !== 'Identifier') {
          throw new ParseError(`Cannot call non-identifier expression`, op);
        }
        const args = this.parseArgList();
        return { type: 'FunctionCall', name: left.name, args };
      }

      // ------------------------------------------------------------------
      // Index access: obj[expr]
      // ------------------------------------------------------------------
      case TokenKind.LBracket: {
        const property = this.parseExpression(0);
        this.scanner.expect(TokenKind.RBracket);
        return { type: 'MemberExpression', object: left, property, computed: true };
      }

      // ------------------------------------------------------------------
      // Dot member access: obj.prop
      // ------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

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

  /** Parse an array literal `[expr, expr, ...]` — opening `[` already consumed. */
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

// ---------------------------------------------------------------------------
// Convenience factory
// ---------------------------------------------------------------------------

/**
 * Parse `source` into an `ASTNode`.  Shorthand for `new Parser(source).parse()`.
 *
 * @throws {ParseError | ScanError}
 */
export function parse(source: string): ASTNode {
  return new Parser(source).parse();
}
