# Getting Started

## Installation

Install SmartCal via your favorite package manager:

::: code-group
```bash [bun]
bun add smartcal
```

```bash [pnpm]
pnpm add smartcal
```

```bash [npm]
npm install smartcal
```

```bash [yarn]
yarn add smartcal
```
:::

---

## Import

SmartCal provides universal support (ESM and CommonJS) with built-in full TypeScript declarations:

::: code-group
```typescript [ESM / TypeScript]
import SmartCal, { compile, isValidExpression } from 'smartcal';
```

```javascript [CommonJS]
const { default: SmartCal, compile, isValidExpression } = require('smartcal');
```
:::

---

## The 3 Usage Modes

### 1. Direct Evaluation (`SmartCal`)
Ideal for one-off calculations where the expression is evaluated only once.

```typescript
import SmartCal from 'smartcal';

// Simple arithmetic expression
const total = SmartCal('10 + 20 * 2'); // 50

// Expression with variables
const score = SmartCal('basePoints + bonus * multiplier', {
  basePoints: 100,
  bonus: 25,
  multiplier: 2,
}); // 150
```

---

### 2. High-Performance Precompiled Evaluation (`compile`)
When the same formula must be re-evaluated thousands or millions of times (e.g., data loops, financial arrays, charts, servers), use `compile()`:

```typescript
import { compile } from 'smartcal';

// One-time compilation (Parse AST once + compile to native JIT function)
const formula = compile('price * (1 - discount) + shipping');

// Ultra-fast executions (~2.5M+ ops/s)
const order1 = formula.evaluate({ price: 100, discount: 0.1, shipping: 5 }); // 95
const order2 = formula.evaluate({ price: 200, discount: 0.2, shipping: 0 }); // 160
```

---

### 3. Formula Validation without Errors (`isValidExpression`)
Ideal for checking the validity of user-entered syntax in a form (without throwing exceptions).

```typescript
import { isValidExpression } from 'smartcal';

console.log(isValidExpression('price * (1 - discount)')); // true
console.log(isValidExpression('price * '));               // false
```
