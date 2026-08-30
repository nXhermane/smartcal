
## 1. Cold Evaluation [Direct SmartCal()]

| Scenario | Throughput | Latency | Median |
| :--- | :--- | :--- | :--- |
| Simple Arithmetic | **257.1K ops/s** | 4 µs | 3 µs |
| Polynomial 11 Variables | **31.8K ops/s** | 31 µs | 22 µs |
| XXL Monster Formula (26 Variables) | **26.7K ops/s** | 37 µs | 32 µs |
| Deep Nested Ternary Decision Tree | **82.4K ops/s** | 12 µs | 10 µs |
| Boolean Logic XXL | **62.0K ops/s** | 16 µs | 11 µs |
| Cascading DAG (8 Nested f_* Formulas) | **46.8K ops/s** | 21 µs | 18 µs |


## 2. Hot Precompiled Evaluation [JIT Mode]

| Scenario | Throughput | Latency | Median |
| :--- | :--- | :--- | :--- |
| Simple Arithmetic [JIT] | **2.4M ops/s** | 420 ns | 252 ns |
| Polynomial 11 Variables [JIT] | **567.5K ops/s** | 2 µs | 1 µs |
| XXL Monster Formula 26 Vars [JIT] | **157.2K ops/s** | 6 µs | 5 µs |
| Deep Ternary Tree [JIT] | **2.6M ops/s** | 391 ns | 335 ns |
| Boolean Logic XXL [JIT] | **1.8M ops/s** | 556 ns | 475 ns |


## 3. Hot Precompiled Evaluation [Fast VM Mode]

| Scenario | Throughput | Latency | Median |
| :--- | :--- | :--- | :--- |
| Simple Arithmetic [VM] | **2.8M ops/s** | 356 ns | 290 ns |
| Polynomial 11 Variables [VM] | **297.0K ops/s** | 3 µs | 3 µs |
| XXL Monster Formula 26 Vars [VM] | **114.6K ops/s** | 9 µs | 7 µs |
| Deep Ternary Tree [VM] | **1.3M ops/s** | 783 ns | 668 ns |
| Boolean Logic XXL [VM] | **759.0K ops/s** | 1 µs | 1 µs |


## 4. Lexing & Parsing Throughput

| Scenario | Throughput | Latency | Median |
| :--- | :--- | :--- | :--- |
| Zero-Allocation Scanner (XXL Formula) | **76.1K ops/s** | 13 µs | 11 µs |
| Pratt Parser AST Generation (XXL Formula) | **49.0K ops/s** | 20 µs | 18 µs |
| Full Compilation Phase: compile(polyFormula) | **40.8K ops/s** | 24 µs | 20 µs |
| Validation Phase: isValidExpression(deepTernary) | **118.4K ops/s** | 8 µs | 7 µs |
