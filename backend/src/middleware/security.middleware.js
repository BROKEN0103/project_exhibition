const rateLimit = require('express-rate-limit');
const SecurityLog = require('../models/SecurityLog');

// Global Rate Limiter
exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100, // In v7+ this is 'limit' not 'max', though 'max' is alias
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
    handler: (req, res, next, options) => {
        try {
            SecurityLog.create({
                action: 'RATE_LIMIT_VIOLATION',
                severity: 'MEDIUM',
                details: `IP ${req.ip} exceeded global rate limit`,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });
        } catch (e) { }
        res.status(options.statusCode || 429).send(options.message);
    }
});

// Login Throttling
exports.loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10, // Increased for testing
    message: { message: "Too many failed login attempts, please try again in an hour." },
    handler: (req, res, next, options) => {
        try {
            SecurityLog.create({
                action: 'LOGIN_FAILURE',
                severity: 'HIGH',
                details: `Brute force attempt detected from IP ${req.ip}`,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });
        } catch (e) { }
        res.status(options.statusCode || 429).send(options.message);
    }
});

// Content Access Limiter
exports.contentLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 20, // Limit to 20 content requests per minute
    message: { message: "Slow down! Too many content requests." }
});

// Error handling middleware (Generic errors)
exports.errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.stack}`);

    // Log detailed error privately
    SecurityLog.create({
        action: 'UNAUTHORIZED_ACCESS', // or generic SYSTEM_ERROR
        severity: 'MEDIUM',
        details: `Unhandled Error: ${err.message}`,
        ipAddress: req.ip,
        metadata: { stack: err.stack }
    });

    res.status(err.status || 500).json({
        message: "An internal security error occurred. Please contact support."
    });
};

// RBAC Middleware
exports.authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            SecurityLog.create({
                userId: req.user?.userId,
                action: 'UNAUTHORIZED_ACCESS',
                severity: 'HIGH',
                details: `User ${req.user?.userId} tried to access role-protected route`,
                ipAddress: req.ip
            });
            return res.status(403).json({ message: "Access Forbidden" });
        }
        next();
    };
};
