const mongoose = require("mongoose");

const clipSchema = new mongoose.Schema({
    sourceContent: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D", required: true },
    title: { type: String, required: true },
    description: String,
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    duration: { type: Number, required: true },
    format: { type: String, enum: ["landscape", "portrait", "square"], default: "portrait" },
    fileUrl: String,
    thumbnailUrl: String,
    subtitles: String,
    status: { type: String, enum: ["pending", "processing", "ready", "failed"], default: "pending" },
    aiScore: { type: Number, default: 0 },
    tags: [String],
    views: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

clipSchema.index({ sourceContent: 1 });
clipSchema.index({ createdBy: 1 });
clipSchema.index({ status: 1 });
clipSchema.index({ aiScore: -1 });

module.exports = mongoose.model("Clip", clipSchema);
