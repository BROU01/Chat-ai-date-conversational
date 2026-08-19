const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let firebaseApp = null;
let firebaseConfigError = null;

function buildCredentialFromEnv() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    }

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        return admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        });
    }

    return null;
}

try {
    if (admin.apps.length) {
        firebaseApp = admin.app();
    } else {
        const credential = buildCredentialFromEnv();
        if (credential) {
            firebaseApp = admin.initializeApp({
                credential,
                databaseURL: process.env.FIREBASE_DATABASE_URL,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
        } else if (process.env.NODE_ENV !== 'production') {
            firebaseApp = admin.initializeApp();
        } else {
            firebaseConfigError = new Error('Firebase server credentials are not configured.');
            console.warn(`[firebase] ${firebaseConfigError.message}`);
        }
    }

    if (firebaseApp) console.log('✓ Firebase Admin initialisé avec succès');
} catch (error) {
    firebaseConfigError = error;
    console.error('Erreur initialisation Firebase Admin:', error.message);
}

const isFirebaseConfigured = Boolean(firebaseApp);
const db = isFirebaseConfigured ? admin.firestore() : null;
const auth = isFirebaseConfigured ? admin.auth() : null;
const storage = isFirebaseConfigured ? admin.storage() : null;

module.exports = { admin, db, auth, storage, isFirebaseConfigured, firebaseConfigError };
