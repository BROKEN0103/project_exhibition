const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Model3D = require("../models/Model3D");
const pdf = require("pdf-parse");
const fs = require("fs");
const { upsertDocument } = require("../utils/vectorStore");

async function indexExisting() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for re-indexing...");

        const models = await Model3D.find({ mimeType: "application/pdf" });
        console.log(`Found ${models.length} PDFs to index.`);

        for (const model of models) {
            console.log(`Processing: ${model.title}...`);
            const filePath = path.join(__dirname, "../../uploads", model.fileUrl);

            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${filePath}`);
                continue;
            }

            try {
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdf(dataBuffer);
                const text = data.text;

                const chunkSize = 1000;
                const chunks = [];
                for (let i = 0; i < text.length; i += chunkSize) {
                    chunks.push(text.slice(i, i + chunkSize));
                }

                for (let j = 0; j < chunks.length; j++) {
                    await upsertDocument(
                        `${model._id}_${j}`,
                        chunks[j],
                        {
                            documentId: model._id.toString(),
                            documentTitle: model.title,
                            workspaceId: model.workspace.toString(),
                            chunkIndex: j
                        }
                    );
                }

                model.extractedText = text.slice(0, 5000);
                await model.save();
                console.log(`Successfully indexed ${model.title} (${chunks.length} chunks)`);
            } catch (err) {
                console.error(`Failed to index ${model.title}:`, err.message);
            }
        }

        console.log("Re-indexing complete.");
        process.exit(0);
    } catch (err) {
        console.error("Index script failed:", err);
        process.exit(1);
    }
}

indexExisting();
