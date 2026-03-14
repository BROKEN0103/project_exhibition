const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
    content: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D", required: true },
    question: { type: String, required: true },
    options: [{
        text: String,
        votes: { type: Number, default: 0 },
    }],
    timestamp: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expiresAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

pollSchema.index({ content: 1 });
pollSchema.index({ content: 1, timestamp: 1 });

module.exports = mongoose.model("Poll", pollSchema);
