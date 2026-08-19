const { db } = require('../config/firebase');
const logger = require('../utils/logger');

const firebaseService = {
    // Users
    async createUser(userData) {
        try {
            const userRef = db.collection('users').doc(userData.uid);
            await userRef.set({
                ...userData,
                createdAt: new Date().toISOString(),
                messagesToday: 0,
                lastActivityDate: new Date().toISOString()
            });
            return { id: userData.uid, ...userData };
        } catch (error) {
            logger.error('Error creating user in Firestore:', error);
            throw error;
        }
    },

    async getUserById(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            return userDoc.exists ? userDoc.data() : null;
        } catch (error) {
            logger.error('Error getting user from Firestore:', error);
            throw error;
        }
    },

    async getUserByEmail(email) {
        try {
            const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
            if (snapshot.empty) return null;
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        } catch (error) {
            logger.error('Error getting user by email from Firestore:', error);
            throw error;
        }
    },

    async updateUserActivity(uid) {
        try {
            const today = new Date().toISOString().split('T')[0];
            await db.collection('users').doc(uid).update({
                lastActivityDate: new Date().toISOString(),
                lastMessageDate: today
            });
        } catch (error) {
            logger.error('Error updating user activity in Firestore:', error);
            throw error;
        }
    },

    async incrementMessageCount(uid) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const userRef = db.collection('users').doc(uid);
            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) throw new Error(`User ${uid} not found`);
                const data = userDoc.data();
                const nextCount = data.lastMessageDate === today ? (data.messagesToday || 0) + 1 : 1;
                transaction.update(userRef, { messagesToday: nextCount, lastMessageDate: today, lastActivityDate: new Date().toISOString() });
            });
        } catch (error) {
            logger.error('Error incrementing message count in Firestore:', error);
            throw error;
        }
    },

    // Messages
    async saveMessage(messageData) {
        try {
            const messageRef = await db.collection('messages').add({
                ...messageData,
                createdAt: new Date().toISOString()
            });
            return { id: messageRef.id, ...messageData };
        } catch (error) {
            logger.error('Error saving message in Firestore:', error);
            throw error;
        }
    },

    async getUserMessages(userId, limit = 50) {
        try {
            const snapshot = await db.collection('messages')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            logger.error('Error getting user messages from Firestore:', error);
            throw error;
        }
    },

    // Companions
    async saveCompanion(companionData) {
        try {
            const companionRef = await db.collection('companions').add({
                ...companionData,
                createdAt: new Date().toISOString()
            });
            return { id: companionRef.id, ...companionData };
        } catch (error) {
            logger.error('Error saving companion in Firestore:', error);
            throw error;
        }
    },

    async getUserCompanions(userId) {
        try {
            const snapshot = await db.collection('companions').where('userId', '==', userId).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            logger.error('Error getting user companions from Firestore:', error);
            throw error;
        }
    },

    // --- NEW ADMIN FEATURES ---

    // System Config
    async getSystemConfig() {
        try {
            const doc = await db.collection('settings').doc('system_config').get();
            return doc.exists ? doc.data() : {
                botIdentity: {
                    name: 'Emiliana',
                    description: 'Une présence attentive pour prendre le temps de réfléchir.',
                    language: 'fr',
                    systemPrompt: ''
                },
                quotas: {
                    dailyLimit: 200,
                    monthlyBudget: 50
                },
                ui: {
                    primaryColor: '#2b665a',
                    surfaceColor: '#f5f5f2',
                    position: 'workspace'
                }
            };
        } catch (error) {
            logger.error('Error getting system config:', error);
            return null;
        }
    },

    async updateSystemConfig(config) {
        try {
            await db.collection('settings').doc('system_config').set(config, { merge: true });
            return true;
        } catch (error) {
            logger.error('Error updating system config:', error);
            throw error;
        }
    },

    // Audit Logs
    async logAdminAction(adminId, action, details) {
        try {
            await db.collection('admin_logs').add({
                adminId,
                action,
                details,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Error logging admin action:', error);
        }
    },

    // Blacklist
    async blacklistIP(ip, reason) {
        try {
            await db.collection('ip_blacklist').doc(ip).set({
                reason,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Error blacklisting IP:', error);
            throw error;
        }
    },

    async isIPBlacklisted(ip) {
        try {
            const doc = await db.collection('ip_blacklist').doc(ip).get();
            return doc.exists;
        } catch (error) {
            return false;
        }
    }
};

module.exports = firebaseService;
