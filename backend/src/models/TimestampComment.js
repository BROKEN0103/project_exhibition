const mongoose = require("mongoose");

const timestampCommentSchema = new mongoose.Schema({
    content: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 500 },
    timestamp: { type: Number, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "TimestampComment" },
    isEdited: { type: Boolean, default: false },
}, { timestamps: true });

timestampCommentSchema.index({ content: 1, timestamp: 1 });
timestampCommentSchema.index({ content: 1, createdAt: -1 });
timestampCommentSchema.index({ user: 1 });

module.exports = mongoose.model("TimestampComment", timestampCommentSchema);
