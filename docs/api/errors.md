# Gestion des Erreurs

SmartCal fournit une hiérarchie d'erreurs claire et typée, enrichie d'informations de diagnostic pour faciliter le débogage.

## Hiérarchie des Erreurs Modernes

### `ScanError`
Levée par le `Scanner` lorsqu'un caractère inconnu ou une chaîne de caractères non fermée est rencontrée. Contient l'indice de position exacte dans la chaîne source.

```typescript
import { Scanner, ScanError } from 'smartcal';

try {
  new Scanner('price @ 2').scanTokens();
} catch (err) {
  if (err instanceof ScanError) {
    console.log(err.message);
    // Unexpected character "@" (U+0040)
    // price @ 2
    //       ^
    console.log(err.pos); // 6
  }
}
```

---

### `ParseError`
Levée par le `Parser` lorsque la suite de tokens ne respecte pas la grammaire attendue.

```typescript
import { parse, ParseError } from 'smartcal';

try {
  parse('10 + * 20');
} catch (err) {
  if (err instanceof ParseError) {
    console.log(err.token); // Token(Star, '*', pos=5)
  }
}
```

---

### `FormulaResolutionError`
Levée par le `FormulaResolver` lorsqu'un cycle de dépendances est détecté dans les sous-formules `f_*`.

```typescript
import { FormulaResolutionError } from 'smartcal';

// err.cycle contient le chemin du cycle : ["f_a", "f_b", "f_a"]
```

---

### `JITError` & `VMError`
- `JITError` : Levée si la compilation en fonction native échoue ou est bloquée par la Content Security Policy de la page.
- `VMError` : Levée si la machine virtuelle rencontre une opération indéfinie ou une fonction inexistante.

---

## Classes d'Erreurs Rétrocompatibles (Legacy)

Pour garantir 100% de rétrocompatibilité avec les versions antérieures (v1.0.x), les classes d'erreurs historiques restent exportées :
- `IncorrectSyntaxError` : Déclenchée par `SmartCal(invalidExp)` pour intercepter les erreurs de syntaxe.
- `InvalidFormulaError` : Déclenchée lors d'une formule vide.
- `FormulaInterpreterError`
- `FormulaVariableNotFoundError`
