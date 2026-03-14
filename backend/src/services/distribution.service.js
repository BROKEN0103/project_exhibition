const DistributionJob = require("../models/DistributionJob");
const Model3D = require("../models/Model3D");

// Platform-specific formatting
const PLATFORM_CONFIGS = {
    twitter: { maxCaptionLength: 280, supportsVideo: true, supportsImage: true, maxHashtags: 5 },
    linkedin: { maxCaptionLength: 3000, supportsVideo: true, supportsImage: true, maxHashtags: 10 },
    youtube: { maxCaptionLength: 5000, supportsVideo: true, supportsImage: false, maxHashtags: 15 },
    tiktok: { maxCaptionLength: 2200, supportsVideo: true, supportsImage: false, maxHashtags: 5 },
    instagram: { maxCaptionLength: 2200, supportsVideo: true, supportsImage: true, maxHashtags: 30 },
};

// Create distribution job
async function createDistributionJob({ contentId, clipId, platform, caption, hashtags, scheduledAt, userId }) {
    const config = PLATFORM_CONFIGS[platform];
    if (!config) throw new Error(`Unsupported platform: ${platform}`);

    // Trim caption to platform limit
    const trimmedCaption = caption.substring(0, config.maxCaptionLength);
    const trimmedHashtags = (hashtags || []).slice(0, config.maxHashtags);

    const job = await DistributionJob.create({
        content: contentId,
        clip: clipId || null,
        platform,
        caption: trimmedCaption,
        hashtags: trimmedHashtags,
        scheduledAt: scheduledAt || new Date(),
        createdBy: userId,
        status: "scheduled",
    });

    return job;
}

// Process pending distribution jobs
async function processScheduledJobs() {
    const now = new Date();
    const pendingJobs = await DistributionJob.find({
        status: "scheduled",
        scheduledAt: { $lte: now },
    }).populate("content").populate("clip");

    for (const job of pendingJobs) {
        try {
            job.status = "processing";
            await job.save();

            // Simulate platform publishing (replace with real API integration)
            const result = await publishToPlatform(job);

            job.status = "published";
            job.publishedAt = new Date();
            job.externalUrl = result.url;
            job.externalId = result.id;
            await job.save();

        } catch (error) {
            job.retryCount += 1;
            job.errorMessage = error.message;

            if (job.retryCount >= job.maxRetries) {
                job.status = "failed";
            } else {
                job.status = "scheduled";
                job.scheduledAt = new Date(Date.now() + job.retryCount * 60000); // Exponential backoff
            }
            await job.save();
        }
    }

    return pendingJobs.length;
}

// Simulate platform publishing
async function publishToPlatform(job) {
    // In production, integrate with platform APIs: Twitter API, LinkedIn API, etc.
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
        id: `ext_${job.platform}_${Date.now()}`,
        url: `https://${job.platform}.com/post/${Date.now()}`,
    };
}

// Get distribution analytics for a user
async function getDistributionAnalytics(userId) {
    const jobs = await DistributionJob.find({ createdBy: userId });

    const breakdown = {};
    let totalViews = 0, totalLikes = 0, totalShares = 0;

    for (const job of jobs) {
        if (!breakdown[job.platform]) {
            breakdown[job.platform] = { published: 0, scheduled: 0, failed: 0, views: 0, likes: 0 };
        }
        breakdown[job.platform][job.status]++;
        breakdown[job.platform].views += job.metrics.views;
        breakdown[job.platform].likes += job.metrics.likes;
        totalViews += job.metrics.views;
        totalLikes += job.metrics.likes;
        totalShares += job.metrics.shares;
    }

    return {
        total: jobs.length,
        published: jobs.filter(j => j.status === "published").length,
        scheduled: jobs.filter(j => j.status === "scheduled").length,
        failed: jobs.filter(j => j.status === "failed").length,
        totalViews,
        totalLikes,
        totalShares,
        breakdown,
    };
}

// Cancel a distribution job
async function cancelJob(jobId, userId) {
    const job = await DistributionJob.findOne({ _id: jobId, createdBy: userId });
    if (!job) throw new Error("Job not found");
    if (job.status !== "scheduled") throw new Error("Can only cancel scheduled jobs");

    job.status = "cancelled";
    await job.save();
    return job;
}

module.exports = {
    createDistributionJob,
    processScheduledJobs,
    getDistributionAnalytics,
    cancelJob,
    PLATFORM_CONFIGS,
};
