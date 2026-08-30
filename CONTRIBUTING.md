# Contributing to SmartCal

We welcome contributions! Here's how to get involved.

## Development Setup

```bash
git clone https://github.com/nXhermane/smartcal.git
cd smartcal
bun install
```

## Scripts

```bash
bun run dev            # Watch mode for building
bun run build          # Build library with tsup
bun run examples       # Run example file
bun run docs:dev       # VitePress dev server
bun run docs:build     # Build documentation
bun test               # Run tests
bun run test:coverage  # Run with coverage
bun run bench          # Run benchmarks
bun run lint           # Biome check
bun run lint:fix       # Biome fix
bun run check-types    # TypeScript check
```

## Project Structure

```
smartcal/
├── src/                  # Engine source code
│   ├── api/              # Public API (SmartCal, compile, isValidExpression)
│   ├── ast/              # AST node types
│   ├── compiler/         # JIT compiler + VM interpreter
│   ├── errors/           # Error types
│   ├── parser/           # Pratt parser
│   ├── registry/         # Function registry
│   ├── resolver/         # Formula resolver (f_* sub-formulas)
│   └── scanner/          # Zero-allocation scanner
├── test/                 # Vitest tests
├── bench/                # Benchmark suite
├── docs/                 # VitePress documentation (FR + EN)
└── scripts/              # Build scripts
```

## Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint:

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `perf:` | Performance improvement |
| `refactor:` | Code refactoring |
| `test:` | Adding tests |
| `BREAKING CHANGE:` | Major version bump |

Pre-commit hooks (via Husky) automatically run Biome and typecheck on staged files.

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Ensure tests pass (`bun test`)
5. Ensure lint passes (`bun run lint`)
6. Push and open a Pull Request

## Code Style

- Biome handles formatting (2 spaces, 100 char width)
- TypeScript strict mode enabled
- All public APIs must have JSDoc comments

## License

By contributing, you agree that your contributions will be licensed under the ISC License.
