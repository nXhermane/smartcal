---
layout: home

hero:
  name: "SmartCal"
  text: "High-Performance Expression Engine"
  tagline: "Evaluate and compile your mathematical & logical formulas at over 2.5 million operations per second in JavaScript and TypeScript."
  image:
    light: /smartcal-logo-light.svg
    dark: /smartcal-logo-dark.svg
    alt: SmartCal Logo
  actions:
    - theme: brand
      text: 🚀 Getting Started
      link: /en/guide/getting-started
    - theme: alt
      text: 📊 View Benchmarks
      link: /en/internals/benchmarks
    - theme: alt
      text: 💻 GitHub
      link: https://github.com/nXhermane/SmartCal

features:
  - icon: ⚡
    title: Native JIT Compilation
    details: Transforms your formulas into native JavaScript functions executed at CPU speed (~2.5M+ ops/s) with zero interpretation overhead.
  - icon: 🛡️
    title: CSP-Safe Fast VM Mode
    details: Optimized AST interpreter without dynamic eval or new Function, designed for environments with strict Content Security Policy.
  - icon: 🎯
    title: Pratt Parser O(N) & Precedence
    details: Linear syntax parser flawlessly handling operator precedence, powers, and deep ternary decision trees.
  - icon: 🌐
    title: Full String & Unicode Support
    details: Native support for strings with spaces and international variable names (accents, Arabic, CJK, etc.).
  - icon: 🔗
    title: DAG Sub-Formula Resolution (f_*)
    details: Evaluates nested formula graphs in a single memoized topological pass with cycle detection.
  - icon: 📦
    title: Zero External Dependencies
    details: Ultra-lightweight library (< 15 KB minified), no production dependencies, with dual ESM & CommonJS support.
---

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">~2.5M+</div>
    <div class="stat-label">Operations / sec (JIT Mode)</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">&lt; 0.5 µs</div>
    <div class="stat-label">Average Latency per Calculation</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">100%</div>
    <div class="stat-label">Strict TypeScript & CSP-Safe</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">0 dep</div>
    <div class="stat-label">Zero External Dependencies</div>
  </div>
</div>

---

## ⚡ Example in 10 Seconds

::: code-group
```typescript [Precompiled JIT Mode (Recommended)]
import { compile } from 'smartcal';

// 1. Compile the formula once into native bytecode
const calculateTax = compile(
  'income > 50000 ? (income - 50000) * 0.30 + 5000 : income * 0.10'
);

// 2. Evaluate instantly across thousands of records
console.log(calculateTax.evaluate({ income: 75000 })); // 12500
console.log(calculateTax.evaluate({ income: 30000 })); // 3000
```

```typescript [Direct Evaluation (SmartCal)]
import SmartCal from 'smartcal';

// Immediate one-off evaluation
const total = SmartCal('basePrice * (1 - discountRate) + shippingTax', {
  basePrice: 150,
  discountRate: 0.20,
  shippingTax: 12,
});

console.log(total); // 132
```

```typescript [Nested Sub-Formulas (f_*)]
import SmartCal, { compile } from 'smartcal';

const f_subtotal = compile('price * quantity * (1 - discount)');
const f_tax = compile('f_subtotal * 0.20');

// Automatic topological resolution without calculation duplication
const grandTotal = SmartCal('f_subtotal + f_tax', {
  price: 100,
  quantity: 2,
  discount: 0.1,
  f_subtotal,
  f_tax,
});

console.log(grandTotal); // 216
```
:::
