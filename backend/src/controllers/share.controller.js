const ShareLink = require("../models/ShareLink");
const crypto = require("crypto");
const { logActivity } = require("../utils/auditLogger");

exports.createShareLink = async (req, res) => {
    const { documentId, password, expiresAt, maxDownloads } = req.body;
    try {
        const token = crypto.randomBytes(32).toString("hex");

        let passwordHash = null;
        if (password) {
            const bcrypt = require("bcryptjs");
            passwordHash = await bcrypt.hash(password, 10);
        }

        const shareLink = await ShareLink.create({
            document: documentId,
            createdBy: req.user.userId,
            token,
            passwordHash,
            expiresAt,
            maxDownloads: maxDownloads || 0
        });

        logActivity({
            user: req.user.userId,
            userName: req.user.name,
            document: documentId,
            action: "share_link_create",
            details: `Created secure share link`,
            ipAddress: req.ip
        });

        res.status(201).json({ token, expiresAt, maxDownloads });
    } catch (err) {
        res.status(500).json({ message: "Failed to create share link", error: err.message });
    }
};

exports.getShareLinkContent = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const shareLink = await ShareLink.findOne({ token, isActive: true }).populate("document");
        if (!shareLink) return res.status(404).json({ message: "Link not found or inactive" });

        if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
            return res.status(410).json({ message: "Link expired" });
        }

        if (shareLink.maxDownloads > 0 && shareLink.downloadCount >= shareLink.maxDownloads) {
            return res.status(410).json({ message: "Download limit reached" });
        }

        if (shareLink.passwordHash) {
            const bcrypt = require("bcryptjs");
            const isMatch = await bcrypt.compare(password, shareLink.passwordHash);
            if (!isMatch) return res.status(401).json({ message: "Incorrect password" });
        }

        // Success - update download count
        shareLink.downloadCount += 1;
        await shareLink.save();

        logActivity({
            document: shareLink.document._id,
            documentTitle: shareLink.document.title,
            action: "download",
            details: "Accessed via share link",
            ipAddress: req.ip
        });

        res.json(shareLink.document);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
