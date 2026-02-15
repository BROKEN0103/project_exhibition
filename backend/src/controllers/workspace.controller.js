const Workspace = require("../models/Workspace");
const User = require("../models/User");
const { logActivity } = require("../utils/auditLogger");

exports.createWorkspace = async (req, res) => {
    const { name, description } = req.body;
    try {
        const workspace = await Workspace.create({
            name,
            description,
            owner: req.user.userId,
            members: [{ user: req.user.userId, role: "admin" }]
        });

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId: workspace._id,
            action: "role_change",
            details: `Created workspace: ${name}`,
            ipAddress: req.ip
        });

        res.status(201).json(workspace);
    } catch (err) {
        res.status(500).json({ message: "Failed to create workspace", error: err.message });
    }
};

exports.getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            $or: [
                { owner: req.user.userId },
                { "members.user": req.user.userId }
            ]
        }).populate("owner", "name email").populate("members.user", "name email");
        res.json(workspaces);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch workspaces", error: err.message });
    }
};

exports.inviteMember = async (req, res) => {
    const { workspaceId, email, role } = req.body;
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Only owner or admin can invite
        const isAuthorized = workspace.owner.toString() === req.user.userId ||
            workspace.members.some(m => m.user.toString() === req.user.userId && m.role === "admin");

        if (!isAuthorized) return res.status(403).json({ message: "Unauthorized" });

        const userToInvite = await User.findOne({ email: email.toLowerCase() });
        if (!userToInvite) return res.status(404).json({ message: "User not found" });

        // Check if already a member
        if (workspace.members.some(m => m.user.toString() === userToInvite._id.toString())) {
            return res.status(400).json({ message: "User is already a member" });
        }

        workspace.members.push({ user: userToInvite._id, role: role || "viewer" });
        await workspace.save();

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            workspaceId,
            action: "role_change",
            details: `Invited ${email} as ${role || 'viewer'}`,
            ipAddress: req.ip
        });

        res.json({ message: "User added successfully", user: userToInvite });
    } catch (err) {
        res.status(500).json({ message: "Invitation failed", error: err.message });
    }
};
