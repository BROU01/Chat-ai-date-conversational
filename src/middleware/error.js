const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    if (err.stack) {
        logger.error(err.stack);
    }

    const statusCode = err.status || 500;
    const message = err.message || 'Une erreur interne est survenue';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            status: statusCode,
            // Ne pas exposer le stack trace en production
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        }
    });
};

module.exports = errorHandler;
