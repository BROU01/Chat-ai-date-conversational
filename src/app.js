const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error');

// Limiteur de débit pour l'API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: { success: false, message: 'Trop de requêtes, veuillez réessayer plus tard.' }
});

// Limiteur spécifique pour l'auth
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 tentatives max
    message: { success: false, message: 'Trop de tentatives de connexion, réessayez dans une heure.' }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares de base
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://api.fontshare.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://api.fontshare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.openai.com", "https://api.groq.com", "https://openrouter.ai", "*.firebaseio.com", "*.googleapis.com"],
            frameSrc: ["'self'"]
        }
    }
}));

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Routes API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', apiLimiter, chatRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Servir les fichiers statiques (Frontend)
app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '..', 'emiliana-landing.html'));
});

// Gestion des erreurs (doit être en dernier)
app.use(errorHandler);

module.exports = app;
