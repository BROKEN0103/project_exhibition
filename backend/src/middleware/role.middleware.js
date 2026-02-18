const SecurityLog = require("../models/SecurityLog");

module.exports = function (allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      await SecurityLog.create({
        userId: req.user.userId,
        action: 'UNAUTHORIZED_ACCESS',
        severity: 'HIGH',
        details: `User with role ${req.user.role} tried to access resource requiring ${allowedRoles.join(', ')}`,
        ipAddress: req.ip
      });
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
