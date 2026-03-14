const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const clipService = require("../services/clip.service");

// Get clips for current user
router.get("/", auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await clipService.getUserClips(req.user.userId, page, limit);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch clips", error: err.message });
    }
});

// Get clips for a specific content
router.get("/content/:contentId", auth, async (req, res) => {
    try {
        const clips = await clipService.getClipsByContent(req.params.contentId);
        res.json(clips);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch clips", error: err.message });
    }
});

// Auto-generate clips from content
router.post("/generate/:contentId", auth, async (req, res) => {
    try {
        const highlights = await clipService.detectHighlights(req.params.contentId);
        const clips = await clipService.generateClips(req.params.contentId, req.user.userId, highlights);
        res.json({ highlights, clips });
    } catch (err) {
        res.status(500).json({ message: "Clip generation failed", error: err.message });
    }
});

// Update a clip
router.put("/:id", auth, async (req, res) => {
    try {
        const clip = await clipService.updateClip(req.params.id, req.user.userId, req.body);
        res.json(clip);
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
});

// Delete a clip
router.delete("/:id", auth, async (req, res) => {
    try {
        await clipService.deleteClip(req.params.id, req.user.userId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
});

module.exports = router;
