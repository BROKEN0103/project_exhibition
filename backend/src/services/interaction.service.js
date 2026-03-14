const UserInteraction = require("../models/UserInteraction");
const TimestampComment = require("../models/TimestampComment");
const Quiz = require("../models/Quiz");
const Poll = require("../models/Poll");

// Track user interaction
async function trackInteraction({ userId, contentId, type, value, watchDuration, totalDuration, timestamp, ipAddress, userAgent }) {
    // Dedup likes
    if (type === "like") {
        const existing = await UserInteraction.findOne({ user: userId, content: contentId, type: "like" });
        if (existing) {
            await UserInteraction.deleteOne({ _id: existing._id });
            return { action: "unliked" };
        }
    }

    const interaction = await UserInteraction.create({
        user: userId,
        content: contentId,
        type,
        value,
        watchDuration,
        totalDuration,
        timestamp,
        ipAddress,
        userAgent,
    });

    return { action: type, interaction };
}

// Get engagement stats for content
async function getContentEngagement(contentId) {
    const [views, likes, shares, downloads, comments, avgWatchTime] = await Promise.all([
        UserInteraction.countDocuments({ content: contentId, type: "view" }),
        UserInteraction.countDocuments({ content: contentId, type: "like" }),
        UserInteraction.countDocuments({ content: contentId, type: "share" }),
        UserInteraction.countDocuments({ content: contentId, type: "download" }),
        TimestampComment.countDocuments({ content: contentId }),
        UserInteraction.aggregate([
            { $match: { content: require("mongoose").Types.ObjectId.createFromHexString(contentId), type: "watch_time" } },
            { $group: { _id: null, avg: { $avg: "$watchDuration" } } },
        ]),
    ]);

    return {
        views, likes, shares, downloads, comments,
        avgWatchTime: avgWatchTime[0]?.avg || 0,
        engagementRate: views > 0 ? ((likes + shares + comments) / views * 100).toFixed(1) : 0,
    };
}

// Check if user liked content
async function hasUserLiked(userId, contentId) {
    return !!(await UserInteraction.findOne({ user: userId, content: contentId, type: "like" }));
}

// Timestamp comments
async function addComment({ userId, contentId, text, timestamp, parentComment }) {
    return TimestampComment.create({
        content: contentId,
        user: userId,
        text,
        timestamp,
        parentComment,
    });
}

async function getComments(contentId) {
    return TimestampComment.find({ content: contentId })
        .sort({ timestamp: 1, createdAt: 1 })
        .populate("user", "name email");
}

// Quiz operations
async function createQuiz({ contentId, question, options, timestamp, explanation, userId }) {
    return Quiz.create({ content: contentId, question, options, timestamp, explanation, createdBy: userId });
}

async function answerQuiz(quizId, userId, selectedOption) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");

    const alreadyAnswered = quiz.responses.some(r => r.user.toString() === userId);
    if (alreadyAnswered) throw new Error("Already answered");

    const isCorrect = quiz.options[selectedOption]?.isCorrect || false;
    quiz.responses.push({ user: userId, selectedOption, isCorrect });
    await quiz.save();

    return { isCorrect, explanation: quiz.explanation, totalResponses: quiz.responses.length };
}

async function getQuizzes(contentId) {
    return Quiz.find({ content: contentId }).sort({ timestamp: 1 });
}

// Poll operations
async function createPoll({ contentId, question, options, timestamp, expiresAt, userId }) {
    return Poll.create({
        content: contentId,
        question,
        options: options.map(text => ({ text, votes: 0 })),
        timestamp,
        expiresAt,
        createdBy: userId,
    });
}

async function votePoll(pollId, userId, optionIndex) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw new Error("Poll not found");
    if (poll.voters.includes(userId)) throw new Error("Already voted");
    if (poll.expiresAt && new Date() > poll.expiresAt) throw new Error("Poll expired");
    if (optionIndex < 0 || optionIndex >= poll.options.length) throw new Error("Invalid option");

    poll.options[optionIndex].votes += 1;
    poll.voters.push(userId);
    await poll.save();

    return {
        options: poll.options,
        totalVotes: poll.options.reduce((sum, o) => sum + o.votes, 0),
    };
}

async function getPolls(contentId) {
    return Poll.find({ content: contentId }).sort({ timestamp: 1 });
}

module.exports = {
    trackInteraction,
    getContentEngagement,
    hasUserLiked,
    addComment,
    getComments,
    createQuiz,
    answerQuiz,
    getQuizzes,
    createPoll,
    votePoll,
    getPolls,
};
