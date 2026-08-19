const { db } = require('../config/firebase');
const firebaseService = require('../services/firebaseService');
const logger = require('../utils/logger');
const { z } = require('zod');

const adminController = {
  async getUsers(req, res, next) {
    try {
      const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
      const snapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(limit).get();
      res.json({ success: true, users: snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() })) });
    } catch (error) { next(error); }
  },

  async getAllMessages(req, res, next) {
    try {
      const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
      const snapshot = await db.collection('messages').orderBy('createdAt', 'desc').limit(limit).get();
      res.json({ success: true, messages: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
    } catch (error) { next(error); }
  },

  async getStats(req, res, next) {
    try {
      const [users, messages] = await Promise.all([db.collection('users').count().get(), db.collection('messages').count().get()]);
      const activeUsers = await db.collection('users').where('lastActivityDate', '>=', new Date(Date.now() - 86400000).toISOString()).count().get();
      res.json({ success: true, stats: { totalUsers: users.data().count, totalMessages: messages.data().count, totalConversations: messages.data().count, activeUsers: activeUsers.data().count, timestamp: new Date().toISOString() } });
    } catch (error) { next(error); }
  },

  async updateUserRole(req, res, next) {
    try {
      const { uid, role } = z.object({ uid: z.string().min(1), role: z.enum(['user', 'admin']) }).parse(req.body);
      await db.collection('users').doc(uid).update({ role });
      await firebaseService.logAdminAction(req.user.uid, 'UPDATE_USER_ROLE', { targetUid: uid, newRole: role });
      logger.info(`Admin ${req.user.uid} changed role of user ${uid} to ${role}`);
      res.json({ success: true, message: `Rôle mis à jour : ${role}` });
    } catch (error) { next(error); }
  },

  async getConfig(req, res, next) { try { res.json({ success: true, config: await firebaseService.getSystemConfig() }); } catch (error) { next(error); } },
  async updateConfig(req, res, next) { try { await firebaseService.updateSystemConfig(req.body); await firebaseService.logAdminAction(req.user.uid, 'UPDATE_CONFIG', req.body); res.json({ success: true, message: 'Configuration mise à jour.' }); } catch (error) { next(error); } },
  async getBlacklist(req, res, next) { try { const snapshot = await db.collection('ip_blacklist').get(); res.json({ success: true, blacklist: snapshot.docs.map((doc) => ({ ip: doc.id, ...doc.data() })) }); } catch (error) { next(error); } },
  async addBlacklist(req, res, next) { try { const { ip, reason } = z.object({ ip: z.string().min(1), reason: z.string().max(200).optional() }).parse(req.body); await firebaseService.blacklistIP(ip, reason || 'Non précisée'); await firebaseService.logAdminAction(req.user.uid, 'BLACKLIST_IP', { ip, reason }); res.json({ success: true, message: 'IP ajoutée à la liste de blocage.' }); } catch (error) { next(error); } },
  async getAuditLogs(req, res, next) { try { const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 100, 1), 200); const snapshot = await db.collection('admin_logs').orderBy('timestamp', 'desc').limit(limit).get(); res.json({ success: true, logs: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) }); } catch (error) { next(error); } }
};

module.exports = adminController;
