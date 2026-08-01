const { auth } = require('../config/firebase');
const firebaseService = require('../services/firebaseService');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const isBlacklisted = await firebaseService.isIPBlacklisted(ip);
        if (isBlacklisted) {
            return res.status(403).json({ success: false, message: 'Votre accès est bloqué.' });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Non autorisé' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        
        const user = await firebaseService.getUserById(decodedToken.uid);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication error:', error.message);
        res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Accès administrateur requis' });
    }
};

module.exports = { authenticate, isAdmin };
