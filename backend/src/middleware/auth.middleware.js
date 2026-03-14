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

    // Session Binding Check - relaxed for SSR/client hybrid architecture
    // In Next.js SSR, the token is created from the server's IP/UA but then used
    // by the browser client with a different IP/UA. Log mismatch but allow through.
    const currentSession = getSessionData(req);
    if (decoded.sessionHash && decoded.sessionHash !== currentSession.hash) {
      console.warn(`[Auth] Session hash mismatch for user ${decoded.userId} - likely SSR/client hybrid call`);
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
