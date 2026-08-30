# Compilateur JIT vs Fast VM

SmartCal propose une double stratégie d'exécution pour allier **performance maximale** et **compatibilité universelle**.

## 1. Compilateur JIT (Just-In-Time)

Le compilateur JIT traduit l'AST directement en code source JavaScript natif, puis instancie une fonction via `new Function`.

### Exemple de Transformation

Pour la formule :
```text
score > 100 ? (bonus * 1.5) : (bonus * 1.0)
```

Le JIT génère le code JavaScript suivant :
```javascript
function anonymous(d, r) {
  return ((d['score'] ?? 0) > 100 ? ((d['bonus'] ?? 0) * 1.5) : ((d['bonus'] ?? 0) * 1.0));
}
```

### Avantages :
- **Optimisation TurboFan/V8** : Le moteur JavaScript compile cette fonction en instructions machines natives avec inline caching.
- **Débit exceptionnel** : Plus de **2.5 à 10 millions d'opérations par seconde**.
- **Zéro surcoût d'interprétation** : Aucun parcours d'arbre pendant l'évaluation.

---

## 2. Interpréteur Fast VM (CSP-Safe)

Dans certains contextes stricts (Content Security Policy bloquant `unsafe-eval`, extensions de navigateur, Cloudflare Workers, environnements QuickJS), `new Function` est interdit.

SmartCal intègre donc un interpréteur Fast VM qui évalue l'AST sans jamais utiliser `eval` :

```typescript
// Exemple de boucle d'évaluation Fast VM
evaluateNode(node: ASTNode, data: Record<string, any>): number | string {
  switch (node.type) {
    case 'Literal': return node.value;
    case 'Identifier': return data[node.name] ?? 0;
    case 'Binary': {
      const left = this.evaluateNode(node.left, data);
      const right = this.evaluateNode(node.right, data);
      return this.applyOp(node.operator, left, right);
    }
    case 'Conditional': {
      const cond = this.evaluateNode(node.condition, data);
      return cond ? this.evaluateNode(node.consequent, data) : this.evaluateNode(node.alternate, data);
    }
  }
}
```

### Avantages :
- **100% Sécurisé (Zero-Eval)**.
- **Débit élevé** : Plus de **500 000 à 1 200 000 ops/s**, ce qui reste largement supérieur à la v1.0.14.

---

## Comparatif des Modes

| Critère | Mode JIT (`'jit'`) | Mode VM (`'vm'`) | Mode Auto (`'auto'`) |
| :--- | :--- | :--- | :--- |
| **Vitesse (Hot)** | ~2.5M - 10M ops/s | ~500k - 1.2M ops/s | JIT si dispo, sinon VM |
| **Sécurité CSP** | Nécessite `unsafe-eval` | **100% CSP-Safe** | S'adapte automatiquement |
| **Recommandé pour** | Serveurs, Node.js, Bun, Calculs intensifs | Extensions web, Cloudflare Workers | Usage universel standard |
