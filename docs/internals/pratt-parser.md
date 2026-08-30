# Scanner & Pratt Parser

## 1. Scanner Zéro-Allocation

Le scanner de SmartCal lit le flux de caractères sans créer de tableaux d'objets intermédiaires. 

### Caractéristiques :
- Détection des opérateurs à 2 caractères (`<=`, `>=`, `==`, `!=`, `&&`, `||`) par simple comparaison de paires de `charCodeAt`.
- Prise en charge des chaînes avec espaces (`"Bonjour le monde"`).
- Prise en charge de la plage Unicode étendue (`U+0080` à `U+FFFF`) pour autoriser les identifiants internationaux.

---

## 2. Le Pratt Parser (Top-Down Operator Precedence)

Inventé par Vaughan Pratt en 1973, le Pratt Parser associe la précédence non pas aux règles de grammaire, mais aux **tokens eux-mêmes** via deux fonctions :

1. **NUD (*Null Denotation*)** : Ce que fait un token quand il apparaît au début d'une expression (ex: nombre littéral, identifiant, parenthèse ouvrante, signe unaire `-`).
2. **LED (*Left Denotation*)** : Ce que fait un token quand il apparaît entre deux expressions (ex: addition `+`, multiplication `*`, ternaire `?`).

### Binding Power (Force de liaison)

Chaque opérateur possède une force de liaison gauche et droite `(lbp, rbp)` :

| Opérateur | Binding Power (lbp, rbp) | Associativité |
| :--- | :--- | :--- |
| `+`, `-` | `(50, 51)` | Associatif à gauche (`lbp < rbp`) |
| `*`, `/`, `%` | `(60, 61)` | Associatif à gauche |
| `^` (Puissance) | `(71, 70)` | **Associatif à droite** (`lbp > rbp`) |
| `? :` (Ternaire) | `(20, 19)` | **Associatif à droite** |

```typescript
// Cœur de l'algorithme de parsing de Pratt
parseExpression(rbp = 0): ASTNode {
  let token = this.scanner.next();
  let left = this.nud(token);

  while (this.getLbp(this.scanner.peek()) > rbp) {
    token = this.scanner.next();
    left = this.led(token, left);
  }

  return left;
}
```
Ce mécanisme élégant garantit un temps de parsing strictement linéaire $O(N)$ sur la longueur de l'expression.
