# Adaptation du panneau admin de référence vers VIRELIA

## Décision de conception

Le panneau fourni apporte un **shell de back-office solide** : sidebar persistante, regroupement par domaines, barre supérieure, en-tête de page, cartes de contenu, tableaux denses, filtres, actions principales et dialogues d’édition. Ces patterns sont pertinents pour VIRELIA. En revanche, ses objets métier sont ceux d’une boutique : commandes, produits, collections, réductions, médias et pages éditoriales. Ils ne doivent pas être copiés tels quels dans un chatbot qui ne dispose ni de catalogue commercial ni de fausse persistance locale.

VIRELIA reprend donc la grammaire d’administration de référence, mais remplace le commerce par une **console de gouvernance conversationnelle** : santé du service, présences, prompts, conversations, utilisateurs, modération, fournisseurs IA, quotas, configuration et audit.

## Matrice d’adaptation

| Pattern du panneau fourni | Adaptation VIRELIA | Contrat actuel |
|---|---|---|
| Tableau de bord et KPI | Aperçu de la santé du produit, utilisateurs, messages, conversations et activité 24 h | `GET /api/admin/stats`, `GET /api/admin/users` |
| Clients | Utilisateurs, rôles, activité et quota du jour | `GET /api/admin/users`, `PATCH /api/admin/users/role` |
| Produits | Compagnons / présences IA, statut, archétype, description et prompt | `GET/POST/PATCH/DELETE /api/admin/companions` |
| Personnalisation | Identité VIRELIA, LIA, tonalité, prompt global et aperçu du chatbot | `GET/POST /api/admin/config` |
| Pages / Navigation | Non importé comme CMS e-commerce ; remplacé par les domaines conversationnels et les accès rapides | Aucun endpoint page/menu nécessaire |
| Médias | Non activé dans cette itération : pas d’upload sans stockage et règles de sécurité explicites | Aucun endpoint média disponible |
| Réductions / commandes / collections | Convertis en quotas, facturation, limites Free/Premium et indicateurs d’usage | Configuration produit actuelle, provider billing non activé |
| Réglages / sauvegarde | Paramètres produit, fournisseurs, déploiement, CORS et état Firebase | `GET/POST /api/admin/config`, documentation Vercel |
| Journal et actions | Journal d’audit avec horodatage, action et administrateur | `GET /api/admin/audit` |

## Philosophie VIRELIA

Le CMS doit administrer une **présence conversationnelle**, pas optimiser un tunnel de vente. Chaque écran doit expliciter ce qui est réel, ce qui est en lecture seule et ce qui doit encore être configuré. Les modules non reliés à un contrat backend affichent un état à configurer plutôt qu’un faux chiffre ou une action simulée.

La direction visuelle conserve la palette spatiale VIRELIA : fond nuit, surfaces bleu-noir, texte argenté, accent cyan discret et jaune orbital réservé aux avertissements. La structure plus dense du panneau fourni est retenue pour améliorer l’efficacité opérationnelle, mais sans importer Inter, gradients violets, glassmorphism décoratif ou cartes uniformes sans hiérarchie.

## Fonctionnalités à intégrer

La nouvelle structure doit fournir une navigation persistante regroupée en **Pilotage**, **Contenu conversationnel**, **Accès & confiance**, **Opérations IA** et **Système**. L’aperçu doit exposer des KPI réels et des panneaux de contrôle rapides. Les compagnons doivent être présentés comme un catalogue de présences avec création, activation et édition. Les utilisateurs doivent conserver le filtrage et la modification de rôle déjà existants. Les prompts doivent rester soumis à une sauvegarde explicite, les conversations et l’audit en lecture seule, et les sections fournisseurs, facturation, connaissances, automatisations, widget et déploiements doivent communiquer honnêtement leur niveau de configuration.

Les actions dangereuses, notamment changement de rôle, blocage IP et modification de configuration globale, doivent rester explicites, traçables et protégées côté serveur. Le panneau ne doit jamais suggérer que le frontend seul constitue une barrière d’accès.

## Contrôle d’accès

Le contrôle navigateur local confirme que `/admin` redirige vers `/login` sans session. Une tentative de simulation via `sessionStorage` a été bloquée par la politique de sécurité du contexte navigateur ; aucun compte réel ni secret n’a été utilisé. Les tests de structure, de syntaxe et de contrats restent exécutables localement sans contourner la protection d’accès.
