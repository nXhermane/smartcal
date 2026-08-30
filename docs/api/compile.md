# API : `compile()`

Compile une expression une seule fois en un objet `CompiledExpression` pour des exécutions répétées à très haute vitesse.

## Signature

```typescript
function compile(
  expression: string,
  options?: CompileOptions
): CompiledExpression;
```

---

## Paramètres

### `expression` (`string`)
La formule mathématique/logique à compiler.

### `options` (`CompileOptions`, facultatif)
- `mode` (`'auto' | 'jit' | 'vm'`) : Mode d'exécution souhaité (par défaut `'auto'`).

---

## Interface `CompiledExpression`

L'objet retourné implémente l'interface suivante :

```typescript
interface CompiledExpression {
  readonly type: 'CompiledExpression';

  /**
   * Évalue la formule compilée contre un objet de données.
   * Amortit le coût d'analyse : ~2.5M+ ops/sec.
   */
  evaluate<T extends DataType>(data: T): string | number;

  /**
   * Retourne la formule source originale sous forme de texte.
   */
  toString(): string;
}
```

---

## Performance & Pourquoi compiler ?

Lorsque vous utilisez `SmartCal(expr, data)` dans une boucle de 100 000 éléments, le moteur doit découper en tokens et reconstruire l'AST 100 000 fois.

Avec `compile()` :
1. Le texte est scanné et parsé en AST **1 seule fois**.
2. L'AST est compilé en bytecode natif JS V8 **1 seule fois**.
3. Chaque appel à `.evaluate(data)` est un simple appel de fonction JavaScript direct.

```typescript
import { compile } from 'smartcal';

const taxFormula = compile('income * taxRate - taxCredit');

// Boucle sur des milliers de lignes : aucun surcoût de parsing
for (const employee of employees) {
  employee.tax = taxFormula.evaluate(employee);
}
```
