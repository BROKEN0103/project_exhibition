const router = require("express").Router();
const { createShareLink, getShareLinkContent } = require("../controllers/share.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, createShareLink);
router.post("/:token", getShareLinkContent); // Public but password protected

module.exports = router;
