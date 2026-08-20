# Accès à la console admin VIRELIA

L’URL de la console est `https://chat-ai-date-conversational.vercel.app/admin`. Cette route est volontairement protégée. Elle nécessite une session Firebase valide et un profil Firestore `users/{uid}` dont le champ `role` vaut exactement `admin`.

Le parcours normal est le suivant : ouvrir d’abord `/login`, se connecter avec le compte Firebase autorisé, puis ouvrir `/admin` dans le même navigateur. Après une connexion réussie, le frontend conserve la session dans `localStorage` afin que l’accès fonctionne aussi lorsqu’un lien est ouvert dans un nouvel onglet. Un compte dont le rôle est `user` est redirigé vers `/chat`, et un visiteur sans session est redirigé vers `/login`.

La page HTML admin est servie publiquement par Vercel, mais elle n’accorde aucun accès aux données. Toutes les routes `/api/admin/*` vérifient à nouveau le token Firebase et le rôle `admin` côté serveur. Il ne faut donc pas contourner cette protection en ajoutant un rôle dans le navigateur.

Le correctif récent masque la console pendant la vérification initiale afin d’éviter le flash d’une page admin avant redirection. Si la connexion Firebase échoue, vérifier d’abord les variables Firebase client et serveur, puis consulter la réponse de `/api/auth/login`.
