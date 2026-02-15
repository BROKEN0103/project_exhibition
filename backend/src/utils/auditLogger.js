const Activity = require("../models/Activity");

const logActivity = async ({ user, userName, document, documentTitle, workspaceId, action, details, ipAddress, userAgent, granted = true }) => {
    try {
        console.log(`[AuditLogger] Logging activity: ${action} by ${userName} (ID: ${user})`);
        const activity = await Activity.create({
            user,
            userName,
            document,
            documentTitle,
            workspaceId,
            action,
            details,
            ipAddress,
            userAgent,
            granted
        });
        console.log(`[AuditLogger] Activity created with ID: ${activity._id}`);
    } catch (err) {
        console.error("Failed to log activity:", err);
    }
};

module.exports = { logActivity };
