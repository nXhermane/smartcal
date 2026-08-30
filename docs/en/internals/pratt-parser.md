# Scanner & Pratt Parser

## 1. Zero-Allocation Scanner

SmartCal's scanner reads the character stream without creating intermediate object arrays.

### Features:
- Detection of 2-character operators (`<=`, `>=`, `==`, `!=`, `&&`, `||`) via simple `charCodeAt` pair comparison.
- Support for strings with spaces (`"Hello world"`).
- Support for extended Unicode range (`U+0080` to `U+FFFF`) to allow international identifiers.

---

## 2. The Pratt Parser (Top-Down Operator Precedence)

Invented by Vaughan Pratt in 1973, the Pratt Parser associates precedence not with grammar rules, but with **tokens themselves** via two functions:

1. **NUD (*Null Denotation*)**: What a token does when it appears at the start of an expression (e.g., literal number, identifier, opening parenthesis, unary `-` sign).
2. **LED (*Left Denotation*)**: What a token does when it appears between two expressions (e.g., addition `+`, multiplication `*`, ternary `?`).

### Binding Power

Each operator has a left and right binding power `(lbp, rbp)`:

| Operator | Binding Power (lbp, rbp) | Associativity |
| :--- | :--- | :--- |
| `+`, `-` | `(50, 51)` | Left-associative (`lbp < rbp`) |
| `*`, `/`, `%` | `(60, 61)` | Left-associative |
| `^` (Power) | `(71, 70)` | **Right-associative** (`lbp > rbp`) |
| `? :` (Ternary) | `(20, 19)` | **Right-associative** |

```typescript
// Core Pratt parsing algorithm
parseExpression(rbp = 0): ASTNode {
  let token = this.scanner.next();
  let left = this.nud(token);

  while (this.getLbp(this.scanner.peek()) > rbp) {
    token = this.scanner.next();
    left = this.led(token, left);
  }

  return left;
}
```

This elegant mechanism guarantees strictly linear parsing time $O(N)$ over the expression length.
