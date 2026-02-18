const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    sessionHash: {
        type: String, // Bound to IP/UA/Fingerprint
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    replacedByToken: {
        type: String // For token rotation
    },
    revokedAt: Date,
    revokedByIp: String
}, { timestamps: true });

refreshTokenSchema.virtual('isExpired').get(function () {
    return Date.now() >= this.expiresAt;
});

refreshTokenSchema.virtual('isActive').get(function () {
    return !this.revokedAt && !this.isExpired;
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
