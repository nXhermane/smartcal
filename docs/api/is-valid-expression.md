# API : `isValidExpression()`

Valide la syntaxe d'une expression sans l'exécuter et **sans jamais lever d'exception**.

## Signature

```typescript
function isValidExpression(expression: string): boolean;
```

---

## Retours

- `true` : Si la formule est syntaxiquement correcte et peut être analysée par le Pratt Parser.
- `false` : Si la chaîne est vide, incomplète, ou contient des erreurs de grammaire.

---

## Exemples

```typescript
import { isValidExpression } from 'smartcal';

// Expressions valides
isValidExpression('10 + 20');                    // true
isValidExpression('age >= 18 ? "Majeur" : "Mineur"'); // true
isValidExpression('price * (1 - discount)');      // true

// Expressions invalides
isValidExpression('');                           // false
isValidExpression('10 +');                       // false
isValidExpression('(10 + 20');                   // false (parenthèse non fermée)
isValidExpression('10 + * 20');                   // false (double opérateur)
```
