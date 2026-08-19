const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const root = path.join(__dirname, '..');

app.disable('x-powered-by');
app.set('trust proxy', 1);

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Trop de requêtes. Veuillez réessayer plus tard.' } });
const authLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 12, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Trop de tentatives. Veuillez réessayer plus tard.' } });

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      scriptSrc: ["'self'", 'https://www.gstatic.com'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseio.com', 'https://securetoken.googleapis.com', 'https://identitytoolkit.googleapis.com'],
      frameSrc: ["'self'", 'https://*.firebaseapp.com', 'https://accounts.google.com']
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : true, credentials: false }));
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use(express.static(root, { index: false, maxAge: isProduction ? '1h' : 0 }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', apiLimiter, chatRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'emiliana', timestamp: new Date().toISOString() }));
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Route API introuvable.' }));

const pages = {
  '/': 'emiliana-landing.html', '/landing': 'emiliana-landing.html', '/login': 'emiliana-login.html', '/app/login': 'emiliana-login.html',
  '/chat': 'emiliana-chat.html', '/app/chat': 'emiliana-chat.html', '/admin': 'emiliana-admin.html', '/app/admin': 'emiliana-admin.html',
  '/about': 'emiliana-about.html', '/app/about': 'emiliana-about.html'
};
Object.entries(pages).forEach(([route, file]) => app.get(route, (req, res) => res.sendFile(path.join(root, file))));
app.use((req, res) => res.status(404).sendFile(path.join(root, 'emiliana-landing.html')));
app.use(errorHandler);

module.exports = app;
