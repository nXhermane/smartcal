# Prise en main rapide

## Installation

Installez SmartCal via votre gestionnaire de paquets favori :

::: code-group
```bash [bun]
bun add smartcal
```

```bash [pnpm]
pnpm add smartcal
```

```bash [npm]
npm install smartcal
```

```bash [yarn]
yarn add smartcal
```
:::

---

## Importation

SmartCal fournit un support universel (ESM et CommonJS) avec des déclarations TypeScript complètes intégrées :

::: code-group
```typescript [ESM / TypeScript]
import SmartCal, { compile, isValidExpression } from 'smartcal';
```

```javascript [CommonJS]
const { default: SmartCal, compile, isValidExpression } = require('smartcal');
```
:::

---

## Les 3 Modes d'Utilisation

### 1. Évaluation Directe (`SmartCal`)
Idéal pour un calcul ponctuel où l'expression n'est évaluée qu'une seule fois.

```typescript
import SmartCal from 'smartcal';

// Expression arithmétique simple
const total = SmartCal('10 + 20 * 2'); // 50

// Expression avec variables
const score = SmartCal('basePoints + bonus * multiplier', {
  basePoints: 100,
  bonus: 25,
  multiplier: 2,
}); // 150
```

---

### 2. Évaluation Précompilée Haute Performance (`compile`)
Lorsque la même formule doit être réévaluée des milliers ou des millions de fois (ex: boucles de données, tableaux financiers, graphiques, serveurs), utilisez `compile()` :

```typescript
import { compile } from 'smartcal';

// Compilation unique (Parse l'AST une seule fois + compile en fonction native JIT)
const formula = compile('price * (1 - discount) + shipping');

// Exécutions ultra-rapides (~2.5M+ ops/s)
const order1 = formula.evaluate({ price: 100, discount: 0.1, shipping: 5 }); // 95
const order2 = formula.evaluate({ price: 200, discount: 0.2, shipping: 0 }); // 160
```

---

### 3. Validation de Formule sans Erreur (`isValidExpression`)
Idéal pour vérifier la validité de la syntaxe saisie par un utilisateur dans un formulaire (sans lancer d'exception).

```typescript
import { isValidExpression } from 'smartcal';

console.log(isValidExpression('price * (1 - discount)')); // true
console.log(isValidExpression('price * '));               // false
```
