const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const subscription = require("../middleware/subscription.middleware");
const fileManagement = require("../controllers/fileManagement.controller");

// File management routes
router.delete("/:id", auth, role(["admin", "editor"]), subscription("premium"), fileManagement.deleteModel);
router.put("/:id/move", auth, role(["admin", "editor"]), fileManagement.moveModel);
router.put("/:id/rename", auth, role(["admin", "editor"]), fileManagement.renameModel);
router.post("/:id/copy", auth, role(["admin", "editor"]), fileManagement.copyModel);
router.get("/:id/metadata", auth, fileManagement.getModelMetadata);

// Bulk operations - Enterprise features
router.post("/bulk/delete", auth, role(["admin", "editor"]), subscription("enterprise"), fileManagement.bulkDeleteModels);
router.post("/bulk/move", auth, role(["admin", "editor"]), subscription("enterprise"), fileManagement.bulkMoveModels);

// Statistics
router.get("/stats/storage", auth, fileManagement.getStorageStats);

module.exports = router;
