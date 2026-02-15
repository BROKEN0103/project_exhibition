const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    path: { type: String, default: "/" }, // For faster tree queries
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    roleAssignments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "editor", "viewer"] }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Folder", folderSchema);
