const mongoose = require("mongoose");

const distributionJobSchema = new mongoose.Schema({
    content: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D", required: true },
    clip: { type: mongoose.Schema.Types.ObjectId, ref: "Clip" },
    platform: { type: String, enum: ["twitter", "linkedin", "youtube", "tiktok", "instagram"], required: true },
    status: { type: String, enum: ["scheduled", "processing", "published", "failed", "cancelled"], default: "scheduled" },
    scheduledAt: { type: Date, required: true },
    publishedAt: Date,
    caption: String,
    hashtags: [String],
    externalUrl: String,
    externalId: String,
    metrics: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
    },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    errorMessage: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

distributionJobSchema.index({ content: 1 });
distributionJobSchema.index({ status: 1 });
distributionJobSchema.index({ scheduledAt: 1 });
distributionJobSchema.index({ createdBy: 1 });
distributionJobSchema.index({ platform: 1, status: 1 });

module.exports = mongoose.model("DistributionJob", distributionJobSchema);
