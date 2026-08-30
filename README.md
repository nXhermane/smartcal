<div align="center">
  <picture align="center">
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/smartcal-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset=".github/assets/smartcal-logo-light.svg">
    <img alt="SmartCal Logo" src=".github/assets/smartcal-logo-light.svg" width="200" />
  </picture>
</div>

<h1 align="center">SmartCal — Ultra High-Performance Expression Engine</h1>

<p align="center">
  <strong>Evaluate and compile mathematical & logical expressions at over 2.5 million operations per second in JavaScript and TypeScript.</strong>
</p>

<p align="center">
  <a href="#-why-smartcal"><strong>Why SmartCal?</strong></a> ·
  <a href="#-quick-start"><strong>Quick Start</strong></a> ·
  <a href="#-performance"><strong>Performance</strong></a> ·
  <a href="#-architecture"><strong>Architecture</strong></a> ·
  <a href="#-documentation"><strong>Documentation</strong></a> ·
  <a href="#-contributing"><strong>Contributing</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/smartcal?style=flat-square&logo=npm&logoColor=white" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/smartcal?style=flat-square&logo=npm&logoColor=white" alt="downloads" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Bun-1.4+-000000?style=flat-square&logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Zero-Dependencies-22C55E?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/CSP-Safe-6366F1?style=flat-square" alt="CSP Safe" />
  <img src="https://img.shields.io/badge/License-ISC-EA580C?style=flat-square" alt="License" />
  <img src="https://github.com/nXhermane/smartcal/actions/workflows/ci.yml/badge.svg?style=flat-square" alt="CI" />
</p>

---

## Why SmartCal?

Most mathematical expression evaluators in JavaScript suffer from critical flaws: dangerous `eval()` usage, inefficient parsing pipelines, and absence of true compilation.

**SmartCal v1.1** solves these problems with a cutting-edge compiler architecture:

