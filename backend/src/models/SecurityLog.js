const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN_SUCCESS',
            'LOGIN_FAILURE',
            'TOKEN_REFRESH',
            'TOKEN_VALIDATION_FAILURE',
            'TOKEN_REPLAY_ATTACK',
            'UNAUTHORIZED_ACCESS',
            'RATE_LIMIT_VIOLATION',
            'CONTENT_ACCESS',
            'KEY_ROTATION',
            'ADMIN_ACTION',
            'SIGN_OUT'
        ]
    },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW'
    },
    details: String,
    ipAddress: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed,
    isAnomaly: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for quick queries in monitoring
securityLogSchema.index({ createdAt: -1 });
securityLogSchema.index({ action: 1 });
securityLogSchema.index({ userId: 1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
