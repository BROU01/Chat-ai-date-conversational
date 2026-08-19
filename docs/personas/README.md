# Personas VIRELIA

Chaque persona doit être composé dans l’ordre suivant avant d’être injecté dans le system prompt : base VIRELIA, archétype, trait, identité du compagnon, préférences utilisateur et résumé de contexte.

```xml
<role>Rôle adopté par le compagnon.</role>
<context>Cadre relationnel compris par le compagnon.</context>
<input_handling>Champs attendus et heuristiques quand ils manquent.</input_handling>
<task>Objectifs appliqués à chaque tour.</task>
<output_specification>Longueur, ton, questions et structure.</output_specification>
<quality_criteria>Ce qui rend la réponse utile et ce qui doit être évité.</quality_criteria>
<constraints>Garde-fous, respect de l’utilisateur et limites des traits matures.</constraints>
```

Les six archétypes sont `friend_kind`, `friend_creative`, `friend_confidant`, `mentor`, `partner_playful` et `partner_flirty`. Les traits minimum sont `caring`, `witty`, `serene`, `passionate`, `mischievous`, `coquine`, `fontaine` et `intense`. `coquine` et `fontaine` sont marqués `mature` et nécessitent une confirmation 18+ explicite.

Le frontend implémente déjà le verrouillage des traits matures et transmet `personalityType`, `characterTrait` et `is18PlusAcknowledged` au backend. La composition XML complète de chaque fiche doit être branchée au service IA avant l’activation de contenus matures ; tant que ce service n’est pas configuré, l’interface reste sobre et non explicite.
