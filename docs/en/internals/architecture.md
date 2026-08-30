# Engine Architecture

SmartCal v1.1 is built on a complete 3-stage compilation pipeline: **Lexing $\rightarrow$ Parsing $\rightarrow$ Code Generation / Execution**.

```mermaid
flowchart TB
    subgraph Frontend ["1. Frontend"]
        Source["Expression Source String"]
        Scanner["Zero-Allocation Scanner\n(charCodeAt Cursor)"]
        Parser["Pratt Parser O(N)\n(Binding Power)"]
        AST["Abstract Syntax Tree (AST)"]

        Source --> Scanner
        Scanner -->|Token Stream| Parser
        Parser --> AST
    end

    subgraph Backend ["2. Backend & Optimization"]
        Strategy{"Execution Strategy\n(Auto / JIT / VM)"}
        JIT["JIT Compiler\n(JS Code Generation)"]
        VM["Fast VM\n(CSP-Safe AST Interpreter)"]
        V8["V8 / JS Engine\n(Native Machine Code)"]

        AST --> Strategy
        Strategy -->|JIT Mode| JIT
        Strategy -->|VM / CSP Mode| VM
        JIT --> V8
    end

    subgraph Execution ["3. Evaluation"]
        Resolver["FormulaResolver (f_* DAG)\n(Topological Sort & Cache)"]
        Data["Input Data (Variables)"]
        Result["Final Value (Number / String)"]

        Data --> Resolver
        Resolver --> V8
        Resolver --> VM
        V8 --> Result
        VM --> Result
    end
```

---

## The 4 Optimization Pillars

1. **Zero-Allocation Scanner**:
   The scanner never splits the string with `.split(" ")` or global regular expressions. It traverses the string via a direct memory cursor using `charCodeAt()`.

2. **Linear Pratt Parser**:
   Unlike the traditional Shunting-Yard algorithm which struggles with nested ternaries and right-associative powers, the Pratt Parser analyzes the expression in a single clean recursive pass guided by *Binding Power*.

3. **JIT Code Generation**:
   In compiled mode, the AST is translated into pure JavaScript code (e.g., `return ((data['a'] || 0) + (data['b'] || 0) * 2)`), then compiled into a native function via `new Function()`. The V8 JavaScript engine can then optimize it via its TurboFan compiler.

4. **Topological Sub-Formula Resolution**:
   Nested formulas (`f_*`) are resolved in a single topological order with caching, eliminating the exponential degradation observed in v1.0.14.
