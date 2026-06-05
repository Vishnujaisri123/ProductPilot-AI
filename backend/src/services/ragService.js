const { Pinecone } = require("@pinecone-database/pinecone");

// Embeddings: use OpenAI if key present, otherwise skip RAG
let openaiEmbed = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require("openai");
  openaiEmbed = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

let pineconeIndex;
const getGroq = () => {
  const Groq = require("groq-sdk");
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const initPinecone = async () => {
  if (!process.env.PINECONE_API_KEY) return;
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    pineconeIndex = pc.index(process.env.PINECONE_INDEX || "productvision");
    console.log("Pinecone connected");
  } catch (err) {
    console.warn("Pinecone not available:", err.message);
  }
};

const embed = async (text) => {
  if (!openaiEmbed) throw new Error("No embedding provider configured");
  const response = await openaiEmbed.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
};

const retrieveContext = async (query, topK = 5) => {
  if (!pineconeIndex || !query?.trim() || !openaiEmbed) return [];
  try {
    const vector = await embed(query);
    const results = await pineconeIndex.query({
      vector,
      topK,
      includeMetadata: true,
    });
    return results.matches
      .filter((m) => m.score > 0.7)
      .map((m) => m.metadata?.text || "");
  } catch {
    return [];
  }
};

const upsertDocument = async (id, text, metadata = {}) => {
  if (!pineconeIndex || !openaiEmbed) return;
  const vector = await embed(text);
  await pineconeIndex.upsert([
    {
      id,
      values: vector,
      metadata: { text: text.slice(0, 1000), ...metadata },
    },
  ]);
};

const deleteDocument = async (id) => {
  if (!pineconeIndex) return;
  await pineconeIndex.deleteOne(id);
};

initPinecone();

module.exports = { retrieveContext, upsertDocument, deleteDocument };
