# Emiliana

Emiliana est une application de conversation avec des présences IA configurables. La refonte met l’accent sur une interface calme, lisible et accessible, ainsi que sur des contrats backend explicites et une persistance Firebase cohérente.

> Emiliana est un outil de conversation avec une IA. Il ne remplace ni une relation humaine, ni un professionnel de santé, ni un service d’urgence.

## Architecture

Le serveur est construit avec **Node.js et Express**. Il sert les pages HTML statiques, applique les en-têtes de sécurité via Helmet, limite les requêtes avec `express-rate-limit`, valide les entrées avec Zod et expose les routes `/api/auth`, `/api/chat` et `/api/admin`.

Le frontend reste volontairement léger : pages HTML accessibles, feuille de style partagée et contrôleur JavaScript commun dans `assets/app.js`. L’espace chat utilise une zone de lecture large, un rail de présences et un composeur texte unique ; aucune fonction audio, vidéo, upload ou glisser-déposer n’est incluse. L’authentification email et Google passe par Firebase Auth côté client, puis les tokens Firebase sont vérifiés par le backend avant d’autoriser l’accès à Firestore.

La console `/admin` est organisée comme un CMS métier : aperçu, utilisateurs, compagnons, prompts système, conversations, sécurité, paramètres et journal d’audit. Les opérations de rôles, de configuration, de blocage IP, de lecture des conversations et de création de compagnons passent par des routes admin protégées.

Firestore constitue la source de vérité pour les profils, les messages et les journaux d’administration. Le compteur quotidien de messages est mis à jour dans une transaction Firestore afin d’éviter les dépassements dus aux requêtes concurrentes.

## Installation locale

```bash
npm install
npm test
npm start
```

L’application est ensuite disponible sur `http://localhost:3002`.

## Variables d’environnement

Créer un fichier `.env` local ou renseigner les variables dans la plateforme de déploiement :

```env
NODE_ENV=production
PORT=3002
DAILY_MESSAGE_LIMIT=200
CORS_ORIGIN=https://votre-domaine.example
GROQ_API_KEY=votre_cle_groq
OPENROUTER_API_KEY=votre_cle_openrouter
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account", ...}'
FIREBASE_DATABASE_URL=https://votre-projet.firebaseio.com
FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
```

La configuration Firebase client est publique par nature, mais les clés de fournisseurs IA et le compte de service Firebase doivent rester exclusivement côté serveur et ne doivent jamais être commités.

## Routes principales

| Route | Usage |
|---|---|
| `/` ou `/landing` | Page d’accueil |
| `/login` | Connexion et inscription |
| `/chat` | Espace de conversation protégé côté client et API |
| `/about` | Positionnement et limites d’usage |
| `/admin` | CMS réservé aux administrateurs |
| `/api/health` | Contrôle de disponibilité |

## Contrôles de qualité

`npm test` exécute les smoke tests Node natifs. La suite vérifie la présence des écrans, le chargement Express et l’absence de l’ancien thème gradient. Avant livraison, il est recommandé d’exécuter également un test de bout en bout avec un projet Firebase de staging, un compte utilisateur non privilégié et un compte administrateur dédié.

## Déploiement

Le projet peut être déployé sur Vercel avec `server.js` comme fonction Node et les pages statiques comme assets. Les variables d’environnement doivent être déclarées dans l’environnement de production. Le domaine de production doit être ajouté aux domaines autorisés Firebase Auth et `CORS_ORIGIN` doit être limité aux origines réellement utilisées.

## Structure utile

```text
assets/app.js                  Contrôleur frontend partagé, chat et CMS
emiliana.css                  Système de design et responsive UI
DESIGN_SYSTEM.md              Direction UI/UX et règles de composition
src/app.js                    Initialisation Express et sécurité
src/controllers/               Contrôleurs HTTP
src/services/                  IA et persistance Firebase
src/middleware/                Authentification et gestion d’erreurs
tests/smoke.test.js            Smoke tests de livraison
```
