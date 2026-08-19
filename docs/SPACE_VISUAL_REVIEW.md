# Revue visuelle — direction Space

Le premier rendu desktop confirme que le hero plein écran fonctionne avec le visuel du Surfer d’argent, la navigation glass translucide, le monogramme orbital V et un texte blanc lisible sur la zone sombre gauche. La composition respecte une zone de copie sûre et la page conserve un appel à l’action clair.

Lors du premier scroll vers la section claire, la capture a été prise pendant la transition d’apparition des éléments : le contenu paraît temporairement atténué. Une vérification après stabilisation de l’IntersectionObserver est nécessaire avant livraison. Les animations doivent rester discrètes et respecter `prefers-reduced-motion`.

Le contrôle DOM a montré que la page inspectée utilisait encore les styles chargés avant la correction de contraste (`sectionColor` et `headingColor` restaient sur le token clair). Le thème sombre persistant est normal et partagé via `localStorage`; un rechargement complet est requis pour vérifier la nouvelle règle `.space-section-light { color: #10212d; }`.

Le panneau admin local confirme l’application de la palette Surfer d’argent : fond noir/bleu nuit, surfaces vitrées bleu graphite, accents cyan, bordures chrome et icônes encapsulées dans des glyphes cohérents. La sidebar reste dense mais lisible pour le CMS complet, et l’état `Token invalide ou expiré` reste visible sans maquiller l’absence de session réelle.

Capture CMS : `/home/ubuntu/screenshots/localhost_2026-08-19_15-01-41_4736.webp`.

Après rechargement, le hero reste conforme : image pleine fenêtre, copie blanche à gauche, navigation glass et CTA lisibles. La capture annotée du scroll assombrit visuellement les zones non interactives ; le contrôle DOM suivant servira de référence pour les couleurs calculées plutôt que l’overlay de capture.

Capture hero finale : `/home/ubuntu/screenshots/localhost_2026-08-19_15-02-43_1522.webp`.

## Revue corrective

Le contrôle DOM confirme que les animations sont effectivement actives : avant défilement, 1 élément reveal sur 14 est visible et l’image hero est à `matrix(..., translateY=0)`. Après un défilement de 1155 px, 6 éléments reveal sont visibles et la matrice de l’image devient `matrix(1.08, 0, 0, 1.08, 0, 138.6)`, ce qui confirme la parallaxe.

Le header expose bien des éléments HTML sémantiques : les sections sont des liens `href="#approche"`, `href="#compagnons"`, `/about`, le bouton de connexion est un lien `/login` et l’action principale est un lien `/login?mode=register`. Le problème est donc principalement visuel : les liens et l’action de connexion doivent recevoir des affordances plus fortes pour ne pas se confondre avec le texte du verre.

Le correctif de navigation est visible dans le DOM et les styles calculés : les trois liens de section disposent d’un padding, d’un état de fond/bordure au survol et d’un soulignement cyan progressif ; `Se connecter` est désormais un bouton glass avec fond translucide, bordure et hauteur de contrôle de 34 px. Le libellé du hero est devenu `VIRELIA · conversation IA personnalisable`, ce qui sépare clairement la marque du positionnement.