| Criteria | Traditional Evaluators | SmartCal Engine |
| :--- | :--- | :--- |
| **Security** | `eval()` — injection vulnerabilities, CSP-blocked | **Zero-eval JIT + CSP-Safe VM** |
| **Parsing** | Shunting-Yard — struggles with nested ternaries | **Pratt Parser O(N)** — linear, unambiguous |
| **Performance** | Re-parses text on every evaluation | **Compile once, evaluate at ~2.5M+ ops/s** |
| **Nested Formulas** | Recursive re-parsing, exponential degradation | **Memoized topological DAG resolution** |
| **Environment** | Requires `unsafe-eval` | **100% CSP-Safe mode available** |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (>= 1.4) or [Node.js](https://nodejs.org) (>= 18)

### Installation

```bash
bun add smartcal
# or
npm install smartcal
```

### Basic Evaluation

```typescript
import SmartCal from 'smartcal';

// Arithmetic with operator precedence
console.log(SmartCal('2 + 3 * 4'));           // 14
console.log(SmartCal('2 ^ 3 ^ 2'));           // 512 (right-associative)

// With variables
const bmi = SmartCal('weight / (height ^ 2)', { weight: 70, height: 1.75 }); // 22.86

// Ternary expressions
console.log(SmartCal('score >= 80 ? "A" : "B"', { score: 85 })); // "A"

// Unicode support
console.log(SmartCal('café + quantité', { café: 2.5, quantité: 4 })); // 6.5
```

### High-Performance Precompiled Evaluation

```typescript
import { compile } from 'smartcal';

// Compile once
const taxCalc = compile('income > 50000 ? (income - 50000) * 0.30 + 5000 : income * 0.10');

// Evaluate many times (~2.5M+ ops/s)
console.log(taxCalc.evaluate({ income: 75000 })); // 12500
console.log(taxCalc.evaluate({ income: 30000 })); // 3000
```

### Execution Modes

```typescript
const jit = compile('price * quantity', { mode: 'jit' });   // Maximum performance
const vm  = compile('price * quantity', { mode: 'vm' });    // CSP-safe
const auto = compile('price * quantity', { mode: 'auto' }); // Adaptive
```

### Expression Validation

```typescript
import { isValidExpression } from 'smartcal';

isValidExpression('price * (1 - discount)'); // true
isValidExpression('price * ');               // false
```

---

## Performance

Detailed benchmarks are auto-generated and always up-to-date in the documentation:

**[View Live Benchmarks &rarr;](https://nxhermane.github.io/smartcal/internals/benchmarks)**

Quick highlights (JIT Mode):

| Scenario | Throughput | Latency |
| :--- | :--- | :--- |
| **Simple Arithmetic** | **~2.4M ops/s** | ~0.4 µs |
| **Nested Ternaries** | **~1.1M ops/s** | ~0.9 µs |
| **Boolean Logic XXL** | **~900K ops/s** | ~1.1 µs |
| **Polynomial (11 Variables)** | **~280K ops/s** | ~3.5 µs |

> [!TIP]
> Run benchmarks locally: `bun run bench`

---

## Architecture

SmartCal v1.1 is built on a complete compilation pipeline: **Lexing -> Parsing -> Code Generation / Execution**.

```text
Expression String
       |
       v
[Scanner] — Zero-Allocation, charCodeAt cursor
       |
       v
[Pratt Parser] — O(N) linear, Binding Power precedence
       |
       v
[AST] — Typed Abstract Syntax Tree
       |
       +---> [JIT Compiler] — new Function() -> V8 TurboFan (~2.5M+ ops/s)
       |
       +---> [Fast VM] — CSP-Safe interpreter (~1M ops/s)
       |
       v
[FormulaResolver] — Topological DAG resolution for f_* sub-formulas
       |
       v
Result (Number / String)
```

### The 4 Optimization Pillars

1. **Zero-Allocation Scanner** — No `.split()` or regex. Direct `charCodeAt()` cursor traversal.
2. **Linear Pratt Parser** — Correctly handles nested ternaries and right-associative powers in a single pass.
3. **JIT Code Generation** — AST translated to native JS, optimized by V8 TurboFan.
4. **Topological DAG Resolution** — Nested `f_*` formulas resolved with memoization and cycle detection.

---

## Advanced Usage

### Sub-Formulas & DAG (`f_*`)

```typescript
import SmartCal, { compile } from 'smartcal';

const f_subtotal = compile('price * quantity * (1 - discount)');
const f_tax = compile('f_subtotal * taxRate');
const f_total = compile('f_subtotal + f_tax + shipping');

console.log(f_total.evaluate({
  price: 50, quantity: 2, discount: 0.10,
  taxRate: 0.20, shipping: 5,
  f_subtotal, f_tax,
})); // 113
```

### Custom Functions

```typescript
import { FunctionRegistry, compile } from 'smartcal';

FunctionRegistry.register('clamp', (val, min, max) =>
  Math.min(Math.max(val, min), max)
);

const speedLimit = compile('clamp(speed, 0, 130)');
console.log(speedLimit.evaluate({ speed: 150 })); // 130

// Built-in: abs, sqrt, round, floor, ceil, min, max, sin, cos, tan, log, exp
const hypotenuse = compile('sqrt(a ^ 2 + b ^ 2)');
console.log(hypotenuse.evaluate({ a: 3, b: 4 })); // 5
```

---

## Documentation

Full documentation is available at [nxhermane.github.io/smartcal](https://nxhermane.github.io/smartcal) (available in English and French).

### Operator Precedence

| Priority | Operators | Description |
|----------|-----------|-------------|
| 1 | `( )` | Parentheses |
| 2 | `^` | Exponentiation (right-associative) |
| 3 | `*`, `/`, `%` | Multiplicative |
| 4 | `+`, `-` | Additive |
| 5 | `<`, `<=`, `>`, `>=` | Comparison |
| 6 | `==`, `!=` | Equality |
| 7 | `&&` | Logical AND |
| 8 | `\|\|` | Logical OR |
| 9 | `? :` | Ternary (right-associative) |

### API Reference

```typescript
// Direct evaluation
SmartCal(expression: string, data?: DataType, options?: SmartCalOptions): number | string

// Validate syntax
isValidExpression(expression: string): boolean

// Compile for reuse
compile(expression: string, options?: CompileOptions): CompiledExpression
```

### Error Types

| Error | Description |
|-------|-------------|
| `ScanError` | Unknown character or unclosed string |
| `ParseError` | Invalid token sequence |
| `FormulaResolutionError` | Circular dependency in `f_*` formulas |
| `JITError` | JIT compilation blocked by CSP |
| `VMError` | Undefined operation in VM mode |
| `IncorrectSyntaxError` | Legacy syntax error |
| `InvalidFormulaError` | Empty formula |

---

## Contributing

We welcome contributions!

### Development Setup

```bash
git clone https://github.com/nXhermane/smartcal.git
cd smartcal
bun install
```

### Scripts

```bash
bun run dev            # Watch mode for building
bun run build          # Build library with tsup
bun run docs:dev       # VitePress dev server
bun run docs:build     # Build documentation
bun test               # Run tests
bun run test:coverage  # Run with coverage
bun run bench          # Run benchmarks
bun run lint           # Biome check
bun run lint:fix       # Biome fix
bun run check-types    # TypeScript check
```

### Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `perf:` — Performance improvement
- `refactor:` — Code refactoring
- `test:` — Adding tests
- `BREAKING CHANGE:` — Major version bump

Pre-commit hooks (via Husky) automatically run Biome and typecheck on staged files.

---

<br />

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/smartcal-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset=".github/assets/smartcal-logo-light.svg">
    <img alt="SmartCal Logo" src=".github/assets/smartcal-logo-light.svg" width="64" />
  </picture>
  <br />
  <em>SmartCal — Evaluate. Compile. Accelerate.</em>
</div>
