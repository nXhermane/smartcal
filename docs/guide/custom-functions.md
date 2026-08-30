# Fonctions Mathématiques & Extensibilité

SmartCal inclut un ensemble complet de fonctions mathématiques intégrées et fournit une API d'extension via `FunctionRegistry`.

## Fonctions Intégrées (Built-ins)

Les fonctions mathématiques standard suivantes sont disponibles par défaut dans toutes les expressions :

| Fonction | Description | Exemple |
| :--- | :--- | :--- |
| `abs(x)` | Valeur absolue | `abs(-15)` $\rightarrow$ `15` |
| `sqrt(x)` | Racine carrée | `sqrt(16)` $\rightarrow$ `4` |
| `round(x)` | Arrondi à l'entier le plus proche | `round(3.6)` $\rightarrow$ `4` |
| `floor(x)` | Arrondi à l'entier inférieur | `floor(3.9)` $\rightarrow$ `3` |
| `ceil(x)` | Arrondi à l'entier supérieur | `ceil(3.1)` $\rightarrow$ `4` |
| `min(a, b, ...)` | Minimum d'une liste de nombres | `min(10, 5, 20)` $\rightarrow$ `5` |
| `max(a, b, ...)` | Maximum d'une liste de nombres | `max(10, 5, 20)` $\rightarrow$ `20` |
| `sin(x)` | Sinus (en radians) | `sin(0)` $\rightarrow$ `0` |
| `cos(x)` | Cosinus (en radians) | `cos(0)` $\rightarrow$ `1` |
| `tan(x)` | Tangente (en radians) | `tan(0)` $\rightarrow$ `0` |
| `log(x)` | Logarithme népérien (base $e$) | `log(1)` $\rightarrow$ `0` |
| `exp(x)` | Exponentielle ($e^x$) | `exp(1)` $\rightarrow$ `2.718...` |

### Exemple dans une formule :

```typescript
import SmartCal from 'smartcal';

const hypotenuse = SmartCal('sqrt(a ^ 2 + b ^ 2)', { a: 3, b: 4 });
console.log(hypotenuse); // 5
```

---

## Enregistrement de Fonctions Personnalisées (`FunctionRegistry`)

Vous pouvez étendre SmartCal en enregistrant vos propres fonctions métier personnalisées :

```typescript
import { FunctionRegistry, compile } from 'smartcal';

// 1. Enregistrer une fonction personnalisée
FunctionRegistry.register('clamp', (val, min, max) => {
  return Math.min(Math.max(val, min), max);
});

// 2. Utiliser la fonction dans n'importe quelle expression
const clampSpeed = compile('clamp(speed, 0, 130)');

console.log(clampSpeed.evaluate({ speed: 150 })); // 130
console.log(clampSpeed.evaluate({ speed: -10 })); // 0
console.log(clampSpeed.evaluate({ speed: 90 }));  // 90
```

### Méthodes Utilitaires de `FunctionRegistry`

```typescript
// Vérifier si une fonction est disponible
FunctionRegistry.has('clamp'); // true

// Obtenir la fonction sous-jacente
const fn = FunctionRegistry.get('clamp');

// Supprimer une fonction personnalisée
FunctionRegistry.unregister('clamp');

// Réinitialiser toutes les fonctions personnalisées
FunctionRegistry.clearCustom();
```
