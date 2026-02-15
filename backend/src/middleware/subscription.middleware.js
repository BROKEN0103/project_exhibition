module.exports = function (requiredPlan) {
    return function (req, res, next) {
        if (!req.user) return res.status(401).json({ message: "Authentication required" });

        const plans = {
            'free': 1,
            'premium': 2,
            'enterprise': 3
        };

        const userPlan = req.user.subscriptionStatus || 'free';

        if (plans[userPlan] < plans[requiredPlan]) {
            return res.status(403).json({
                message: `This feature requires a ${requiredPlan} subscription. Current plan: ${userPlan}`
            });
        }

        // Check for expiry
        if (req.user.subscriptionExpiresAt && new Date(req.user.subscriptionExpiresAt) < new Date()) {
            return res.status(403).json({ message: "Subscription expired" });
        }

        next();
    };
};
