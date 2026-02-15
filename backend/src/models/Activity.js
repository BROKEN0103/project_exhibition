const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  document: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D" },
  documentTitle: String,
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  action: {
    type: String,
    enum: ["view", "download", "upload", "delete", "role_change", "login", "login_2fa", "failed_login", "share_link_create", "2fa_enable"]
  },
  details: String,
  ipAddress: String,
  userAgent: String,
  granted: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
