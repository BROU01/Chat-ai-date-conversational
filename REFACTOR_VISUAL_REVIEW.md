
## CMS v2

La console admin v2 est maintenant structurée comme un CMS : navigation verticale par domaines, aperçu, compagnons, prompts système, conversations, utilisateurs, sécurité, paramètres et journal d’audit. La densité est supérieure au dashboard précédent mais reste organisée, avec une action et un contexte par vue.

Capture : `/home/ubuntu/screenshots/localhost_2026-08-19_11-52-57_7656.webp`

Le faux token local est refusé par l’API, donc les compteurs restent vides ; le shell CMS et ses états de données sont néanmoins vérifiés visuellement.

## Section Compagnons

La section Compagnons est accessible depuis le CMS et affiche maintenant un catalogue distinct, un formulaire de création avec nom, archétype et description, et un CTA d’enregistrement. En environnement local sans token Firebase réel, le catalogue indique indisponible au lieu d’inventer des données, tandis que le formulaire reste visible et prêt à utiliser.
