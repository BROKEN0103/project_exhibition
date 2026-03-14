const Clip = require("../models/Clip");
const Model3D = require("../models/Model3D");

// Detect highlights in content (simulated AI analysis)
async function detectHighlights(contentId) {
    const content = await Model3D.findById(contentId);
    if (!content) throw new Error("Content not found");

    // In production: use ffprobe for duration, ML models for highlight detection
    // Simulated highlight detection based on content metadata
    const duration = content.metadata?.duration || 300; // default 5 min
    const numClips = Math.min(Math.floor(duration / 60), 5);

    const highlights = [];
    for (let i = 0; i < numClips; i++) {
        const startTime = Math.floor((duration / (numClips + 1)) * (i + 1)) - 15;
        const clipDuration = 15 + Math.floor(Math.random() * 45); // 15-60 seconds

        highlights.push({
            startTime: Math.max(0, startTime),
            endTime: Math.min(startTime + clipDuration, duration),
            duration: clipDuration,
            score: 0.6 + Math.random() * 0.4,
            reason: ["High engagement moment", "Peak audio energy", "Visual transition", "Key topic segment"][i % 4],
        });
    }

    return highlights.sort((a, b) => b.score - a.score);
}

// Generate clips from highlights
async function generateClips(contentId, userId, highlights) {
    const clips = [];

    for (let i = 0; i < highlights.length; i++) {
        const h = highlights[i];
        const clip = await Clip.create({
            sourceContent: contentId,
            title: `Clip ${i + 1} - ${h.reason}`,
            startTime: h.startTime,
            endTime: h.endTime,
            duration: h.endTime - h.startTime,
            format: "portrait",
            status: "ready", // In production: set to "processing" and run ffmpeg
            aiScore: h.score,
            tags: [],
            createdBy: userId,
        });

        clips.push(clip);
    }

    return clips;
}

// Get clips for a content item
async function getClipsByContent(contentId) {
    return Clip.find({ sourceContent: contentId })
        .sort({ aiScore: -1 })
        .populate("createdBy", "name email");
}

// Get all clips for a user
async function getUserClips(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const clips = await Clip.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sourceContent", "title mimeType");

    const total = await Clip.countDocuments({ createdBy: userId });
    return { clips, total, page, pages: Math.ceil(total / limit) };
}

// Update clip details
async function updateClip(clipId, userId, updates) {
    const clip = await Clip.findOne({ _id: clipId, createdBy: userId });
    if (!clip) throw new Error("Clip not found or unauthorized");

    Object.assign(clip, updates);
    await clip.save();
    return clip;
}

// Delete a clip
async function deleteClip(clipId, userId) {
    const clip = await Clip.findOneAndDelete({ _id: clipId, createdBy: userId });
    if (!clip) throw new Error("Clip not found or unauthorized");
    return clip;
}

module.exports = {
    detectHighlights,
    generateClips,
    getClipsByContent,
    getUserClips,
    updateClip,
    deleteClip,
};
