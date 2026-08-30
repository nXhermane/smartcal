# Syntax & Operators

SmartCal integrates a rich and expressive grammar, precisely handled by its Pratt parser.

## Operator & Precedence Table

Operators are listed below in descending order of priority (from highest to lowest precedence):

| Category | Operator | Description | Associativity | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Parentheses** | `( )` | Priority grouping | - | `(2 + 3) * 4` |
| **Unary** | `+`, `-` | Positive / Unary negation | Right | `-x`, `-(a + b)` |
| **Exponentiation** | `^` | Power | **Right** | `2 ^ 3 ^ 2` (= $2^9 = 512$) |
| **Multiplicative** | `*`, `/`, `%` | Multiplication, Division, Modulo | Left | `10 % 3 * 2` |
| **Additive** | `+`, `-` | Addition, Subtraction | Left | `10 + 5 - 2` |
| **Comparison** | `<`, `<=`, `>`, `>=` | Order comparisons | Left | `age >= 18` |
| **Equality** | `==`, `!=` | Strict equality / Inequality | Left | `status == 'active'` |
| **Logical AND** | `&&` | Logical conjunction (short-circuit) | Left | `a > 0 && b > 0` |
| **Logical OR** | `\|\|` | Logical disjunction (short-circuit) | Left | `isAdmin \|\| isOwner` |
| **Conditional** | `? :` | Ternary operator | **Right** | `score > 50 ? 1 : 0` |

---

## Supported Data Types

### Numbers
SmartCal accepts integers and floating-point numbers:
```typescript
SmartCal('3.14159 * radius ^ 2', { radius: 5 });
```

### Strings
String literals can be delimited by single quotes `'...'` or double quotes `"..."` and can contain spaces:
```typescript
SmartCal("user == 'John Doe' ? 'VIP' : 'Standard'", { user: 'John Doe' }); // 'VIP'
```

### Identifiers & Unicode
Variable names can contain Latin letters, digits, underscores `_`, and all international Unicode characters:
```typescript
SmartCal('café_prix + quantité_achetée', {
  café_prix: 2.5,
  quantité_achetée: 4,
}); // 6.5
```

---

## Nested Ternary Operators

Thanks to the right associativity of the Pratt Parser, nested decision trees are written clearly without ambiguity:

```typescript
const taxBracket = compile(
  'income < 10000 ? 0 : (income < 40000 ? 0.15 : (income < 100000 ? 0.30 : 0.45))'
);

taxBracket.evaluate({ income: 55000 }); // 0.3
```
