const mongoose = require("mongoose");

const recommendationScoreSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D", required: true },
    score: { type: Number, required: true, default: 0 },
    signals: {
        engagementScore: { type: Number, default: 0 },
        recencyScore: { type: Number, default: 0 },
        topicRelevance: { type: Number, default: 0 },
        socialProof: { type: Number, default: 0 },
        diversityBonus: { type: Number, default: 0 },
    },
    isViewed: { type: Boolean, default: false },
    lastCalculated: { type: Date, default: Date.now },
}, { timestamps: true });

recommendationScoreSchema.index({ user: 1, score: -1 });
recommendationScoreSchema.index({ user: 1, content: 1 }, { unique: true });
recommendationScoreSchema.index({ lastCalculated: 1 });

module.exports = mongoose.model("RecommendationScore", recommendationScoreSchema);
