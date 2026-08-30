# API : `SmartCal()`

La fonction principale par défaut pour évaluer une expression immédiatement.

## Signature

```typescript
function SmartCal(
  expression: string,
  data?: DataType,
  options?: SmartCalOptions
): number | string;
```

---

## Paramètres

### `expression` (`string`)
La chaîne contenant la formule à évaluer. Ne doit pas être vide.

### `data` (`DataType`, facultatif)
Objet contenant les liaisons de variables. Les valeurs peuvent être des nombres, des chaînes de caractères ou des objets `CompiledExpression` (pour les sous-formules `f_*`).

```typescript
type DataType = Record<string, number | string | CompiledExpression>;
```

### `options` (`SmartCalOptions`, facultatif)
Options de configuration du moteur d'exécution :
- `mode` (`'auto' | 'jit' | 'vm'`) :
  - `'auto'` (défaut) : Utilise la compilation JIT si disponible, sinon bascule de manière transparente sur la Fast VM.
  - `'jit'` : Force la compilation en fonction native JavaScript via `new Function`.
  - `'vm'` : Force l'évaluation par l'interpréteur Fast VM linéaire (sécurisé CSP).

---

## Retours

Retourne le résultat de l'évaluation sous forme de `number` ou `string`.

---

## Exceptions levées

- `InvalidFormulaError` : Si l'expression fournie est vide ou ne contient que des espaces.
- `IncorrectSyntaxError` : Si la formule comporte une erreur de syntaxe ou un caractère non reconnu.
- `FormulaResolutionError` : Si une dépendance circulaire est détectée dans les sous-formules `f_*`.

---

## Exemples

```typescript
import SmartCal from 'smartcal';

// Calcul direct
const total = SmartCal('quantity * price * (1 - discount)', {
  quantity: 5,
  price: 20,
  discount: 0.1,
});
console.log(total); // 90

// En mode VM strict (sans eval)
const safeResult = SmartCal('10 + 20', {}, { mode: 'vm' });
```
