const aiService = require('../services/aiService');
const firebaseService = require('../services/firebaseService');
const logger = require('../utils/logger');
const { z } = require('zod');

// Schémas de validation pour le Chat
const messageSchema = z.object({
    message: z.string().min(1).max(2000),
    botType: z.enum(['bienveillant', 'creatif', 'mentor', 'complice']).optional().default('bienveillant'),
    companionProfile: z.object({
        name: z.string().max(40).optional(),
        archetype: z.string().optional(),
        expectations: z.string().max(500).optional(),
        interests: z.string().max(300).optional()
    }).optional(),
    conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(1000)
    })).optional().default([])
});

const chatController = {
    async sendMessage(req, res, next) {
        try {
            // Validation des données entrantes
            const { message, botType, companionProfile, conversationHistory } = messageSchema.parse(req.body);
            const user = req.user;

            // Vérification des limites quotidiennes
            const userData = await firebaseService.getUserById(user.uid);
            const DAILY_LIMIT = parseInt(process.env.DAILY_MESSAGE_LIMIT || '200');

            if (userData.messagesToday >= DAILY_LIMIT && userData.role !== 'admin') {
                logger.warn(`User ${user.uid} reached daily message limit`);
                return res.status(429).json({
                    success: false,
                    error: 'limit_reached',
                    message: `Limite de ${DAILY_LIMIT} messages atteinte. Revenez demain !`
                });
            }

            // Normalisation du profil et génération de la réponse IA
            const companion = aiService.normalizeCompanion(companionProfile, botType);
            const aiResult = await aiService.generateResponse(message, companion, conversationHistory);

            await Promise.all([
                firebaseService.saveMessage({
                    userId: user.uid,
                    userMessage: message,
                    botResponse: aiResult.response,
                    provider: aiResult.provider,
                    companionName: companion.name,
                    companionArchetype: companion.archetypeName,
                    timestamp: new Date().toISOString()
                }),
                firebaseService.incrementMessageCount(user.uid),
                firebaseService.updateUserActivity(user.uid)
            ]);

            res.json({
                success: true,
                response: aiResult.response,
                provider: aiResult.provider,
                botName: companion.name,
                messagesRemaining: Math.max(0, DAILY_LIMIT - (userData.messagesToday + 1))
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, error: 'Données invalides', details: error.errors });
            }
            next(error);
        }
    },

    async getHistory(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const messages = await firebaseService.getUserMessages(req.user.uid, limit);
            res.json({ success: true, messages });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = chatController;
