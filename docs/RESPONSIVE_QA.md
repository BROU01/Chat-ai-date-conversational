# QA responsive VIRELIA

## Contrôle du 19 août 2026

Une capture de la landing en 390 × 844 montre un hero lisible sur mobile : le logo reste visible, les liens secondaires sont masqués comme prévu, les actions sont empilées sur toute la largeur et le texte garde un contraste exploitable sur le visuel Silver Surfer.

Une capture de `/chat` en 390 × 844 redirige vers l’écran de connexion lorsqu’aucune session Firebase n’est active. Cette redirection est attendue pour la route protégée. L’écran d’authentification reste lisible en une colonne, avec champs et onglets contenus dans la largeur mobile.

Les prochaines vérifications portent sur la console CMS mobile et sur les contrôles d’ouverture des navigations mobiles. Les captures sont générées localement avec Chromium headless ; la validation Firebase/IA nécessite des secrets de staging configurés séparément.

La capture de `/admin` en 390 × 844 redirige également vers la connexion sans session, ce qui confirme que la protection de la route s’applique avant le rendu CMS. Le contrôle visuel authentifié devra être réalisé avec un compte admin Firebase de staging.

La landing desktop en 1440 × 900 conserve la composition éditoriale : navigation lisible dans la barre translucide, typographie Fraunces dominante, actions hiérarchisées et Silver Surfer utilisé comme point focal sans gradient violet ni esthétique SaaS générique.
