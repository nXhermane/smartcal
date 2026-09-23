# Error Handling

SmartCal provides a clear and typed error hierarchy, enriched with diagnostic information to facilitate debugging.

## Modern Error Hierarchy

### `ScanError`
Thrown by the `Scanner` when an unknown character or unclosed string is encountered. Contains the exact position index in the source string.

```typescript
import { Scanner, ScanError } from 'smartcal';

try {
  new Scanner('price @ 2').scanTokens();
} catch (err) {
  if (err instanceof ScanError) {
    console.log(err.message);
    // Unexpected character "@" (U+0040)
    // price @ 2
    //       ^
    console.log(err.pos); // 6
  }
}
```

---

### `ParseError`
Thrown by the `Parser` when the token sequence does not conform to the expected grammar.

```typescript
import { parse, ParseError } from 'smartcal';

try {
  parse('10 + * 20');
} catch (err) {
  if (err instanceof ParseError) {
    console.log(err.token); // Token(Star, '*', pos=5)
  }
}
```

---

### `FormulaResolutionError`
Thrown by the `FormulaResolver` when a cycle of dependencies is detected in `f_*` sub-formulas.

```typescript
import { FormulaResolutionError } from 'smartcal';

// err.cycle contains the cycle path: ["f_a", "f_b", "f_a"]
```

---

### `JITError` & `VMError`
- `JITError`: Thrown if compilation to native function fails or is blocked by the page's Content Security Policy.
- `VMError`: Thrown if the virtual machine encounters an undefined operation or non-existent function.

### `VariableNotFoundError`

Thrown when a variable referenced in a formula is not present in the data object and strict mode is enabled.
```ts
import SmartCal, { VariableNotFoundError } from 'smartcal';

const calc = SmartCal('price + tax', { strict: true });

try {
  calc({ price: 10 });
} catch (err) {
  if (err instanceof VariableNotFoundError) {
    console.log(`Missing variable: ${err.variable}`);
  }
}
```

---

## Legacy Error Classes (Backward Compatibility)

To guarantee 100% backward compatibility with earlier versions (v1.0.x), legacy error classes remain exported:
- `IncorrectSyntaxError`: Triggered by `SmartCal(invalidExp)` to catch syntax errors.
- `InvalidFormulaError`: Triggered when a formula is empty.
- `FormulaInterpreterError`
- `FormulaVariableNotFoundError`
