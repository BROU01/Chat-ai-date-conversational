# Incident Vercel — diagnostic initial

## Symptôme

La landing Vercel répond en HTTP et son HTML contient bien le contenu VIRELIA, mais le rendu visuel affiche essentiellement le fond et la navigation. Le hero et les sections restent invisibles.

## Hypothèse principale

Les éléments de contenu utilisent par défaut `opacity: 0` via `[data-reveal]` et ne deviennent visibles qu’après exécution de `assets/app.js`. La configuration Vercel actuelle ne déclare pas le dossier `assets` comme ressource statique. Si `/assets/app.js` n’est pas servi, l’IntersectionObserver ne s’exécute jamais et toute la landing reste masquée.

La même omission peut empêcher `/assets/virelia-silver-surfer.jpg`, `firebase-config.js` et d’autres ressources frontend d’être servis correctement. La correction doit inclure explicitement les assets statiques dans le routage/build Vercel, puis tester chaque URL de ressource avant publication.
