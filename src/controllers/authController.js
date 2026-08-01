const { auth } = require('../config/firebase');
const firebaseService = require('../services/firebaseService');
const logger = require('../utils/logger');
const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(3).max(30)
});

const authController = {
    async register(req, res, next) {
        try {
            const { email, password, username } = registerSchema.parse(req.body);

            // Créer l'utilisateur dans Firebase Auth
            const userRecord = await auth.createUser({
                email,
                password,
                displayName: username
            });

            // Créer le profil utilisateur dans Firestore
            const userData = {
                uid: userRecord.uid,
                email: userRecord.email,
                username,
                role: 'user',
                photoURL: userRecord.photoURL || null
            };

            await firebaseService.createUser(userData);

            res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès',
                user: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    username
                }
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors });
            }
            next(error);
        }
    },

    async login(req, res, next) {
        try {
            const { idToken, otp } = req.body;
            if (!idToken) {
                return res.status(400).json({ success: false, message: 'ID Token requis' });
            }

            const decodedToken = await auth.verifyIdToken(idToken);
            const user = await firebaseService.getUserById(decodedToken.uid);

            if (!user) {
                return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
            }

            // Logique 2FA simplifiée pour Admin
            if (user.role === 'admin') {
                // Si on a un OTP, on le vérifie (simulé ici)
                if (process.env.NODE_ENV === 'production' && !otp) {
                    // Envoyer un mail de code (simulé)
                    logger.info(`2FA Code requested for admin ${user.email}`);
                    return res.status(200).json({ 
                        success: true, 
                        requires2FA: true, 
                        message: 'Un code a été envoyé à votre email.' 
                    });
                }
            }

            await firebaseService.updateUserActivity(user.uid);

            res.json({
                success: true,
                user
            });
        } catch (error) {
            logger.error('Login verification error:', error);
            res.status(401).json({ success: false, message: 'Token invalide' });
        }
    },

    async socialAuth(req, res, next) {
        try {
            const { idToken, provider } = req.body;
            if (!idToken) {
                return res.status(400).json({ success: false, message: 'ID Token requis' });
            }

            // Vérification du token Firebase
            const decodedToken = await auth.verifyIdToken(idToken);
            const uid = decodedToken.uid;
            
            let user = await firebaseService.getUserById(uid);

            if (!user) {
                // Premier login social, créer le profil dans Firestore
                user = {
                    uid: uid,
                    email: decodedToken.email,
                    username: decodedToken.name || decodedToken.email.split('@')[0],
                    role: 'user',
                    photoURL: decodedToken.picture || null,
                    provider: provider || 'social',
                    createdAt: new Date().toISOString(),
                    messagesToday: 0,
                    lastActivityDate: new Date().toISOString()
                };
                await firebaseService.createUser(user);
                logger.info(`New social user created: ${uid} (${provider})`);
            } else {
                // Mettre à jour l'activité
                await firebaseService.updateUserActivity(uid);
            }

            res.json({
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    photoURL: user.photoURL
                },
                token: idToken // On réutilise le token Firebase comme token d'auth
            });
        } catch (error) {
            logger.error('Social auth error:', error);
            res.status(401).json({ success: false, message: 'Erreur d\'authentification sociale : ' + error.message });
        }
    },

    async logout(req, res) {
        // Le logout est principalement géré côté client avec Firebase
        res.json({ success: true, message: 'Déconnecté' });
    },

    async me(req, res) {
        if (req.user) {
            res.json({ authenticated: true, user: req.user });
        } else {
            res.status(401).json({ authenticated: false });
        }
    }
};

module.exports = authController;
