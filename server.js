const app = require('./src/app');
const logger = require('./src/utils/logger');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
    logger.info(`=== Emiliana Server Running on port ${PORT} ===`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated.');
    });
});
