const router = require("express").Router();
const { createWorkspace, getWorkspaces, inviteMember } = require("../controllers/workspace.controller");
const workspaceManagement = require("../controllers/workspaceManagement.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

// Basic workspace operations
router.post("/", auth, role(["admin", "editor"]), createWorkspace);
router.get("/", auth, getWorkspaces);
router.post("/invite", auth, inviteMember);

// Workspace management operations
router.delete("/:id", auth, workspaceManagement.deleteWorkspace);
router.put("/:id", auth, workspaceManagement.updateWorkspace);
router.post("/remove-member", auth, workspaceManagement.removeMember);
router.post("/update-role", auth, workspaceManagement.updateMemberRole);
router.post("/transfer-ownership", auth, workspaceManagement.transferOwnership);
router.get("/:id/stats", auth, workspaceManagement.getWorkspaceStats);

module.exports = router;
