# Math Functions & Extensibility

SmartCal includes a comprehensive set of built-in mathematical functions and provides an extension API via `FunctionRegistry`.

## Built-in Functions

The following standard mathematical functions are available by default in all expressions:

| Function | Description | Example |
| :--- | :--- | :--- |
| `abs(x)` | Absolute value | `abs(-15)` $\rightarrow$ `15` |
| `sqrt(x)` | Square root | `sqrt(16)` $\rightarrow$ `4` |
| `round(x)` | Round to nearest integer | `round(3.6)` $\rightarrow$ `4` |
| `floor(x)` | Round down | `floor(3.9)` $\rightarrow$ `3` |
| `ceil(x)` | Round up | `ceil(3.1)` $\rightarrow$ `4` |
| `min(a, b, ...)` | Minimum of a list of numbers | `min(10, 5, 20)` $\rightarrow$ `5` |
| `max(a, b, ...)` | Maximum of a list of numbers | `max(10, 5, 20)` $\rightarrow$ `20` |
| `sin(x)` | Sine (in radians) | `sin(0)` $\rightarrow$ `0` |
| `cos(x)` | Cosine (in radians) | `cos(0)` $\rightarrow$ `1` |
| `tan(x)` | Tangent (in radians) | `tan(0)` $\rightarrow$ `0` |
| `log(x)` | Natural logarithm (base $e$) | `log(1)` $\rightarrow$ `0` |
| `exp(x)` | Exponential ($e^x$) | `exp(1)` $\rightarrow$ `2.718...` |

### Example in a formula:

```typescript
import SmartCal from 'smartcal';

const hypotenuse = SmartCal('sqrt(a ^ 2 + b ^ 2)', { a: 3, b: 4 });
console.log(hypotenuse); // 5
```

---

## Registering Custom Functions (`FunctionRegistry`)

You can extend SmartCal by registering your own custom business functions:

```typescript
import { FunctionRegistry, compile } from 'smartcal';

// 1. Register a custom function
FunctionRegistry.register('clamp', (val, min, max) => {
  return Math.min(Math.max(val, min), max);
});

// 2. Use the function in any expression
const clampSpeed = compile('clamp(speed, 0, 130)');

console.log(clampSpeed.evaluate({ speed: 150 })); // 130
console.log(clampSpeed.evaluate({ speed: -10 })); // 0
console.log(clampSpeed.evaluate({ speed: 90 }));  // 90
```

### `FunctionRegistry` Utility Methods

```typescript
// Check if a function is available
FunctionRegistry.has('clamp'); // true

// Get the underlying function
const fn = FunctionRegistry.get('clamp');

// Remove a custom function
FunctionRegistry.unregister('clamp');

// Reset all custom functions
FunctionRegistry.clearCustom();
```
