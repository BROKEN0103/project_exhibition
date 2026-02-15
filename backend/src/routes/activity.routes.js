const router = require("express").Router();
const { getActivities } = require("../controllers/activity.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, getActivities);

module.exports = router;
