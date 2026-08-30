# Syntaxe & Opérateurs

SmartCal intègre une grammaire riche et expressive, gérée avec précision par son analyseur syntaxique de Pratt.

## Table des Opérateurs & Précédence

Les opérateurs sont classés ci-dessous par ordre de priorité décroissante (du plus prioritaire au moins prioritaire) :

| Catégorie | Opérateur | Description | Associativité | Exemple |
| :--- | :--- | :--- | :--- | :--- |
| **Parenthèses** | `( )` | Groupement prioritaire | - | `(2 + 3) * 4` |
| **Unaire** | `+`, `-` | Positif / Négation unaire | Droite | `-x`, `-(a + b)` |
| **Exponentiation** | `^` | Puissance | **Droite** | `2 ^ 3 ^ 2` (= $2^9 = 512$) |
| **Multiplicatifs** | `*`, `/`, `%` | Multiplication, Division, Modulo | Gauche | `10 % 3 * 2` |
| **Additifs** | `+`, `-` | Addition, Soustraction | Gauche | `10 + 5 - 2` |
| **Comparaisons** | `<`, `<=`, `>`, `>=` | Comparaisons d'ordre | Gauche | `age >= 18` |
| **Égalités** | `==`, `!=` | Égalité / Inégalité stricte | Gauche | `status == 'active'` |
| **ET Logique** | `&&` | Conjonction logique (court-circuit) | Gauche | `a > 0 && b > 0` |
| **OU Logique** | `\|\|` | Disjonction logique (court-circuit) | Gauche | `isAdmin \|\| isOwner` |
| **Conditionnel** | `? :` | Opérateur ternaire | **Droite** | `score > 50 ? 1 : 0` |

---

## Types de Données Pris en Charge

### Nombres
SmartCal accepte les entiers et les nombres à virgule flottante :
```typescript
SmartCal('3.14159 * radius ^ 2', { radius: 5 });
```

### Chaînes de Caractères
Les littéraux chaînes peuvent être délimités par des guillemets simples `'...'` ou doubles `"...""` et peuvent contenir des espaces :
```typescript
SmartCal("user == 'John Doe' ? 'VIP' : 'Standard'", { user: 'John Doe' }); // 'VIP'
```

### Identifiants & Unicode
Les noms de variables peuvent contenir des lettres latines, chiffres, underscores `_` ainsi que tous les caractères Unicode internationaux :
```typescript
SmartCal('café_prix + quantité_achetée', {
  café_prix: 2.5,
  quantité_achetée: 4,
}); // 6.5
```

---

## Opérateurs Ternaires Imbriqués

Grâce à l'associativité à droite du Pratt Parser, les arbres de décision imbriqués s'écrivent de manière claire sans ambiguïté :

```typescript
const taxBracket = compile(
  'income < 10000 ? 0 : (income < 40000 ? 0.15 : (income < 100000 ? 0.30 : 0.45))'
);

taxBracket.evaluate({ income: 55000 }); // 0.3
```
