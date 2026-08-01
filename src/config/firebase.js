const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let firebaseApp;

try {
    if (!admin.apps.length) {
        // En production, Firebase utilise les variables d'environnement par défaut si on est sur GCP/Firebase
        // Sinon, on peut passer un serviceAccountKey.json ou des variables d'env individuelles
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : null;

        if (serviceAccount) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
        } else {
            // Fallback pour le développement local ou si configuré via ADC
            firebaseApp = admin.initializeApp();
        }
        console.log('✓ Firebase Admin initialisé avec succès');
    } else {
        firebaseApp = admin.app();
    }
} catch (error) {
    console.error('Erreur initialisation Firebase Admin:', error.message);
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, db, auth, storage };
