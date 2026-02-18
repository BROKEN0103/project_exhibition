const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const useragent = require('useragent');
const requestIp = require('request-ip');

// AES-256-CBC Encryption
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(process.env.FILE_ENCRYPTION_KEY || 'default_secret_key_32_characters_!!', 'utf8');

/**
 * Encrypt a buffer using AES-256-CBC
 */
exports.encryptBuffer = (buffer) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted
    };
};

/**
 * Decrypt a buffer using AES-256-CBC
 */
exports.decryptBuffer = (encryptedBuffer, ivHex) => {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decrypted;
};

/**
 * Generate Access and Refresh Tokens
 */
exports.generateTokens = (user, sessionData) => {
    const accessToken = jwt.sign(
        {
            userId: user._id,
            role: user.role,
            email: user.email,
            sessionHash: sessionData.hash
        },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // Short-lived access token
    );

    const refreshToken = jwt.sign(
        {
            userId: user._id,
            sessionHash: sessionData.hash
        },
        process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_secure',
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

/**
 * Get Session Data (IP + User Agent + Fingerprint)
 */
exports.getSessionData = (req) => {
    const clientIp = requestIp.getClientIp(req);
    const agent = useragent.parse(req.headers['user-agent']);
    const browser = agent.toAgent();
    const os = agent.os.toString();
    const fingerprint = req.headers['x-device-fingerprint'] || 'unknown';

    const rawData = `${clientIp}-${browser}-${os}-${fingerprint}`;
    const hash = crypto.createHash('sha256').update(rawData).digest('hex');

    return {
        ip: clientIp,
        browser,
        os,
        fingerprint,
        hash
    };
};

/**
 * Generate a Signed URL for content
 */
exports.generateSignedUrl = (fileId, expiresInSeconds = 300) => {
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const data = `${fileId}:${expires}`;
    const signature = crypto.createHmac('sha256', process.env.SIGNED_URL_SECRET || 'signed_url_secret')
        .update(data)
        .digest('hex');

    return `/api/content/stream/${fileId}?expires=${expires}&signature=${signature}`;
};

/**
 * Verify a Signed URL
 */
exports.verifySignedUrl = (fileId, expires, signature) => {
    if (Math.floor(Date.now() / 1000) > parseInt(expires)) {
        return false;
    }

    const data = `${fileId}:${expires}`;
    const expectedSignature = crypto.createHmac('sha256', process.env.SIGNED_URL_SECRET || 'signed_url_secret')
        .update(data)
        .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};
