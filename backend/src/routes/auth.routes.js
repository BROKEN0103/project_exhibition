const router = require("express").Router();
const { signup, login } = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-2fa", require("../controllers/auth.controller").verify2FA);

module.exports = router;
