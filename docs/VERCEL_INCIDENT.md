# Incident Vercel — diagnostic initial

## Symptôme

La landing Vercel répond en HTTP et son HTML contient bien le contenu VIRELIA, mais le rendu visuel affiche essentiellement le fond et la navigation. Le hero et les sections restent invisibles.

## Hypothèse principale

Les éléments de contenu utilisent par défaut `opacity: 0` via `[data-reveal]` et ne deviennent visibles qu’après exécution de `assets/app.js`. La configuration Vercel actuelle ne déclare pas le dossier `assets` comme ressource statique. Si `/assets/app.js` n’est pas servi, l’IntersectionObserver ne s’exécute jamais et toute la landing reste masquée.

La même omission peut empêcher `/assets/virelia-silver-surfer.jpg`, `firebase-config.js` et d’autres ressources frontend d’être servis correctement. La correction doit inclure explicitement les assets statiques dans le routage/build Vercel, puis tester chaque URL de ressource avant publication.

## Après correctif

Le déploiement `ec7bea4` restaure le rendu visuel de la landing : `/` répond en 200, `/assets/app.js` et `/assets/virelia-silver-surfer.jpg` répondent en 200, et les pages `/about`, `/chat` et `/admin` répondent en 200. La console navigateur ne remonte plus d’erreur frontend et le hero est visible.

`/api/health` répond maintenant en 503 lorsque Firebase n’est pas configuré sur Vercel. C’est volontairement explicite et préférable à l’ancien 500 opaque : le site public fonctionne, tandis que les fonctions authentifiées signalent qu’elles attendent les variables Firebase serveur.
