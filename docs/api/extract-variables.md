# API : `extractVariables`

Extrait tous les noms de variables référencés dans une expression de formule, en excluant les variables sous-formule (`f_*`).

## Signature

```typescript
function extractVariables(expression: string): string[]
```

## Paramètres

- `expression: string` - L'expression de formule à analyser

## Retourne

- `string[]` - Tableau des noms de variables référencés dans l'expression

## Exceptions

- `ScanError` - Pour les caractères non reconnus ou les chaînes non terminées
- `ParseError` - Pour la syntaxe invalide

## Exemples

```typescript
import { extractVariables } from 'smartcal';

// Variables simples
extractVariables('price + tax');
// -> ['price', 'tax']

// Exclut les variables f_*
extractVariables('f_total + price');
// -> ['price']

// Expressions imbriquées
extractVariables('(price * 2) + tax');
// -> ['price', 'tax']
```