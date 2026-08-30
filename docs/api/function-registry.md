# API : `FunctionRegistry`

Registre global de fonctions pour étendre les capacités de calcul de SmartCal avec vos propres fonctions métiers.

## Méthodes Statiques

### `register(name: string, fn: MathFn): void`
Enregistre ou remplace une fonction personnalisée disponible dans les expressions.

```typescript
import { FunctionRegistry, compile } from 'smartcal';

FunctionRegistry.register('hypot', (a, b) => Math.sqrt(a ** 2 + b ** 2));

const expr = compile('hypot(x, y)');
console.log(expr.evaluate({ x: 3, y: 4 })); // 5
```

---

### `get(name: string): MathFn | undefined`
Récupère la fonction associée à un nom (recherche d'abord dans les fonctions personnalisées, puis dans les fonctions intégrées).

```typescript
const sqrtFn = FunctionRegistry.get('sqrt');
```

---

### `has(name: string): boolean`
Indique si une fonction (intégrée ou personnalisée) existe.

```typescript
FunctionRegistry.has('cos'); // true
FunctionRegistry.has('unknown'); // false
```

---

### `unregister(name: string): boolean`
Supprime une fonction personnalisée préalablement enregistrée.

```typescript
FunctionRegistry.unregister('hypot');
```

---

### `listAll(): string[]`
Renvoie la liste complète de tous les noms de fonctions utilisables.
