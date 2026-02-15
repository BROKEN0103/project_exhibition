const Folder = require("../models/Folder");
const Model3D = require("../models/Model3D");
const { logActivity } = require("../utils/auditLogger");

// Delete folder (and optionally its contents)
exports.deleteFolder = async (req, res) => {
    try {
        const { deleteContents } = req.query; // If true, delete all files in folder
        const folder = await Folder.findById(req.params.id);

        if (!folder) return res.status(404).json({ message: "Folder not found" });

        // Check if folder has files
        const filesInFolder = await Model3D.countDocuments({ folder: req.params.id });

        if (filesInFolder > 0 && deleteContents !== 'true') {
            return res.status(400).json({
                message: "Folder contains files. Set deleteContents=true to delete all contents.",
                fileCount: filesInFolder
            });
        }

        // Delete all files in folder if requested
        if (deleteContents === 'true') {
            await Model3D.deleteMany({ folder: req.params.id });
        }

        // Delete all subfolders
        await Folder.deleteMany({ parent: req.params.id });

        // Delete the folder itself
        await Folder.findByIdAndDelete(req.params.id);

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId: folder.workspace,
            action: "delete",
            details: `Deleted folder: ${folder.name}${deleteContents === 'true' ? ' with contents' : ''}`,
            ipAddress: req.ip
        });

        res.json({ message: "Folder deleted successfully", folder });
    } catch (err) {
        console.error("Delete folder error:", err);
        res.status(500).json({ message: "Failed to delete folder", error: err.message });
    }
};

// Rename folder
exports.renameFolder = async (req, res) => {
    try {
        const { newName } = req.body;
        const folder = await Folder.findById(req.params.id);

        if (!folder) return res.status(404).json({ message: "Folder not found" });

        const oldName = folder.name;
        folder.name = newName;
        await folder.save();

        // Update paths of all subfolders
        const subfolders = await Folder.find({ parent: req.params.id });
        for (const subfolder of subfolders) {
            subfolder.path = `${folder.path}${newName}/`;
            await subfolder.save();
        }

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId: folder.workspace,
            action: "role_change",
            details: `Renamed folder from "${oldName}" to "${newName}"`,
            ipAddress: req.ip
        });

        res.json({ message: "Folder renamed successfully", folder });
    } catch (err) {
        console.error("Rename folder error:", err);
        res.status(500).json({ message: "Failed to rename folder", error: err.message });
    }
};

// Move folder to different parent or workspace
exports.moveFolder = async (req, res) => {
    try {
        const { targetParentId, targetWorkspaceId } = req.body;
        const folder = await Folder.findById(req.params.id);

        if (!folder) return res.status(404).json({ message: "Folder not found" });

        // Prevent moving folder into itself or its descendants
        if (targetParentId) {
            let checkParent = await Folder.findById(targetParentId);
            while (checkParent) {
                if (checkParent._id.toString() === req.params.id) {
                    return res.status(400).json({ message: "Cannot move folder into itself or its descendants" });
                }
                checkParent = checkParent.parent ? await Folder.findById(checkParent.parent) : null;
            }
        }

        const oldLocation = {
            parent: folder.parent,
            workspace: folder.workspace,
            path: folder.path
        };

        // Update folder location
        if (targetWorkspaceId !== undefined) folder.workspace = targetWorkspaceId;
        if (targetParentId !== undefined) {
            folder.parent = targetParentId || null;

            // Update path
            if (targetParentId) {
                const newParent = await Folder.findById(targetParentId);
                folder.path = `${newParent.path}${newParent.name}/`;
            } else {
                folder.path = "/";
            }
        }

        await folder.save();

        // Update all files in this folder
        await Model3D.updateMany(
            { folder: req.params.id },
            { workspace: folder.workspace }
        );

        // Update all subfolders recursively
        const updateSubfolders = async (folderId, newWorkspace, newPath) => {
            const subfolders = await Folder.find({ parent: folderId });
            for (const subfolder of subfolders) {
                subfolder.workspace = newWorkspace;
                subfolder.path = `${newPath}${folder.name}/`;
                await subfolder.save();
                await Model3D.updateMany({ folder: subfolder._id }, { workspace: newWorkspace });
                await updateSubfolders(subfolder._id, newWorkspace, subfolder.path);
            }
        };

        await updateSubfolders(req.params.id, folder.workspace, folder.path);

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId: folder.workspace,
            action: "role_change",
            details: `Moved folder: ${folder.name}`,
            ipAddress: req.ip
        });

        res.json({ message: "Folder moved successfully", folder });
    } catch (err) {
        console.error("Move folder error:", err);
        res.status(500).json({ message: "Failed to move folder", error: err.message });
    }
};

