const { semanticSearch } = require("../utils/vectorStore");
const Model3D = require("../models/Model3D");
const Workspace = require("../models/Workspace");
const { OpenAI } = require("openai");

let openai = null;
function getOpenAI() {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) return null;
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
}

exports.search = async (req, res) => {
    const { query, workspaceId } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    try {
        // 1. Get user's authorized workspaces
        const userWorkspaces = await Workspace.find({
            $or: [
                { owner: req.user.userId },
                { "members.user": req.user.userId }
            ]
        }).select("_id");

        const authorizedWorkspaceIds = userWorkspaces.map(w => w._id.toString());

        // 2. Filter search by workspace
        const pineconeFilter = {};
        if (workspaceId) {
            if (!authorizedWorkspaceIds.includes(workspaceId)) {
                return res.status(403).json({ message: "Access denied to this workspace" });
            }
            pineconeFilter.workspaceId = workspaceId;
        } else {
            pineconeFilter.workspaceId = { "$in": authorizedWorkspaceIds };
        }

        // 3. Perform semantic search
        const matches = await semanticSearch(query, 5, pineconeFilter);

        // 4. Optionally summarize
        let summary = "";
        const ai = getOpenAI();
        if (matches.length > 0 && ai) {
            const context = matches.map(m => m.metadata.text).join("\n---\n");
            const response = await ai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a secure vault assistant. Summarize the following document fragments based on the user's query. Only use the provided information. If the answer is not in the text, say you don't know." },
                    { role: "user", content: `Query: ${query}\n\nContext:\n${context}` }
                ]
            });
            summary = response.choices[0].message.content;
        }

        res.json({
            matches: matches.map(m => ({
                id: m.id,
                score: m.score,
                text: m.metadata.text,
                documentTitle: m.metadata.documentTitle,
                documentId: m.metadata.documentId
            })),
            summary
        });

    } catch (err) {
        console.error("Semantic search failed:", err);
        res.status(500).json({ message: "Search failed", error: err.message });
    }
};
