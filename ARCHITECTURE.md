# Emiliana - Architecture & Déploiement Production

## 1. Architecture Générale

Le projet suit une architecture de type **Client-Serveur** robuste, orientée vers la production.

### Backend (Node.js)
- **Framework**: Express.js
- **Structure**: MVC (Model-View-Controller) modulaire.
  - `src/controllers`: Traitement des requêtes et logique applicative.
  - `src/routes`: Définition des endpoints REST.
  - `src/services`: Intégration des services tiers (IA, Firebase).
  - `src/middleware`: Sécurité, Authentification, Gestion des erreurs.
- **Sécurité**: Helmet (CSP, HSTS), CORS, Rate Limiting, Firebase Auth.
- **Logging**: Winston (logs tournants, différents niveaux).

### Infrastructure (Firebase)
- **Authentification**: Firebase Auth (Email/PWD, Google, Facebook, Apple).
- **Base de données**: Firestore (NoSQL temps réel, hautement scalable).
- **Stockage**: Firebase Storage (Avatars, fichiers multimédias).
- **Règles**: Règles de sécurité granulaires pour Firestore et Storage.

### IA (Intelligence Artificielle)
- **Moteurs**: Groq (Llama 3.1) & OpenRouter (GPT-4o Mini).
- **Résilience**: Stratégie de retry exponentiel et basculement automatique.

---

## 2. Guide de Déploiement Production

### Étape 1 : Préparation Firebase
1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/).
2. Activez **Authentication** (Email + Social Providers).
3. Activez **Firestore** en mode production.
4. Activez **Storage**.
5. Générez un **Compte de Service** (Paramètres du projet > Comptes de service > Générer une nouvelle clé privée).

### Étape 2 : Configuration Environnement
Créez un fichier `.env` sur votre serveur :
```env
PORT=3002
NODE_ENV=production
GROQ_API_KEY=votre_cle_groq
OPENROUTER_API_KEY=votre_cle_openrouter
FIREBASE_SERVICE_ACCOUNT='{"type": "service_account", ...}'
FIREBASE_DATABASE_URL=https://votre-projet.firebaseio.com
FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
SESSION_SECRET=un_secret_tres_long_et_aleatoire
DAILY_MESSAGE_LIMIT=200
```

### Étape 3 : Installation et Build
```bash
npm install --production
```

### Étape 4 : Monitoring (PM2 recommandé)
```bash
npm install pm2 -g
pm2 start server.js --name emiliana-api
pm2 monit
```

---

## 3. Checklist de Déploiement
- [ ] Les clés API IA sont valides et créditées.
- [ ] Le `FIREBASE_SERVICE_ACCOUNT` est correctement copié.
- [ ] Les CSP (Content Security Policy) autorisent les domaines Firebase et les APIs IA.
- [ ] Le rate limiting est configuré pour éviter les abus.
- [ ] Les règles Firestore (`firestore.rules`) sont déployées.
- [ ] Les règles Storage (`storage.rules`) sont déployées.
- [ ] Le logging Winston écrit correctement dans le dossier `/logs`.
- [ ] Le panel admin est protégé par un rôle `admin` dans Firestore.

---

## 4. Planification Intégrations Futures

### Google AI Studio (Gemini)
L'intégration de Gemini se fera dans `src/services/aiService.js` en ajoutant un nouveau fournisseur dans le tableau `providers`. 
**Impact**: Zéro modification de l'architecture existante.

### Extension Cloud Functions
Pour des tâches asynchrones lourdes (analyse d'image, rapports hebdomadaires), des Cloud Functions peuvent être ajoutées via le CLI Firebase sans impacter le serveur Express principal.
