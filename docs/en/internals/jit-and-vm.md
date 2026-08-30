# JIT Compiler vs Fast VM

SmartCal offers a dual execution strategy to combine **maximum performance** and **universal compatibility**.

## 1. JIT Compiler (Just-In-Time)

The JIT compiler translates the AST directly into native JavaScript source code, then instantiates a function via `new Function`.

### Transformation Example

For the formula:
```text
score > 100 ? (bonus * 1.5) : (bonus * 1.0)
```

The JIT generates the following JavaScript code:
```javascript
function anonymous(d, r) {
  return ((d['score'] ?? 0) > 100 ? ((d['bonus'] ?? 0) * 1.5) : ((d['bonus'] ?? 0) * 1.0));
}
```

### Advantages:
- **TurboFan/V8 Optimization**: The JavaScript engine compiles this function into native machine instructions with inline caching.
- **Exceptional throughput**: Over **2.5 to 10 million operations per second**.
- **Zero interpretation overhead**: No tree traversal during evaluation.

---

## 2. Fast VM Interpreter (CSP-Safe)

In certain strict contexts (Content Security Policy blocking `unsafe-eval`, browser extensions, Cloudflare Workers, QuickJS environments), `new Function` is forbidden.

SmartCal therefore includes a Fast VM interpreter that evaluates the AST without ever using `eval`:

```typescript
// Fast VM evaluation loop example
evaluateNode(node: ASTNode, data: Record<string, any>): number | string {
  switch (node.type) {
    case 'Literal': return node.value;
    case 'Identifier': return data[node.name] ?? 0;
    case 'Binary': {
      const left = this.evaluateNode(node.left, data);
      const right = this.evaluateNode(node.right, data);
      return this.applyOp(node.operator, left, right);
    }
    case 'Conditional': {
      const cond = this.evaluateNode(node.condition, data);
      return cond ? this.evaluateNode(node.consequent, data) : this.evaluateNode(node.alternate, data);
    }
  }
}
```

### Advantages:
- **100% Secure (Zero-Eval)**.
- **High throughput**: Over **500,000 to 1,200,000 ops/s**, which remains significantly higher than v1.0.14.

---

## Mode Comparison

| Criterion | JIT Mode (`'jit'`) | VM Mode (`'vm'`) | Auto Mode (`'auto'`) |
| :--- | :--- | :--- | :--- |
| **Speed (Hot)** | ~2.5M - 10M ops/s | ~500k - 1.2M ops/s | JIT if available, else VM |
| **CSP Security** | Requires `unsafe-eval` | **100% CSP-Safe** | Adapts automatically |
| **Recommended for** | Servers, Node.js, Bun, Intensive calculations | Web extensions, Cloudflare Workers | Standard universal use |