// Get folder contents (files and subfolders)
exports.getFolderContents = async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id)
            .populate("workspace", "name")
            .populate("createdBy", "name email");

        if (!folder) return res.status(404).json({ message: "Folder not found" });

        const [subfolders, files] = await Promise.all([
            Folder.find({ parent: req.params.id }),
            Model3D.find({ folder: req.params.id }).populate("uploadedBy", "name email")
        ]);

        res.json({
            folder,
            subfolders,
            files,
            stats: {
                subfolderCount: subfolders.length,
                fileCount: files.length,
                totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0)
            }
        });
    } catch (err) {
        console.error("Get folder contents error:", err);
        res.status(500).json({ message: "Failed to get folder contents", error: err.message });
    }
};

// Get folder tree (hierarchical structure)
exports.getFolderTree = async (req, res) => {
    try {
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({ message: "workspaceId is required" });
        }

        const buildTree = async (parentId = null) => {
            const folders = await Folder.find({
                workspace: workspaceId,
                parent: parentId
            });

            const tree = [];
            for (const folder of folders) {
                const fileCount = await Model3D.countDocuments({ folder: folder._id });
                const children = await buildTree(folder._id);

                tree.push({
                    ...folder.toObject(),
                    fileCount,
                    children
                });
            }

            return tree;
        };

        const tree = await buildTree();
        res.json(tree);
    } catch (err) {
        console.error("Get folder tree error:", err);
        res.status(500).json({ message: "Failed to get folder tree", error: err.message });
    }
};

// Copy folder (and optionally its contents)
exports.copyFolder = async (req, res) => {
    try {
        const { targetParentId, targetWorkspaceId, newName, copyContents } = req.body;
        const originalFolder = await Folder.findById(req.params.id);

        if (!originalFolder) return res.status(404).json({ message: "Folder not found" });

        // Determine new path
        let newPath = "/";
        if (targetParentId) {
            const targetParent = await Folder.findById(targetParentId);
            if (targetParent) {
                newPath = `${targetParent.path}${targetParent.name}/`;
            }
        }

        // Create new folder
        const newFolder = await Folder.create({
            name: newName || `${originalFolder.name} (Copy)`,
            workspace: targetWorkspaceId || originalFolder.workspace,
            parent: targetParentId || originalFolder.parent,
            path: newPath,
            createdBy: req.user.userId
        });

        // Copy contents if requested
        if (copyContents) {
            // Copy files
            const files = await Model3D.find({ folder: req.params.id });
            for (const file of files) {
                await Model3D.create({
                    title: file.title,
                    description: file.description,
                    fileUrl: file.fileUrl, // Note: This shares the same physical file
                    mimeType: file.mimeType,
                    size: file.size,
                    uploadedBy: req.user.userId,
                    workspace: newFolder.workspace,
                    folder: newFolder._id,
                    tags: file.tags,
                    metadata: file.metadata
                });
            }

            // Copy subfolders recursively
            const subfolders = await Folder.find({ parent: req.params.id });
            for (const subfolder of subfolders) {
                // Recursive copy would go here
                // For simplicity, we're only copying one level
            }
        }

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId: newFolder.workspace,
            action: "upload",
            details: `Copied folder: ${originalFolder.name}`,
            ipAddress: req.ip
        });

        res.json({ message: "Folder copied successfully", folder: newFolder });
    } catch (err) {
        console.error("Copy folder error:", err);
        res.status(500).json({ message: "Failed to copy folder", error: err.message });
    }
};
