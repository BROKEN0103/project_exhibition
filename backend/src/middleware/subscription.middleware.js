const SecurityLog = require("../models/SecurityLog");

module.exports = function (requiredPlan) {
    return async function (req, res, next) {
        if (!req.user) return res.status(401).json({ message: "Authentication required" });

        const plans = {
            'free': 1,
            'premium': 2,
            'enterprise': 3
        };

        const userPlan = req.user.subscriptionStatus || 'free';

        if (plans[userPlan] < plans[requiredPlan]) {
            await SecurityLog.create({
                userId: req.user.userId,
                action: 'UNAUTHORIZED_ACCESS',
                severity: 'LOW',
                details: `Feature requires ${requiredPlan} plan, user has ${userPlan}`,
                ipAddress: req.ip
            });
            return res.status(403).json({
                message: `This feature requires a ${requiredPlan} subscription.`
            });
        }

        // Check for expiry
        if (req.user.subscriptionExpiresAt && new Date(req.user.subscriptionExpiresAt) < new Date()) {
            return res.status(403).json({ message: "Subscription expired" });
        }

        next();
    };
};
