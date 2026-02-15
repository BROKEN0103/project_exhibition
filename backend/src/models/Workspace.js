const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "editor", "viewer"], default: "viewer" }
    }],
    settings: {
        storageLimit: { type: Number, default: 10 * 1024 * 1024 * 1024 }, // 10GB default
        isE2EEnabled: { type: Boolean, default: true }
    }
}, { timestamps: true });

module.exports = mongoose.model("Workspace", workspaceSchema);
