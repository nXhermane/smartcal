# API: `SmartCal()`

The main default function for evaluating an expression immediately.

## Signature

```typescript
function SmartCal(
  expression: string,
  data?: DataType,
  options?: SmartCalOptions
): number | string;
```

---

## Parameters

### `expression` (`string`)
The string containing the formula to evaluate. Must not be empty.

### `data` (`DataType`, optional)
Object containing variable bindings. Values can be numbers, strings, or `CompiledExpression` objects (for `f_*` sub-formulas).

```typescript
type DataType = Record<string, number | string | CompiledExpression>;
```

### `options` (`SmartCalOptions`, optional)
Execution engine configuration options:
- `mode` (`'auto' | 'jit' | 'vm'`):
  - `'auto'` (default): Uses JIT compilation if available, otherwise transparently falls back to Fast VM.
  - `'jit'`: Forces compilation to native JavaScript function via `new Function`.
  - `'vm'`: Forces evaluation by the linear Fast VM interpreter (CSP-safe).

---

## Returns

Returns the evaluation result as a `number` or `string`.

---

## Exceptions Thrown

- `InvalidFormulaError`: If the provided expression is empty or contains only whitespace.
- `IncorrectSyntaxError`: If the formula has a syntax error or an unrecognized character.
- `FormulaResolutionError`: If a circular dependency is detected in `f_*` sub-formulas.

---

## Examples

```typescript
import SmartCal from 'smartcal';

// Direct calculation
const total = SmartCal('quantity * price * (1 - discount)', {
  quantity: 5,
  price: 20,
  discount: 0.1,
});
console.log(total); // 90

// In strict VM mode (without eval)
const safeResult = SmartCal('10 + 20', {}, { mode: 'vm' });
```
