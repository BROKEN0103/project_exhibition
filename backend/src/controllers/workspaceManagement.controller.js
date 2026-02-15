const Workspace = require("../models/Workspace");
const Folder = require("../models/Folder");
const Model3D = require("../models/Model3D");
const { logActivity } = require("../utils/auditLogger");

// Delete workspace (and optionally all its contents)
exports.deleteWorkspace = async (req, res) => {
    try {
        const { deleteContents } = req.query;
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Check if user is owner
        if (workspace.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Only workspace owner can delete workspace" });
        }

        // Check if workspace has content
        const [folderCount, fileCount] = await Promise.all([
            Folder.countDocuments({ workspace: req.params.id }),
            Model3D.countDocuments({ workspace: req.params.id })
        ]);

        if ((folderCount > 0 || fileCount > 0) && deleteContents !== 'true') {
            return res.status(400).json({
                message: "Workspace contains content. Set deleteContents=true to delete all contents.",
                folderCount,
                fileCount
            });
        }

        // Delete all contents if requested
        if (deleteContents === 'true') {
            await Promise.all([
                Folder.deleteMany({ workspace: req.params.id }),
                Model3D.deleteMany({ workspace: req.params.id })
            ]);
        }

        // Delete workspace
        await Workspace.findByIdAndDelete(req.params.id);

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId: req.params.id,
            action: "delete",
            details: `Deleted workspace: ${workspace.name}${deleteContents === 'true' ? ' with all contents' : ''}`,
            ipAddress: req.ip
        });

        res.json({ message: "Workspace deleted successfully", workspace });
    } catch (err) {
        console.error("Delete workspace error:", err);
        res.status(500).json({ message: "Failed to delete workspace", error: err.message });
    }
};

// Update workspace details
exports.updateWorkspace = async (req, res) => {
    try {
        const { name, description, settings } = req.body;
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Check if user is owner or admin
        const isAuthorized = workspace.owner.toString() === req.user.userId ||
            workspace.members.some(m => m.user.toString() === req.user.userId && m.role === "admin");

        if (!isAuthorized) return res.status(403).json({ message: "Unauthorized" });

        if (name) workspace.name = name;
        if (description !== undefined) workspace.description = description;
        if (settings) workspace.settings = { ...workspace.settings, ...settings };

        await workspace.save();

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId: req.params.id,
            action: "role_change",
            details: `Updated workspace: ${workspace.name}`,
            ipAddress: req.ip
        });

        res.json({ message: "Workspace updated successfully", workspace });
    } catch (err) {
        console.error("Update workspace error:", err);
        res.status(500).json({ message: "Failed to update workspace", error: err.message });
    }
};

// Remove member from workspace
exports.removeMember = async (req, res) => {
    try {
        const { workspaceId, userId } = req.body;
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Check if user is owner or admin
        const isAuthorized = workspace.owner.toString() === req.user.userId ||
            workspace.members.some(m => m.user.toString() === req.user.userId && m.role === "admin");

        if (!isAuthorized) return res.status(403).json({ message: "Unauthorized" });

        // Cannot remove owner
        if (workspace.owner.toString() === userId) {
            return res.status(400).json({ message: "Cannot remove workspace owner" });
        }

        // Remove member
        workspace.members = workspace.members.filter(m => m.user.toString() !== userId);
        await workspace.save();

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId,
            action: "role_change",
            details: `Removed member from workspace`,
            ipAddress: req.ip
        });

        res.json({ message: "Member removed successfully", workspace });
    } catch (err) {
        console.error("Remove member error:", err);
        res.status(500).json({ message: "Failed to remove member", error: err.message });
    }
};

// Update member role
exports.updateMemberRole = async (req, res) => {
    try {
        const { workspaceId, userId, newRole } = req.body;
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Check if user is owner or admin
        const isAuthorized = workspace.owner.toString() === req.user.userId ||
            workspace.members.some(m => m.user.toString() === req.user.userId && m.role === "admin");

        if (!isAuthorized) return res.status(403).json({ message: "Unauthorized" });

        // Cannot change owner role
        if (workspace.owner.toString() === userId) {
            return res.status(400).json({ message: "Cannot change workspace owner role" });
        }

        // Update role
        const member = workspace.members.find(m => m.user.toString() === userId);
        if (!member) return res.status(404).json({ message: "Member not found" });

        member.role = newRole;
        await workspace.save();

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId,
            action: "role_change",
            details: `Updated member role to ${newRole}`,
            ipAddress: req.ip
        });

        res.json({ message: "Member role updated successfully", workspace });
    } catch (err) {
        console.error("Update member role error:", err);
        res.status(500).json({ message: "Failed to update member role", error: err.message });
    }
};

// Get workspace statistics
exports.getWorkspaceStats = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate("owner", "name email")
            .populate("members.user", "name email");

        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Check if user has access
        const hasAccess = workspace.owner.toString() === req.user.userId ||
            workspace.members.some(m => m.user.toString() === req.user.userId);

        if (!hasAccess) return res.status(403).json({ message: "Unauthorized" });

        const [folders, files] = await Promise.all([
            Folder.find({ workspace: req.params.id }),
            Model3D.find({ workspace: req.params.id })
        ]);

        const stats = {
            workspace,
            folderCount: folders.length,
            fileCount: files.length,
            totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
            storageUsedPercentage: workspace.settings.storageLimit
                ? (files.reduce((sum, f) => sum + (f.size || 0), 0) / workspace.settings.storageLimit) * 100
                : 0,
            memberCount: workspace.members.length,
            encryptedFileCount: files.filter(f => f.isEncrypted).length,
            fileTypes: {}
        };

        // Group files by type
        files.forEach(f => {
            const type = f.mimeType || 'unknown';
            if (!stats.fileTypes[type]) {
                stats.fileTypes[type] = { count: 0, size: 0 };
            }
            stats.fileTypes[type].count++;
            stats.fileTypes[type].size += f.size || 0;
        });

        res.json(stats);
    } catch (err) {
        console.error("Get workspace stats error:", err);
        res.status(500).json({ message: "Failed to get workspace stats", error: err.message });
    }
};

// Transfer workspace ownership
exports.transferOwnership = async (req, res) => {
    try {
        const { workspaceId, newOwnerId } = req.body;
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Only current owner can transfer
        if (workspace.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Only workspace owner can transfer ownership" });
        }

        // New owner must be a member
        const newOwnerMember = workspace.members.find(m => m.user.toString() === newOwnerId);
        if (!newOwnerMember) {
            return res.status(400).json({ message: "New owner must be a workspace member" });
        }

        // Transfer ownership
        const oldOwnerId = workspace.owner;
        workspace.owner = newOwnerId;

        // Make new owner admin if not already
        newOwnerMember.role = "admin";

        // Add old owner as admin member if not already in members
        const oldOwnerMember = workspace.members.find(m => m.user.toString() === oldOwnerId.toString());
        if (!oldOwnerMember) {
            workspace.members.push({ user: oldOwnerId, role: "admin" });
        }

        await workspace.save();

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId,
            action: "role_change",
            details: `Transferred workspace ownership`,
            ipAddress: req.ip
        });

        res.json({ message: "Ownership transferred successfully", workspace });
    } catch (err) {
        console.error("Transfer ownership error:", err);
        res.status(500).json({ message: "Failed to transfer ownership", error: err.message });
    }
};
