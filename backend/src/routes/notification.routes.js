const router = require("express").Router();
const { getNotifications, markAsRead, markAllAsRead } = require("../controllers/notification.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, getNotifications);
router.put("/mark-all-read", auth, markAllAsRead);
router.put("/:id/read", auth, markAsRead);

module.exports = router;
