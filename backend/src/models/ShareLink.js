const mongoose = require("mongoose");

const shareLinkSchema = new mongoose.Schema({
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, unique: true, required: true },
    passwordHash: String, // Optional password protection
    expiresAt: Date,
    maxDownloads: { type: Number, default: 0 }, // 0 = unlimited
    downloadCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("ShareLink", shareLinkSchema);
