const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const feedService = require("../services/recommendation.service");

// Get personalized feed
router.get("/", auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const feed = await feedService.generateFeed(req.user.userId, page, limit);

        res.json({
            items: feed.map(f => ({
                content: f.content,
                score: f.score,
                signals: f.signals,
            })),
            page,
            hasMore: feed.length === limit,
        });
    } catch (err) {
        console.error("Feed generation failed:", err);
        res.status(500).json({ message: "Feed generation failed", error: err.message });
    }
});

// Refresh recommendation scores
router.post("/refresh", auth, async (req, res) => {
    try {
        await feedService.recomputeScoresForUser(req.user.userId);
        res.json({ success: true, message: "Feed scores refreshed" });
    } catch (err) {
        res.status(500).json({ message: "Refresh failed", error: err.message });
    }
});

module.exports = router;
