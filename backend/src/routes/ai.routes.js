const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const aiService = require("../services/ai.service");

// Process content through AI pipeline
router.post("/process/:contentId", auth, async (req, res) => {
    try {
        const result = await aiService.processContent(req.params.contentId);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error("AI processing failed:", err);
        res.status(500).json({ message: "AI processing failed", error: err.message });
    }
});

// Get AI tags for content
router.get("/tags/:contentId", auth, async (req, res) => {
    try {
        const Model3D = require("../models/Model3D");
        const content = await Model3D.findById(req.params.contentId);
        if (!content) return res.status(404).json({ message: "Content not found" });

        if (!content.tags || content.tags.length === 0) {
            const { tags } = await aiService.generateTags(content.title, content.description);
            content.tags = tags;
            await content.save();
        }

        res.json({ tags: content.tags, category: content.metadata?.aiCategory });
    } catch (err) {
        res.status(500).json({ message: "Failed to get tags", error: err.message });
    }
});

// Get AI summary for content
router.get("/summary/:contentId", auth, async (req, res) => {
    try {
        const Model3D = require("../models/Model3D");
        const content = await Model3D.findById(req.params.contentId);
        if (!content) return res.status(404).json({ message: "Content not found" });

        let summary = content.metadata?.aiSummary;
        if (!summary) {
            summary = await aiService.generateSummary(content.title, content.extractedText);
            await Model3D.findByIdAndUpdate(req.params.contentId, { "metadata.aiSummary": summary });
        }

        res.json({ summary, topic: content.metadata?.aiTopic });
    } catch (err) {
        res.status(500).json({ message: "Failed to get summary", error: err.message });
    }
});

// Semantic search
router.post("/search", auth, async (req, res) => {
    try {
        const { query, limit } = req.body;
        if (!query) return res.status(400).json({ message: "Query required" });

        const results = await aiService.semanticSearch(query, limit || 10);

        let summary = "";
        const ai = aiService.getOpenAI ? null : null; // Summary is optional

        res.json({ matches: results, summary });
    } catch (err) {
        res.status(500).json({ message: "Semantic search failed", error: err.message });
    }
});

module.exports = router;
