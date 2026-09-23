# API: `extractVariables`

Extracts all variable names referenced in a formula expression, excluding sub-formula variables (`f_*`).

## Signature

```typescript
function extractVariables(expression: string): string[]
```

## Parameters

- `expression: string` - The formula expression to analyze

## Returns

- `string[]` - Array of variable names referenced in the expression

## Throws

- `ScanError` - For unrecognized characters or unterminated strings
- `ParseError` - For invalid syntax

## Examples

```typescript
import { extractVariables } from 'smartcal';

// Simple variables
extractVariables('price + tax');
// -> ['price', 'tax']

// Excludes f_* variables
extractVariables('f_total + price');
// -> ['price']

// Nested expressions
extractVariables('(price * 2) + tax');
// -> ['price', 'tax']
```