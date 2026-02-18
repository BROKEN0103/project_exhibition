const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/security.middleware");
const upload = require("../middleware/upload.middleware");
const modelController = require("../controllers/model.controller");

// Upload: Content Manager or Admin
router.post("/", auth, authorize(["admin", "editor"]), upload.single("file"), modelController.uploadModel);

// Read: Any authenticated user
router.get("/", auth, modelController.getModels);
router.get("/:id", auth, modelController.getSingleModel);

module.exports = router;
