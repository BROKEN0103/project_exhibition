const Model3D = require("../models/Model3D");
const Activity = require("../models/Activity");

exports.getAnalytics = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        const filter = workspaceId ? { workspace: workspaceId } : {};

        // 1. Storage Usage
        const files = await Model3D.find(filter);
        const totalStorage = files.reduce((acc, f) => acc + (f.size || 0), 0);

        // Storage over time (simplified: count per month)
        const storageOverTimeRaw = await Model3D.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalSize: { $sum: "$size" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const storageOverTime = storageOverTimeRaw.map(item => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            totalSize: item.totalSize,
            count: item.count
        }));

        // 2. Most Accessed Files
        const mostAccessed = await Activity.aggregate([
            { $match: { action: "view" } },
            {
                $group: {
                    _id: "$document",
                    title: { $first: "$documentTitle" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // 3. User Activity Metrics
        const activeUsers = await Activity.aggregate([
            {
                $group: {
                    _id: "$user",
                    userName: { $first: "$userName" },
                    activityCount: { $sum: 1 }
                }
            },
            { $sort: { activityCount: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            totalStorage,
            storageOverTime,
            mostAccessed,
            activeUsers,
            totalFiles: files.length
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
    }
};
