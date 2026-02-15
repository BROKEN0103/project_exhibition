const Folder = require("../models/Folder");
const { logActivity } = require("../utils/auditLogger");

exports.createFolder = async (req, res) => {
    const { name, workspaceId, parentId } = req.body;
    try {
        let path = "/";
        if (parentId) {
            const parent = await Folder.findById(parentId);
            if (parent) {
                path = `${parent.path}${parent.name}/`;
            }
        }

        const folder = await Folder.create({
            name,
            workspace: workspaceId,
            parent: parentId || null,
            path,
            createdBy: req.user.userId
        });

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId,
            action: "upload", // Generic action for creation
            details: `Created folder: ${name}`,
            ipAddress: req.ip
        });

        res.status(201).json(folder);
    } catch (err) {
        res.status(500).json({ message: "Failed to create folder", error: err.message });
    }
};

exports.getFolders = async (req, res) => {
    const { workspaceId, parentId } = req.query;
    try {
        const folders = await Folder.find({
            workspace: workspaceId,
            parent: parentId || null
        });
        res.json(folders);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch folders", error: err.message });
    }
};
