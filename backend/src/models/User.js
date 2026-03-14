const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "editor", "viewer"], default: "viewer" },

  // Security & Authentication
  twoFactorSecret: String,
  isTwoFactorEnabled: { type: Boolean, default: true },
  otpSecret: String, // Temporary OTP for login
  otpExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // Subscription & Access Control
  subscriptionStatus: {
    type: String,
    enum: ["free", "premium", "enterprise"],
    default: "free"
  },
  subscriptionExpiresAt: Date,

  // Encryption & Key Management
  masterKeyHash: String, // Used for E2EE key derivation check
}, { timestamps: true });

// methods for locking account
userSchema.methods.incrementLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // lock for 2 hours
  }
  return this.updateOne(updates);
};

module.exports = mongoose.model("User", userSchema);
