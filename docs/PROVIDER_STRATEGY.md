# Stratégie providers VIRELIA

## Chaîne actuelle

Le service IA essaie Groq lorsqu’une clé est configurée, puis OpenRouter, puis une réponse de fallback locale. Les erreurs sont journalisées et les retry restent limités. Hugging Face est réservé à une future couche de résumé et d’embeddings.

## Distinction obligatoire

Un échec réseau, un timeout ou une réponse 5xx ne signifie pas la même chose qu’un crédit provider épuisé. Le premier doit déclencher un retry court puis un fallback silencieux. Le second doit marquer le provider `credit_exhausted` pendant une durée limitée, alerter l’administration et continuer vers le provider suivant sans exposer l’incident à l’utilisateur.

## Registre dynamique à brancher

Le prompt prévoit une collection `provider_status` ou un cache équivalent contenant `provider`, `modelId`, `isFree`, `probeStatus`, `latencyMs`, `contextWindow`, `supportsStreaming`, `lastProbedAt` et `suitableFor`. Les modèles gratuits ne doivent pas être considérés disponibles simplement parce qu’ils figurent dans une liste statique : une sonde périodique doit confirmer leur état.

## État de livraison

La v2 enrichie centralise déjà les plans, transmet le type de personnalité et garde l’administration prête à exposer la chaîne des providers. Les health probes toutes les quinze minutes, le registre live, les alertes Slack/Discord et les scénarios E2E de crédit épuisé restent des travaux backend séparés, documentés ici au lieu d’être simulés.
