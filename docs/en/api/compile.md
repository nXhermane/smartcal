# API: `compile()`

Compiles an expression once into a `CompiledExpression` object for repeated ultra-fast executions.

## Signature

```typescript
function compile(
  expression: string,
  options?: CompileOptions
): CompiledExpression;
```

---

## Parameters

### `expression` (`string`)
The mathematical/logical formula to compile.

### `options` (`CompileOptions`, optional)
- `mode` (`'auto' | 'jit' | 'vm'`): Desired execution mode (default `'auto'`).

---

## `CompiledExpression` Interface

The returned object implements the following interface:

```typescript
interface CompiledExpression {
  readonly type: 'CompiledExpression';

  /**
   * Evaluates the compiled formula against a data object.
   * Amortizes parsing cost: ~2.5M+ ops/sec.
   */
  evaluate<T extends DataType>(data: T): string | number;

  /**
   * Returns the original source formula as text.
   */
  toString(): string;
}
```

---

## Performance & Why Compile?

When you use `SmartCal(expr, data)` in a loop of 100,000 elements, the engine must tokenize and rebuild the AST 100,000 times.

With `compile()`:
1. The text is scanned and parsed into AST **1 time only**.
2. The AST is compiled into native V8 JS bytecode **1 time only**.
3. Each call to `.evaluate(data)` is a direct JavaScript function call.

```typescript
import { compile } from 'smartcal';

const taxFormula = compile('income * taxRate - taxCredit');

// Loop over thousands of rows: zero parsing overhead
for (const employee of employees) {
  employee.tax = taxFormula.evaluate(employee);
}
```
