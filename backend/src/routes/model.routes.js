const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const modelController = require("../controllers/model.controller");

router.post("/", auth, upload.single("file"), modelController.uploadModel);
router.get("/", auth, modelController.getModels);
router.get("/versions", auth, modelController.getVersions);
router.post("/rollback/:id", auth, modelController.rollbackVersion);
router.get("/:id", auth, modelController.getSingleModel);
router.get("/:id/download", auth, modelController.downloadModel);

module.exports = router;
