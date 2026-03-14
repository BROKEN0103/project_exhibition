const mongoose = require("mongoose");

const contentEmbeddingSchema = new mongoose.Schema({
    content: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D", required: true },
    vector: { type: [Number], required: true },
    textChunk: { type: String, required: true },
    chunkIndex: { type: Number, default: 0 },
    model: { type: String, default: "text-embedding-3-small" },
    dimensions: { type: Number, default: 256 },
}, { timestamps: true });

contentEmbeddingSchema.index({ content: 1 });
contentEmbeddingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ContentEmbedding", contentEmbeddingSchema);
