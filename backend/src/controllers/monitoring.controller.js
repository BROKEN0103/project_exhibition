const SecurityLog = require("../models/SecurityLog");

exports.getSecurityTrace = async (req, res) => {
    try {
        const logs = await SecurityLog.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'name email');

        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch security logs" });
    }
};

exports.getAnomalies = async (req, res) => {
    try {
        // Simple anomaly detection: Too many IP changes for a user in short time
        // Requirement: "Too many IP changes, Too many token refresh attempts, Multiple geolocation jumps"
        const anomalies = await SecurityLog.find({ isAnomaly: true })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(anomalies);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch anomalies" });
    }
};
