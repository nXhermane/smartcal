---
layout: home

hero:
  name: "SmartCal"
  text: "High-Performance Expression Engine"
  tagline: "Évaluez et compilez vos formules mathématiques & logiques à plus de 2.5 millions d'opérations par seconde en JavaScript et TypeScript."
  image:
    light: /smartcal-logo-light.svg
    dark: /smartcal-logo-dark.svg
    alt: SmartCal Logo
  actions:
    - theme: brand
      text: 🚀 Démarrage Rapide
      link: /guide/getting-started
    - theme: alt
      text: 📊 Voir les Benchmarks
      link: /internals/benchmarks
    - theme: alt
      text: 💻 GitHub
      link: https://github.com/nXhermane/SmartCal

features:
  - icon: ⚡
    title: Compilation JIT Native
    details: Transforme vos formules en fonctions natives JavaScript exécutées à la vitesse du CPU (~2.5M+ ops/s) sans surcoût d'interprétation.
  - icon: 🛡️
    title: Mode Fast VM Sécurisé (CSP-Safe)
    details: Interpréteur d'AST optimisé sans dynamic eval ni new Function, conçu pour les environnements avec Content Security Policy stricte.
  - icon: 🎯
    title: Pratt Parser O(N) & Precedence
    details: Analyseur syntaxique linéaire gérant sans faille les précédences d'opérateurs, les puissances et les arbres de décision ternaires profonds.
  - icon: 🌐
    title: Chaînes & Unicode Complet
    details: Support natif des chaînes de caractères avec espaces et des noms de variables internationaux (accents, arabe, CJK, etc.).
  - icon: 🔗
    title: Résolution DAG de Sous-Formules (f_*)
    details: Évalue les graphes de formules imbriquées en un seul passage topologique mémoïsé avec détection de cycles.
  - icon: 📦
    title: Zero Dépendance Externe
    details: Bibliothèque ultra légère (< 15 Ko minifiée), sans dépendances de production, avec support dual ESM & CommonJS.
---

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">~2.5M+</div>
    <div class="stat-label">Opérations / sec (Mode JIT)</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">&lt; 0.5 µs</div>
    <div class="stat-label">Latence Moyenne par Calcul</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">100%</div>
    <div class="stat-label">TypeScript Strict & CSP-Safe</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">0 dep</div>
    <div class="stat-label">Zéro Dépendance Externe</div>
  </div>
</div>

---

## ⚡ Exemple en 10 secondes

::: code-group
```typescript [Mode Précompilé JIT (Recommandé)]
import { compile } from 'smartcal';

// 1. Compile la formule une seule fois en bytecode natif
const calculateTax = compile(
  'income > 50000 ? (income - 50000) * 0.30 + 5000 : income * 0.10'
);

// 2. Évaluez instantanément sur des milliers d'enregistrements
console.log(calculateTax.evaluate({ income: 75000 })); // 12500
console.log(calculateTax.evaluate({ income: 30000 })); // 3000
```

```typescript [Évaluation Directe (SmartCal)]
import SmartCal from 'smartcal';

// Évaluation ponctuelle immédiate
const total = SmartCal('basePrice * (1 - discountRate) + shippingTax', {
  basePrice: 150,
  discountRate: 0.20,
  shippingTax: 12,
});

console.log(total); // 132
```

```typescript [Sous-Formules Imbriquées (f_*)]
import SmartCal, { compile } from 'smartcal';

const f_subtotal = compile('price * quantity * (1 - discount)');
const f_tax = compile('f_subtotal * 0.20');

// Résolution topologique automatique sans duplication de calculs
const grandTotal = SmartCal('f_subtotal + f_tax', {
  price: 100,
  quantity: 2,
  discount: 0.1,
  f_subtotal,
  f_tax,
});

console.log(grandTotal); // 216
```
:::
