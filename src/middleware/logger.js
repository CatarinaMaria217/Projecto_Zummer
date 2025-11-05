// src/middleware/logger.js
module.exports = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.ip}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });

    next();
};