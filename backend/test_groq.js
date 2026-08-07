process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const Groq = require('groq-sdk');

console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Loaded (length: " + process.env.GROQ_API_KEY.length + ")" : "Not loaded");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    console.log("Listing models...");
    const models = await groq.models.list();
    console.log("Available models:");
    models.data.forEach(model => {
      console.log(`- ${model.id}`);
    });
  } catch (err) {
    console.error("Error listing models:", err);
    console.error("Error details keys:", Object.keys(err));
    console.error("Error cause:", err.cause);
  }
}

main();
