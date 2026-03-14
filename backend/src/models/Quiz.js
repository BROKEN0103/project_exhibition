const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    content: { type: mongoose.Schema.Types.ObjectId, ref: "Model3D", required: true },
    question: { type: String, required: true },
    options: [{ text: String, isCorrect: Boolean }],
    timestamp: { type: Number, default: 0 },
    explanation: String,
    responses: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        selectedOption: Number,
        isCorrect: Boolean,
        answeredAt: { type: Date, default: Date.now },
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

quizSchema.index({ content: 1 });
quizSchema.index({ content: 1, timestamp: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
