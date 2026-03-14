const UserInteraction = require("../models/UserInteraction");
const RecommendationScore = require("../models/RecommendationScore");
const Model3D = require("../models/Model3D");

// Engagement scoring weights
const WEIGHTS = {
    view: 1,
    like: 5,
    share: 8,
    download: 3,
    comment: 4,
    quiz_answer: 6,
    poll_vote: 3,
    watch_time: 0.1, // per second
};

// Calculate engagement score for a content item
async function getContentEngagementScore(contentId) {
    const interactions = await UserInteraction.find({ content: contentId });

    let score = 0;
    for (const interaction of interactions) {
        score += WEIGHTS[interaction.type] || 1;
        if (interaction.type === "watch_time" && interaction.watchDuration) {
            score += interaction.watchDuration * WEIGHTS.watch_time;
        }
    }

    const uniqueUsers = new Set(interactions.map(i => i.user.toString())).size;
    score *= Math.log2(uniqueUsers + 1); // Social proof multiplier

    return score;
}

// Calculate user-specific topic preferences
async function getUserTopicPreferences(userId) {
    const interactions = await UserInteraction.find({ user: userId })
        .populate("content", "tags metadata")
        .sort({ createdAt: -1 })
        .limit(100);

    const topicScores = {};

    for (const interaction of interactions) {
        if (!interaction.content) continue;
        const tags = interaction.content.tags || [];
        const category = interaction.content.metadata?.aiCategory || "other";
        const weight = WEIGHTS[interaction.type] || 1;

        tags.forEach(tag => {
            topicScores[tag] = (topicScores[tag] || 0) + weight;
        });
        topicScores[category] = (topicScores[category] || 0) + weight * 2;
    }

    return topicScores;
}

// Recency decay factor (content loses relevance over time)
function recencyScore(uploadDate) {
    const hoursSinceUpload = (Date.now() - new Date(uploadDate).getTime()) / (1000 * 60 * 60);
    return 1 / Math.pow(1 + hoursSinceUpload / 24, 0.5); // Half-life ~24hours
}

// Generate personalized feed for a user
async function generateFeed(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Get precomputed scores first
    let scores = await RecommendationScore.find({ user: userId, isViewed: false })
        .sort({ score: -1 })
        .skip(skip)
        .limit(limit)
        .populate("content");

    // If no precomputed scores, compute on-the-fly
    if (scores.length === 0) {
        await recomputeScoresForUser(userId);
        scores = await RecommendationScore.find({ user: userId, isViewed: false })
            .sort({ score: -1 })
            .skip(skip)
            .limit(limit)
            .populate("content");
    }

    // If still empty, return latest content
    if (scores.length === 0) {
        const content = await Model3D.find({ isLatest: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("uploadedBy", "name email");

        return content.map(c => ({
            content: c,
            score: recencyScore(c.createdAt),
            signals: { engagementScore: 0, recencyScore: recencyScore(c.createdAt), topicRelevance: 0.5, socialProof: 0, diversityBonus: 0.1 },
        }));
    }

    return scores.map(s => ({
        content: s.content,
        score: s.score,
        signals: s.signals,
    }));
}

// Recompute recommendation scores for a user
async function recomputeScoresForUser(userId) {
    const allContent = await Model3D.find({ isLatest: true }).sort({ createdAt: -1 }).limit(200);
    const topicPrefs = await getUserTopicPreferences(userId);
    const viewedContentIds = (await UserInteraction.find({ user: userId, type: "view" }).distinct("content")).map(String);

    const scores = [];
    const seenCategories = new Set();

    for (const content of allContent) {
        const isViewed = viewedContentIds.includes(content._id.toString());

        // Engagement
        const engagement = await getContentEngagementScore(content._id);
        const engagementNorm = Math.min(engagement / 100, 1);

        // Recency
        const recency = recencyScore(content.createdAt);

        // Topic relevance
        let topicRel = 0;
        const tags = content.tags || [];
        const category = content.metadata?.aiCategory || "other";
        tags.forEach(tag => { topicRel += (topicPrefs[tag] || 0); });
        topicRel += (topicPrefs[category] || 0) * 2;
        const topicRelNorm = Math.min(topicRel / 50, 1);

        // Social proof
        const uniqueViewers = await UserInteraction.countDocuments({ content: content._id, type: "view" });
        const socialProof = Math.min(uniqueViewers / 20, 1);

        // Diversity bonus
        const diversityBonus = seenCategories.has(category) ? 0 : 0.15;
        seenCategories.add(category);

        const finalScore = (
            engagementNorm * 0.25 +
            recency * 0.20 +
            topicRelNorm * 0.30 +
            socialProof * 0.15 +
            diversityBonus * 0.10
        );

        scores.push({
            user: userId,
            content: content._id,
            score: finalScore,
            signals: {
                engagementScore: engagementNorm,
                recencyScore: recency,
                topicRelevance: topicRelNorm,
                socialProof,
                diversityBonus,
            },
            isViewed,
        });
    }

    // Upsert all scores
    const ops = scores.map(s => ({
        updateOne: {
            filter: { user: s.user, content: s.content },
            update: { $set: s },
            upsert: true,
        },
    }));

    if (ops.length > 0) {
        await RecommendationScore.bulkWrite(ops);
    }
}

module.exports = {
    getContentEngagementScore,
    getUserTopicPreferences,
    generateFeed,
    recomputeScoresForUser,
    recencyScore,
    WEIGHTS,
};
