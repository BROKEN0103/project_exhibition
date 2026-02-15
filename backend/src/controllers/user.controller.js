const User = require("../models/User");
const Activity = require("../models/Activity");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { name, email },
            { new: true }
        ).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user.userId })
            .populate("user", "name email")
            .populate("document", "title")
            .sort({ createdAt: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
