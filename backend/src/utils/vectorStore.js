const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAI } = require("openai");

let pc = null;
let openai = null;

function getPinecone() {
    if (!pc) {
        if (!process.env.PINECONE_API_KEY) {
            console.warn("WARNING: PINECONE_API_KEY is missing. Semantic search will be disabled.");
            return null;
        }
        pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    }
    return pc;
}

function getOpenAI() {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            console.warn("WARNING: OPENAI_API_KEY is missing. Embeddings/Summarization will be disabled.");
            return null;
        }
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
}

const indexName = "sic-mundus-vault";

/**
 * Generates an embedding for a text string
 */
async function generateEmbedding(text) {
    const ai = getOpenAI();
    if (!ai) return null;

    const response = await ai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    return response.data[0].embedding;
}

/**
 * Upserts a document chunk into the vector store
 */
async function upsertDocument(id, text, metadata) {
    const embedding = await generateEmbedding(text);
    if (!embedding) return;

    const pinecone = getPinecone();
    if (!pinecone) return;

    const index = pinecone.Index(indexName);

    await index.upsert([{
        id,
        values: embedding,
        metadata: {
            ...metadata,
            text
        }
    }]);
}

/**
 * Searches for relevant document chunks
 */
async function semanticSearch(query, topK = 5, filter = {}) {
    const embedding = await generateEmbedding(query);
    if (!embedding) return [];

    const pinecone = getPinecone();
    if (!pinecone) return [];

    const index = pinecone.Index(indexName);

    const results = await index.query({
        vector: embedding,
        topK,
        includeMetadata: true,
        filter
    });

    return results.matches;
}

module.exports = {
    generateEmbedding,
    upsertDocument,
    semanticSearch
};
