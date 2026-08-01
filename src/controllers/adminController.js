const { db } = require('../config/firebase');
const logger = require('../utils/logger');

const adminController = {
    /**
     * Récupère la liste des utilisateurs avec pagination
     */
    async getUsers(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const snapshot = await db.collection('users')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            res.json({ success: true, users });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Récupère les logs d'activité récents (messages globaux)
     */
    async getAllMessages(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const snapshot = await db.collection('messages')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.json({ success: true, messages });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Statistiques globales en temps réel
     */
    async getStats(req, res, next) {
        try {
            // Utilisation des agrégations Firestore (plus performant que de compter manuellement)
            const usersCount = (await db.collection('users').count().get()).data().count;
            const messagesCount = (await db.collection('messages').count().get()).data().count;
            
            // Calcul des utilisateurs actifs aujourd'hui
            const today = new Date().toISOString().split('T')[0];
            const activeToday = (await db.collection('users')
                .where('lastMessageDate', '==', today)
                .count()
                .get()).data().count;

            res.json({
                success: true,
                stats: {
                    totalUsers: usersCount,
                    totalMessages: messagesCount,
                    activeToday: activeToday,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Met à jour le rôle d'un utilisateur
     */
    async updateUserRole(req, res, next) {
        try {
            const { uid, role } = req.body;
            if (!uid || !['user', 'admin'].includes(role)) {
                return res.status(400).json({ success: false, message: 'Données invalides' });
            }

            await db.collection('users').doc(uid).update({ role });
            await firebaseService.logAdminAction(req.user.uid, 'UPDATE_USER_ROLE', { targetUid: uid, newRole: role });
            logger.info(`Admin ${req.user.uid} changed role of user ${uid} to ${role}`);
            
            res.json({ success: true, message: `Rôle mis à jour : ${role}` });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Configuration système
     */
    async getConfig(req, res, next) {
        try {
            const config = await firebaseService.getSystemConfig();
            res.json({ success: true, config });
        } catch (error) {
            next(error);
        }
    },

    async updateConfig(req, res, next) {
        try {
            const config = req.body;
            await firebaseService.updateSystemConfig(config);
            await firebaseService.logAdminAction(req.user.uid, 'UPDATE_CONFIG', config);
            res.json({ success: true, message: 'Configuration mise à jour' });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Gestion de la Blacklist IP
     */
    async getBlacklist(req, res, next) {
        try {
            const snapshot = await db.collection('ip_blacklist').get();
            const blacklist = snapshot.docs.map(doc => ({ ip: doc.id, ...doc.data() }));
            res.json({ success: true, blacklist });
        } catch (error) {
            next(error);
        }
    },

    async addBlacklist(req, res, next) {
        try {
            const { ip, reason } = req.body;
            await firebaseService.blacklistIP(ip, reason);
            await firebaseService.logAdminAction(req.user.uid, 'BLACKLIST_IP', { ip, reason });
            res.json({ success: true, message: 'IP ajoutée à la blacklist' });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Journaux d'audit
     */
    async getAuditLogs(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const snapshot = await db.collection('admin_logs')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.json({ success: true, logs });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = adminController;
