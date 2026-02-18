const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { authorize, contentLimiter } = require("../middleware/security.middleware");
const contentController = require("../controllers/content.controller");

// Get a protected access link (Requires Auth)
router.get("/access/:id", auth, contentLimiter, contentController.getAccessLink);

// The actual streaming link (Protected by Signature, no direct Auth header needed as it's in the URL)
router.get("/stream/:id", contentController.streamContent);

// HLS Routes (Requires Auth for Key)
router.get("/hls/key/:id", auth, (req, res) => {
    // Return encryption key ONLY to authenticated users with valid session
    // This is the "Secure key server"
    res.send(process.env.FILE_ENCRYPTION_KEY);
});

module.exports = router;
