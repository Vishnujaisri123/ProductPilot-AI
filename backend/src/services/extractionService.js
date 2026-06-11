// require groq-sdk lazily inside getGroq to avoid startup errors when env isn't loaded
const Tesseract = require("tesseract.js");
const { retrieveContext } = require("./ragService");

const getGroq = () => {
  const Groq = require("groq-sdk");
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const EXTRACTION_PROMPT = `You are an expert product data extractor. Analyze this e-commerce product screenshot and extract all available product information.

CRITICAL EXTRACTION RULES:
1. "price": Must be the Original MRP (Maximum Retail Price). This is usually crossed out (e.g., ₹1,999). Include the currency symbol.
2. "discount_price": Must be the current selling/deal price. This is the active price you pay (e.g., ₹999). Include the currency symbol.
3. If only one price exists on the page, put it in "discount_price" and leave "price" empty.
4. "brand": Look for the brand name, usually located near the product name or in the specs.

For each field, provide a value and a confidence score (0-100).

Return ONLY valid JSON in this exact format:
{
  "product_name": {"value": "", "confidence": 0},
  "brand": {"value": "", "confidence": 0},
  "category": {"value": "", "confidence": 0},
  "price": {"value": "", "confidence": 0},
  "discount_price": {"value": "", "confidence": 0},
  "rating": {"value": "", "confidence": 0},
  "review_count": {"value": "", "confidence": 0},
  "seller": {"value": "", "confidence": 0},
  "availability": {"value": "", "confidence": 0},
  "color": {"value": "", "confidence": 0},
  "size": {"value": "", "confidence": 0},
  "ram": {"value": "", "confidence": 0},
  "storage": {"value": "", "confidence": 0},
  "model_number": {"value": "", "confidence": 0},
  "features": {"value": [], "confidence": 0},
  "description": {"value": "", "confidence": 0},
  "product_link": {"value": "", "confidence": 0},
  "platform": {"value": "", "confidence": 0},
  "delivery_info": {"value": "", "confidence": 0}
}

Platform detection: Look for Amazon, Flipkart, Meesho, Alibaba, Shopify, Myntra, Ajio logos or URL patterns.
Be precise. If a field is not visible, set confidence to 0 and value to empty string.`;

const extractWithOCR = async (imageBuffer) => {
  const {
    data: { text },
  } = await Tesseract.recognize(imageBuffer, "eng+hin", {
    logger: () => {},
  });
  return text;
};

const extractWithVision = async (imageBase64, ocrText, ragContext) => {
  const contextStr =
    ragContext.length > 0
      ? `\n\nRAG Context (use to improve accuracy):\n${ragContext.join("\n")}`
      : "";

  const ocrStr = ocrText ? `\n\nOCR Text extracted:\n${ocrText}` : "";

  const response = await getGroq().chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_PROMPT + ocrStr + contextStr },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0.1,
  });

  const content = response.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  return JSON.parse(jsonMatch[0]);
};

const detectPlatform = (extracted) => {
  const platform = extracted.platform?.value?.toLowerCase() || "";
  const platforms = [
    "amazon",
    "flipkart",
    "meesho",
    "alibaba",
    "myntra",
    "ajio",
    "shopify",
  ];
  return platforms.find((p) => platform.includes(p)) || platform;
};

const generateProductLinks = (extracted) => {
  const links = {};
  const link = extracted.product_link?.value;
  const platform = detectPlatform(extracted);
  const name = extracted.product_name?.value || "";

  if (link) {
    if (link.includes("amazon")) links.amazon = link;
    else if (link.includes("flipkart")) links.flipkart = link;
    else links.official = link;
  }

  if (platform === "amazon" && name) {
    const query = encodeURIComponent(name);
    links.amazon = links.amazon || `https://www.amazon.in/s?k=${query}`;
  }
  if (platform === "flipkart" && name) {
    const query = encodeURIComponent(name);
    links.flipkart =
      links.flipkart || `https://www.flipkart.com/search?q=${query}`;
  }

  return links;
};

const calculateOverallConfidence = (extracted) => {
  const fields = Object.values(extracted);
  const scores = fields.map((f) => f?.confidence || 0).filter((s) => s > 0);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

const extractProduct = async (imageBuffer, filename) => {
  const start = Date.now();

  const ocrText = await extractWithOCR(imageBuffer).catch(() => "");
  const ragContext = await retrieveContext(ocrText).catch(() => []);
  const imageBase64 = imageBuffer.toString("base64");
  const extracted = await extractWithVision(imageBase64, ocrText, ragContext);

  const platform = detectPlatform(extracted);
  const productLinks = generateProductLinks(extracted);
  const confidenceScore = calculateOverallConfidence(extracted);
  const processingTime = Date.now() - start;

  return {
    extracted,
    platform,
    productLinks,
    confidenceScore,
    processingTime,
    ragContext,
  };
};

module.exports = { extractProduct };
