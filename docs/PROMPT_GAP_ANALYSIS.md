# Analyse des écarts — Prompt VIRELIA v3

## Décisions de marque

Le prompt d’origine impose **VIRELIA** comme marque produit et **LIA** comme compagnon IA générique. Le dépôt utilise encore Emiliana comme marque et comme présence principale. La prochaine intégration doit donc distinguer le produit de la présence : VIRELIA dans le logo, les titres, les URL et le CMS ; LIA dans l’expérience de conversation par défaut.

## Fonctionnalités prioritaires à intégrer maintenant

| Exigence du prompt | État constaté | Action d’intégration |
|---|---|---|
| Six compagnons préétablis : Simon, Junior, Kevin, Ludmilla, Annabella, LIA | Quatre présences statiques : Emiliana, Milo, Sacha, Nina | Remplacer le catalogue frontend par six fiches réalistes et préparer le modèle CMS pour les éditer. |
| Personnalité choisie par l’utilisateur | Le chat envoie seulement quatre `botType` | Ajouter une sélection archétype + trait avant ou dans la sidebar chat, en gardant les traits matures masqués sans validation 18+. |
| Free : 150 messages sur fenêtre glissante de 24 h et 2 compagnons actifs | Limite actuelle par jour à 200, compteur basé sur `messagesToday` | Centraliser les plans dans une configuration unique et afficher `X / 150` dans le composeur. La fenêtre glissante complète nécessitera un historique d’usage horodaté. |
| Chat type ChatGPT/Claude | Nouveau workspace déjà intégré | Ajouter actions par message, recherche de conversations, dark mode et états de chargement sans audio, vidéo ni fichiers. |
| Streaming SSE | Réponse actuelle en JSON après génération complète | Préparer un endpoint SSE séparé et conserver le endpoint JSON comme fallback jusqu’à validation. |
| Failover crédit provider | Fallback présent mais logique de crédit non distinguée | Ajouter classification quota/provider, statut admin et journal `provider_credit_events`. |
| CMS admin 15 sections | CMS v2 couvre aperçu, utilisateurs, compagnons, prompts, conversations, sécurité, paramètres, audit | Ajouter des vues explicites et des états préparés pour RAG, providers, modération, quotas, alertes, intégrations et déploiement. Ne pas simuler des données réelles. |
| Personas XML | Aucun dossier persona livré | Ajouter les six archétypes prioritaires avec structure XML, exemples de répliques et contre-exemples. |
| Dark mode, taille de police, préférences | Non livré | Ajouter un thème clair/sombre persisté et un réglage de densité/typographie. |
| Compte, confidentialité, abonnement | Non livré | Ajouter les pages MPA et des états de compte clairs, sans câbler Stripe tant que le provider n’est pas configuré. |

## Fonctionnalités reportées mais à documenter

Le prompt demande notamment 2FA TOTP, RAG, webhooks, planificateur, modération toxicité, facturation, notifications multicanales, widget embeddable et intégrations Vercel. Elles ne doivent pas être maquillées en fonctionnalités actives sans backend et secrets configurés. Elles seront représentées dans le CMS comme sections avec statut explicite, puis livrées par lots avec routes, services et tests dédiés.

## Visuel hero

La landing recevra une image illustrative éditoriale, large et sans texte, représentant une présence humaine calme dans un environnement de conversation intime. La direction évitera les robots, orbites, nébuleuses, avatars fantasy, gradients violets et illustrations SaaS génériques. L’image sera traitée comme un asset de production avec `object-position`, texte de remplacement et fallback de couleur.

## Contrôle visuel du hero

Le hero photographique est intégré dans la landing avec une composition paysage, une zone de respiration pour le titre à gauche et un sujet humain placé à droite. La capture montre un rendu calme, éditorial et crédible ; il n’y a ni robot, ni glow, ni texte généré dans l’image, ni décor cosmique. La section suivante expose les six compagnons et le plan Gratuit sans surcharge visuelle.

Captures de contrôle : `/home/ubuntu/screenshots/localhost_2026-08-19_12-09-26_8554.webp` et `/home/ubuntu/screenshots/localhost_2026-08-19_12-09-36_9815.webp`.

## Contrôle chat enrichi

La recette locale confirme la présence des six compagnons Simon, Junior, Kevin, Ludmilla, Annabella et LIA. Le rail expose maintenant l’archétype, le trait, la case 18+ et le compteur `150 / 150`. Le dark mode bascule depuis le header, change réellement les tokens de surface et remplace le libellé par `Clair` pour revenir au thème clair.

Captures : `/home/ubuntu/screenshots/localhost_2026-08-19_12-25-23_4514.webp` et `/home/ubuntu/screenshots/localhost_2026-08-19_12-25-33_9595.webp`.
