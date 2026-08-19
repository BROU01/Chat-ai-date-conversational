const { auth } = require('../config/firebase');
const firebaseService = require('../services/firebaseService');
const logger = require('../utils/logger');
const { z } = require('zod');

const registerSchema = z.object({
  idToken: z.string().min(20),
  username: z.string().trim().min(3).max(30)
});
const tokenSchema = z.object({ idToken: z.string().min(20) });

const publicUser = (user) => ({
  uid: user.uid,
  email: user.email,
  username: user.username,
  role: user.role || 'user',
  photoURL: user.photoURL || null
});

const authController = {
  async register(req, res, next) {
    try {
      const { idToken, username } = registerSchema.parse(req.body);
      const decoded = await auth.verifyIdToken(idToken);
      const existing = await firebaseService.getUserById(decoded.uid);
      if (existing) return res.status(200).json({ success: true, user: publicUser(existing), token: idToken });
      const user = await firebaseService.createUser({
        uid: decoded.uid,
        email: decoded.email || '',
        username,
        role: 'user',
        photoURL: decoded.picture || null
      });
      res.status(201).json({ success: true, message: 'Utilisateur créé avec succès', user: publicUser(user), token: idToken });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Données d’inscription invalides.', details: error.errors });
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { idToken } = tokenSchema.parse(req.body);
      const decoded = await auth.verifyIdToken(idToken);
      const user = await firebaseService.getUserById(decoded.uid);
      if (!user) return res.status(404).json({ success: false, message: 'Profil utilisateur introuvable.' });
      await firebaseService.updateUserActivity(user.uid);
      res.json({ success: true, user: publicUser(user), token: idToken });
    } catch (error) {
      logger.warn(`Login verification failed: ${error.message}`);
      if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Token manquant ou invalide.' });
      res.status(401).json({ success: false, message: 'Session invalide ou expirée.' });
    }
  },

  async socialAuth(req, res, next) {
    try {
      const { idToken, provider } = z.object({ idToken: z.string().min(20), provider: z.string().max(30).optional() }).parse(req.body);
      const decoded = await auth.verifyIdToken(idToken);
      let user = await firebaseService.getUserById(decoded.uid);
      if (!user) {
        user = await firebaseService.createUser({ uid: decoded.uid, email: decoded.email || '', username: decoded.name || (decoded.email || 'Utilisateur').split('@')[0], role: 'user', photoURL: decoded.picture || null, provider: provider || 'social' });
      } else {
        await firebaseService.updateUserActivity(decoded.uid);
      }
      res.json({ success: true, user: publicUser(user), token: idToken });
    } catch (error) {
      logger.warn(`Social authentication failed: ${error.message}`);
      res.status(401).json({ success: false, message: 'Connexion sociale impossible.' });
    }
  },

  async logout(req, res) { res.json({ success: true, message: 'Déconnecté.' }); },
  async me(req, res) { res.json({ authenticated: true, user: req.user }); }
};

module.exports = authController;
