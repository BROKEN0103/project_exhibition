const Model3D = require("../models/Model3D");
const Folder = require("../models/Folder");
const Workspace = require("../models/Workspace");
const { logActivity } = require("../utils/auditLogger");
const fs = require("fs");
const path = require("path");

// Delete a file
exports.deleteModel = async (req, res) => {
    try {
        const model = await Model3D.findById(req.params.id);
        if (!model) return res.status(404).json({ message: "File not found" });

        // Delete physical file
        const filePath = path.join(__dirname, "../../uploads", model.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await Model3D.findByIdAndDelete(req.params.id);

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            document: model._id,
            documentTitle: model.title,
            workspaceId: model.workspace,
            action: "delete",
            details: `Deleted file: ${model.title}`,
            ipAddress: req.ip
        });

        res.json({ message: "File deleted successfully", file: model });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Failed to delete file", error: err.message });
    }
};

// Move file to different folder or workspace
exports.moveModel = async (req, res) => {
    try {
        const { targetFolderId, targetWorkspaceId } = req.body;
        const model = await Model3D.findById(req.params.id);

        if (!model) return res.status(404).json({ message: "File not found" });

        const oldLocation = {
            workspace: model.workspace,
            folder: model.folder
        };

        // Update location
        if (targetWorkspaceId !== undefined) model.workspace = targetWorkspaceId;
        if (targetFolderId !== undefined) model.folder = targetFolderId || null;

        await model.save();

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            document: model._id,
            documentTitle: model.title,
            workspaceId: model.workspace,
            action: "role_change",
            details: `Moved file from workspace ${oldLocation.workspace} to ${model.workspace}`,
            ipAddress: req.ip
        });

        res.json({ message: "File moved successfully", file: model });
    } catch (err) {
        console.error("Move error:", err);
        res.status(500).json({ message: "Failed to move file", error: err.message });
    }
};

// Rename file
exports.renameModel = async (req, res) => {
    try {
        const { newTitle, newDescription } = req.body;
        const model = await Model3D.findById(req.params.id);

        if (!model) return res.status(404).json({ message: "File not found" });

        const oldTitle = model.title;

        if (newTitle) model.title = newTitle;
        if (newDescription !== undefined) model.description = newDescription;

        await model.save();

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            document: model._id,
            documentTitle: model.title,
            workspaceId: model.workspace,
            action: "role_change", // Reusing role_change or define 'update'
            details: `Renamed file from "${oldTitle}" to "${newTitle}"`,
            ipAddress: req.ip
        });

        res.json({ message: "File renamed successfully", file: model });
    } catch (err) {
        console.error("Rename error:", err);
        res.status(500).json({ message: "Failed to rename file", error: err.message });
    }
};

