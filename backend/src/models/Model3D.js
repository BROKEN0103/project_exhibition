const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true },
  mimeType: String,
  size: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },

  // Encryption
  isEncrypted: { type: Boolean, default: false },
  encryptedKey: String, // Symmetric key encrypted with user's master key
  iv: String, // Initialization vector for encryption

  // Governance
  version: { type: Number, default: 1 },
  isLatest: { type: Boolean, default: true },
  previousVersion: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D" },

  tags: [String],
  extractedText: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model("Model3D", modelSchema);
