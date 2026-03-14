const mongoose = require("mongoose");

const userInteractionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D", required: true },
    type: { type: String, enum: ["view", "like", "unlike", "share", "download", "comment", "quiz_answer", "poll_vote", "watch_time"], required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    watchDuration: { type: Number },
    totalDuration: { type: Number },
    timestamp: { type: Number },
    metadata: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
}, { timestamps: true });

userInteractionSchema.index({ user: 1, content: 1 });
userInteractionSchema.index({ content: 1, type: 1 });
userInteractionSchema.index({ user: 1, type: 1 });
userInteractionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("UserInteraction", userInteractionSchema);
