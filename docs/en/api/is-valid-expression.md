# API: `isValidExpression()`

Validates the syntax of an expression without executing it and **without ever throwing exceptions**.

## Signature

```typescript
function isValidExpression(expression: string): boolean;
```

---

## Returns

- `true`: If the formula is syntactically correct and can be parsed by the Pratt Parser.
- `false`: If the string is empty, incomplete, or contains grammar errors.

---

## Examples

```typescript
import { isValidExpression } from 'smartcal';

// Valid expressions
isValidExpression('10 + 20');                    // true
isValidExpression('age >= 18 ? "Majeur" : "Mineur"'); // true
isValidExpression('price * (1 - discount)');      // true

// Invalid expressions
isValidExpression('');                           // false
isValidExpression('10 +');                       // false
isValidExpression('(10 + 20');                   // false (unclosed parenthesis)
isValidExpression('10 + * 20');                   // false (double operator)
```
