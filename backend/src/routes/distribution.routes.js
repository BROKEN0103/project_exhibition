const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const distService = require("../services/distribution.service");

// Get distribution jobs for current user
router.get("/", auth, async (req, res) => {
    try {
        const DistributionJob = require("../models/DistributionJob");
        const jobs = await DistributionJob.find({ createdBy: req.user.userId })
            .sort({ scheduledAt: -1 })
            .limit(50)
            .populate("content", "title mimeType");
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch jobs", error: err.message });
    }
});

// Create distribution job
router.post("/", auth, async (req, res) => {
    try {
        const { contentId, clipId, platform, caption, hashtags, scheduledAt } = req.body;
        const job = await distService.createDistributionJob({
            contentId, clipId, platform, caption, hashtags, scheduledAt, userId: req.user.userId,
        });
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: "Failed to create job", error: err.message });
    }
});

// Get analytics
router.get("/analytics", auth, async (req, res) => {
    try {
        const analytics = await distService.getDistributionAnalytics(req.user.userId);
        res.json(analytics);
    } catch (err) {
        res.status(500).json({ message: "Analytics failed", error: err.message });
    }
});

// Cancel a job
router.patch("/:id/cancel", auth, async (req, res) => {
    try {
        const job = await distService.cancelJob(req.params.id, req.user.userId);
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: "Cancel failed", error: err.message });
    }
});

// Process scheduled jobs (internal worker endpoint)
router.post("/process", auth, async (req, res) => {
    try {
        const processed = await distService.processScheduledJobs();
        res.json({ processed });
    } catch (err) {
        res.status(500).json({ message: "Processing failed", error: err.message });
    }
});

module.exports = router;
