# API: `FunctionRegistry`

Global function registry for extending SmartCal's calculation capabilities with your own business functions.

## Static Methods

### `register(name: string, fn: MathFn): void`
Registers or replaces a custom function available in expressions.

```typescript
import { FunctionRegistry, compile } from 'smartcal';

FunctionRegistry.register('hypot', (a, b) => Math.sqrt(a ** 2 + b ** 2));

const expr = compile('hypot(x, y)');
console.log(expr.evaluate({ x: 3, y: 4 })); // 5
```

---

### `get(name: string): MathFn | undefined`
Retrieves the function associated with a name (searches custom functions first, then built-in functions).

```typescript
const sqrtFn = FunctionRegistry.get('sqrt');
```

---

### `has(name: string): boolean`
Indicates whether a function (built-in or custom) exists.

```typescript
FunctionRegistry.has('cos'); // true
FunctionRegistry.has('unknown'); // false
```

---

### `unregister(name: string): boolean`
Removes a previously registered custom function.

```typescript
FunctionRegistry.unregister('hypot');
```

---

### `listAll(): string[]`
Returns the complete list of all usable function names.
