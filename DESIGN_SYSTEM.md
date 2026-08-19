# Direction UI/UX — Emiliana v2

## Diagnostic

La première refonte a amélioré la sobriété mais reste trop proche d’un layout marketing générique. Le chat est trop étroit, la navigation est trop présente par rapport à la conversation, et l’administration ressemble à une page de statistiques plutôt qu’à un outil opérateur.

Les fichiers nommés par l’utilisateur (`emil`, `impeccable`, `taste`, `nothing_design`, `color expert main`, `awesome frontend`, `ui ux pro max`, `ui ux design pro`) ne sont pas présents dans l’environnement local. Les guides disponibles ont néanmoins été consultés : `SKILLpaleto.md` recommande une direction visuelle assumée, une typographie distinctive et une exécution cohérente ; `SKILLspago.md` déconseille explicitement les layouts centrés excessifs, les gradients violets, les rayons uniformes et Inter ; `temp_design/brief.md` confirme que le précédent design glassmorphism et les glows colorés doivent être abandonnés.

## Direction retenue

La nouvelle interface adopte une direction **editorial workspace** : un environnement de travail calme, dense et précis, plus proche d’un produit de conversation professionnel que d’une landing page premium. La conversation devient le centre visuel absolu. La sidebar est fonctionnelle mais secondaire, le contenu occupe davantage la largeur et les surfaces sont plates avec des séparateurs fins plutôt que des cartes flottantes répétées.

Le chat sera composé de trois zones : une barre latérale de navigation compacte, une colonne de conversations/préférences optionnelle et une zone de discussion large centrée sur une largeur de lecture confortable. Le composeur sera bas, fixe dans la zone de chat, plus grand et plus proche des standards ChatGPT/Claude, sans bouton audio, vidéo, upload ou drag-and-drop.

Le CMS admin sera organisé par sections : aperçu, utilisateurs, conversations, compagnons, contenu/prompt, paramètres, sécurité et journal d’audit. Une navigation secondaire et des vues tabulaires remplacent les simples KPI. Chaque vue doit avoir un titre, une phrase de contexte, une action primaire, des filtres et un état vide explicite.

## Règles de composition

| Axe | Décision |
|---|---|
| Typographie | Fraunces pour les titres éditoriaux courts ; IBM Plex Sans pour les données, contrôles et textes longs. Inter est retiré. |
| Couleur | Base graphite, ivoire et gris chaud ; un accent bleu pétrole réservé aux actions et états actifs ; orange doux uniquement pour les alertes. |
| Profondeur | Pas de glassmorphism ni de glow. Séparateurs, contrastes de surface et ombres très faibles. |
| Formes | Rayons différenciés : 6 px pour les contrôles, 10 px pour les panneaux, 14 px seulement pour le composeur et les éléments de conversation. |
| Densité | Chat large avec beaucoup de hauteur utile ; admin plus dense, mais structuré par sections et non par mosaïque de cartes. |
| Motion | Transitions courtes et discrètes, aucun effet décoratif qui détourne de la lecture. |
| Accessibilité | États de focus visibles, labels persistants, contraste renforcé, navigation clavier, `aria-live` pour les réponses. |
| Exclusions | Aucun audio, vidéo, drag-and-drop, upload, faux bouton social, gradient flashy, avatar décoratif ou métrique inventée. |

## Modèle CMS

Le CMS ne créera pas de données fictives. Il s’appuiera sur les collections et limites actuelles : `users`, `messages`, `companions`, `settings`, `ip_blacklist` et `admin_logs`. Les sections non encore exposées par l’API seront affichées comme surfaces prêtes à brancher, avec des états `bientôt disponible` explicites plutôt que des fonctionnalités simulées.
