const router = require("express").Router();
const { signup, login, refreshToken, logout, verify2FA } = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");
const { loginLimiter } = require("../middleware/security.middleware");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// TEMPORARY DEBUG endpoint — remove after fixing login
router.get("/debug-admin", async (req, res) => {
  try {
    const user = await User.findOne({ email: "admin@vault.io" });
    if (!user) return res.json({ found: false, message: "admin@vault.io NOT FOUND in database" });
    
    const passwordMatch = await bcrypt.compare("demo", user.password);
    res.json({
      found: true,
      id: user._id,
      email: user.email,
      role: user.role,
      loginAttempts: user.loginAttempts,
      lockUntil: user.lockUntil,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      passwordHashLength: user.password?.length,
      passwordMatch,
      hasPassword: !!user.password
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public auth routes — temporarily removed loginLimiter for debugging
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-2fa", verify2FA);

// Session management
router.post("/refresh-token", refreshToken);
router.post("/logout", auth, logout);

module.exports = router;
