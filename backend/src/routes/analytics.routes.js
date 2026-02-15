const router = require("express").Router();
const { getAnalytics } = require("../controllers/analytics.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", auth, role(["admin"]), getAnalytics);

module.exports = router;
