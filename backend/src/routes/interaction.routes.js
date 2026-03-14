const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const interactionService = require("../services/interaction.service");

// Track interaction
router.post("/", auth, async (req, res) => {
    try {
        const { contentId, type, value, watchDuration, totalDuration, timestamp } = req.body;
        const result = await interactionService.trackInteraction({
            userId: req.user.userId,
            contentId,
            type,
            value,
            watchDuration,
            totalDuration,
            timestamp,
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Failed to track interaction", error: err.message });
    }
});

// Get engagement stats for content
router.get("/content/:contentId", auth, async (req, res) => {
    try {
        const stats = await interactionService.getContentEngagement(req.params.contentId);
        const hasLiked = await interactionService.hasUserLiked(req.user.userId, req.params.contentId);
        res.json({ ...stats, hasLiked });
    } catch (err) {
        res.status(500).json({ message: "Failed to get engagement", error: err.message });
    }
});

// Timestamp comments
router.get("/comments/:contentId", auth, async (req, res) => {
    try {
        const comments = await interactionService.getComments(req.params.contentId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: "Failed to get comments", error: err.message });
    }
});

router.post("/comments/:contentId", auth, async (req, res) => {
    try {
        const { text, timestamp, parentComment } = req.body;
        const comment = await interactionService.addComment({
            userId: req.user.userId,
            contentId: req.params.contentId,
            text,
            timestamp,
            parentComment,
        });
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: "Failed to add comment", error: err.message });
    }
});

// Quizzes
router.get("/quizzes/:contentId", auth, async (req, res) => {
    try {
        const quizzes = await interactionService.getQuizzes(req.params.contentId);
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: "Failed to get quizzes", error: err.message });
    }
});

router.post("/quizzes", auth, async (req, res) => {
    try {
        const { contentId, question, options, timestamp, explanation } = req.body;
        const quiz = await interactionService.createQuiz({
            contentId, question, options, timestamp, explanation, userId: req.user.userId,
        });
        res.status(201).json(quiz);
    } catch (err) {
        res.status(500).json({ message: "Failed to create quiz", error: err.message });
    }
});

router.post("/quizzes/:quizId/answer", auth, async (req, res) => {
    try {
        const { selectedOption } = req.body;
        const result = await interactionService.answerQuiz(req.params.quizId, req.user.userId, selectedOption);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Polls
router.get("/polls/:contentId", auth, async (req, res) => {
    try {
        const polls = await interactionService.getPolls(req.params.contentId);
        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: "Failed to get polls", error: err.message });
    }
});

router.post("/polls", auth, async (req, res) => {
    try {
        const { contentId, question, options, timestamp, expiresAt } = req.body;
        const poll = await interactionService.createPoll({
            contentId, question, options, timestamp, expiresAt, userId: req.user.userId,
        });
        res.status(201).json(poll);
    } catch (err) {
        res.status(500).json({ message: "Failed to create poll", error: err.message });
    }
});

router.post("/polls/:pollId/vote", auth, async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const result = await interactionService.votePoll(req.params.pollId, req.user.userId, optionIndex);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
