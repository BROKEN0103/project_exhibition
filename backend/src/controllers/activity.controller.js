const Activity = require("../models/Activity");

exports.getActivities = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== "admin") {
            filter.user = req.user.userId;
        }
        console.log(`[ActivityController] Fetching activities for user: ${req.user.userId}, role: ${req.user.role}, filter:`, filter);
        const activities = await Activity.find(filter).sort({ createdAt: -1 }).limit(100);
        console.log(`[ActivityController] Found ${activities.length} activities`);
        res.json(activities);
    } catch (err) {
        console.error("[ActivityController] Error fetching activities:", err);
        res.status(500).json({ message: "Failed to fetch activities", error: err.message });
    }
};
