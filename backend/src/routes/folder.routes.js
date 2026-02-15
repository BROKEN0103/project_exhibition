const router = require("express").Router();
const { createFolder, getFolders } = require("../controllers/folder.controller");
const folderManagement = require("../controllers/folderManagement.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

// Basic folder operations
router.post("/", auth, role(["admin", "editor"]), createFolder);
router.get("/", auth, getFolders);

// Folder management operations
router.delete("/:id", auth, role(["admin", "editor"]), folderManagement.deleteFolder);
router.put("/:id/rename", auth, role(["admin", "editor"]), folderManagement.renameFolder);
router.put("/:id/move", auth, role(["admin", "editor"]), folderManagement.moveFolder);
router.post("/:id/copy", auth, role(["admin", "editor"]), folderManagement.copyFolder);
router.get("/:id/contents", auth, folderManagement.getFolderContents);
router.get("/tree/view", auth, folderManagement.getFolderTree);

module.exports = router;