// Bulk delete files
exports.bulkDeleteModels = async (req, res) => {
    try {
        const { fileIds } = req.body;

        if (!Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({ message: "fileIds must be a non-empty array" });
        }

        const models = await Model3D.find({ _id: { $in: fileIds } });

        // Delete physical files
        for (const model of models) {
            const filePath = path.join(__dirname, "../../uploads", model.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete from database
        const result = await Model3D.deleteMany({ _id: { $in: fileIds } });

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            action: "delete",
            details: `Bulk deleted ${result.deletedCount} files`,
            ipAddress: req.ip
        });

        res.json({
            message: `Successfully deleted ${result.deletedCount} files`,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        console.error("Bulk delete error:", err);
        res.status(500).json({ message: "Failed to bulk delete files", error: err.message });
    }
};

// Bulk move files
exports.bulkMoveModels = async (req, res) => {
    try {
        const { fileIds, targetFolderId, targetWorkspaceId } = req.body;

        if (!Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({ message: "fileIds must be a non-empty array" });
        }

        const updateData = {};
        if (targetWorkspaceId !== undefined) updateData.workspace = targetWorkspaceId;
        if (targetFolderId !== undefined) updateData.folder = targetFolderId || null;

        const result = await Model3D.updateMany(
            { _id: { $in: fileIds } },
            { $set: updateData }
        );

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            action: "role_change",
            details: `Bulk moved ${result.modifiedCount} files`,
            ipAddress: req.ip
        });

        res.json({
            message: `Successfully moved ${result.modifiedCount} files`,
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        console.error("Bulk move error:", err);
        res.status(500).json({ message: "Failed to bulk move files", error: err.message });
    }
};

// Get file metadata and details
exports.getModelMetadata = async (req, res) => {
    try {
        const model = await Model3D.findById(req.params.id)
            .populate("uploadedBy", "name email")
            .populate("workspace", "name")
            .populate("folder", "name path");

        if (!model) return res.status(404).json({ message: "File not found" });

        // Get file stats if exists
        const filePath = path.join(__dirname, "../../uploads", model.fileUrl);
        let fileExists = false;
        let fileStats = null;

        if (fs.existsSync(filePath)) {
            fileExists = true;
            fileStats = fs.statSync(filePath);
        }

        res.json({
            ...model.toObject(),
            fileExists,
            fileStats: fileStats ? {
                size: fileStats.size,
                created: fileStats.birthtime,
                modified: fileStats.mtime
            } : null
        });
    } catch (err) {
        console.error("Metadata error:", err);
        res.status(500).json({ message: "Failed to get file metadata", error: err.message });
    }
};

// Copy file
exports.copyModel = async (req, res) => {
    try {
        const { targetFolderId, targetWorkspaceId, newTitle } = req.body;
        const originalModel = await Model3D.findById(req.params.id);

        if (!originalModel) return res.status(404).json({ message: "File not found" });

        // Copy physical file
        const originalPath = path.join(__dirname, "../../uploads", originalModel.fileUrl);
        const newFileName = `${Date.now()}-copy-${path.basename(originalModel.fileUrl)}`;
        const newPath = path.join(__dirname, "../../uploads", newFileName);

        if (fs.existsSync(originalPath)) {
            fs.copyFileSync(originalPath, newPath);
        }

        // Create new database entry
        const newModel = await Model3D.create({
            title: newTitle || `${originalModel.title} (Copy)`,
            description: originalModel.description,
            fileUrl: newFileName,
            mimeType: originalModel.mimeType,
            size: originalModel.size,
            uploadedBy: req.user.userId,
            workspace: targetWorkspaceId || originalModel.workspace,
            folder: targetFolderId !== undefined ? targetFolderId : originalModel.folder,
            isEncrypted: originalModel.isEncrypted,
            tags: originalModel.tags,
            metadata: originalModel.metadata
        });

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            document: newModel._id,
            documentTitle: newModel.title,
            workspaceId: newModel.workspace,
            action: "upload",
            details: `Copied file: ${originalModel.title}`,
            ipAddress: req.ip
        });

        res.json({ message: "File copied successfully", file: newModel });
    } catch (err) {
        console.error("Copy error:", err);
        res.status(500).json({ message: "Failed to copy file", error: err.message });
    }
};

// Get storage statistics for workspace or folder
exports.getStorageStats = async (req, res) => {
    try {
        const { workspaceId, folderId } = req.query;

        const filter = {};
        if (workspaceId) filter.workspace = workspaceId;
        if (folderId) filter.folder = folderId;

        const models = await Model3D.find(filter);

        const stats = {
            totalFiles: models.length,
            totalSize: models.reduce((sum, m) => sum + (m.size || 0), 0),
            fileTypes: {},
            encryptedCount: models.filter(m => m.isEncrypted).length,
            latestFiles: models.filter(m => m.isLatest).length
        };

        // Group by file type
        models.forEach(m => {
            const type = m.mimeType || 'unknown';
            if (!stats.fileTypes[type]) {
                stats.fileTypes[type] = { count: 0, size: 0 };
            }
            stats.fileTypes[type].count++;
            stats.fileTypes[type].size += m.size || 0;
        });

        res.json(stats);
    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ message: "Failed to get storage stats", error: err.message });
    }
};
