# Emiliana - Premium AI Companion Platform (Production Ready)

Ce projet a été restructuré pour atteindre un niveau de production, avec une architecture robuste, une sécurité renforcée et une intégration Firebase complète.

## Architecture
- **Backend**: Node.js avec Express, structuré en couches (Controllers, Routes, Services, Middlewares).
- **Frontend**: HTML/CSS/JS statique, optimisé pour la performance et le design (inspiré par les standards UI/UX Pro).
- **Base de données**: Google Firebase Firestore pour la persistance des données (Utilisateurs, Messages, Compagnons).
- **Authentification**: Firebase Auth (supportant Email/Mot de passe et Social Auth).
- **IA**: Intégration multi-fournisseurs (Groq, OpenRouter) avec logique de fallback et retry exponentiel.
- **Logging**: Winston pour un logging détaillé en production.
- **Validation**: Zod pour la validation des données entrantes.

## Installation

1. Clonez le dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Configurez les variables d'environnement dans un fichier `.env` :
   ```env
   PORT=3002
   GROQ_API_KEY=votre_cle_groq
   OPENROUTER_API_KEY=votre_cle_openrouter
   FIREBASE_SERVICE_ACCOUNT='{...}' # JSON du compte de service Firebase
   FIREBASE_DATABASE_URL=https://votre-projet.firebaseio.com
   SESSION_SECRET=votre_secret_session
   DAILY_MESSAGE_LIMIT=200
   ```
4. Configurez le frontend dans `firebase-config.js` avec vos identifiants Firebase client.

## Démarrage

### Mode Développement
```bash
npm run dev
```

### Mode Production
```bash
npm start
```

## Structure du Projet
- `src/config/`: Configuration (Firebase, etc.)
- `src/controllers/`: Logique de traitement des requêtes
- `src/routes/`: Définition des points d'entrée API
- `src/services/`: Services métier (IA, Firebase)
- `src/middleware/`: Middlewares (Auth, Erreurs)
- `src/utils/`: Utilitaires (Logger)
- `tests/`: Suite de tests

## Fonctionnalités Clés
- **Prompting Avancé**: Système de prompt dynamique basé sur l'archétype du compagnon.
- **Social Auth**: Correction des problèmes d'API via Firebase Auth.
- **Panel Admin**: Monitoring en temps réel, gestion des utilisateurs et logs.
- **Robustesse**: Gestion des erreurs centralisée et validation stricte.

## Planification Future
- Intégration de Google AI Studio.
- Dashboard de statistiques avancées avec graphiques.
- Support pour le stockage de fichiers via Firebase Storage.
