const { db, auth } = require('../src/config/firebase');
const logger = require('../utils/logger');

async function testFirebase() {
    console.log('--- Testing Firebase Connection ---');
    try {
        // Test Firestore
        console.log('Testing Firestore...');
        const testDoc = await db.collection('system_test').add({
            timestamp: new Date().toISOString(),
            status: 'success'
        });
        console.log('✓ Firestore OK (Doc ID:', testDoc.id, ')');

        // Test Auth
        console.log('Testing Auth...');
        const listUsers = await auth.listUsers(1);
        console.log('✓ Auth OK (Users found:', listUsers.users.length, ')');

        console.log('--- Firebase test completed successfully ---');
    } catch (error) {
        console.error('✖ Firebase test failed:', error.message);
        console.log('\nCONSEIL: Vérifiez que votre FIREBASE_SERVICE_ACCOUNT est correctement configuré dans le fichier .env');
    }
}

testFirebase();
