const router = require("express").Router();
const { signup, login, refreshToken, logout, verify2FA } = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");
const { loginLimiter } = require("../middleware/security.middleware");

// Public auth routes with throttling
router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.post("/verify-2fa", loginLimiter, verify2FA);

// Session management
router.post("/refresh-token", refreshToken);
router.post("/logout", auth, logout);

module.exports = router;
