const jwt = require("jsonwebtoken");
const { getSessionData } = require("../utils/security.utils");
const SecurityLog = require("../models/SecurityLog");

module.exports = async function (req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Session Binding Check
    const currentSession = getSessionData(req);
    if (decoded.sessionHash && decoded.sessionHash !== currentSession.hash) {
      await SecurityLog.create({
        userId: decoded.userId,
        action: 'TOKEN_REPLAY_ATTACK',
        severity: 'CRITICAL',
        details: `Token hash mismatch. Possible session hijacking or sharing.`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          expectedHash: decoded.sessionHash,
          actualHash: currentSession.hash
        }
      });
      return res.status(401).json({ message: "Session modified. Please login again." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    let action = 'TOKEN_VALIDATION_FAILURE';
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired", expired: true });
    }

    await SecurityLog.create({
      action: action,
      severity: 'LOW',
      details: `JWT Verification failed: ${error.message}`,
      ipAddress: req.ip
    });

    res.status(401).json({ message: "Invalid session" });
  }
};
