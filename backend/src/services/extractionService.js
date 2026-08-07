// require groq-sdk lazily inside getGroq to avoid startup errors when env isn't loaded
const Tesseract = require("tesseract.js");
const { retrieveContext } = require("./ragService");

const getGroq = () => {
  const Groq = require("groq-sdk");
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const EXTRACTION_PROMPT = `You are an expert product data extractor. Analyze this e-commerce product screenshot and extract all available product information.

CRITICAL RULES:
1. Return ONLY a raw JSON object. No markdown, no code fences, no explanation text before or after.
2. "price": The original MRP (crossed-out price). Include currency symbol.
3. "discount_price": The current selling price. Include currency symbol.
4. "description": Max 100 characters. No quotes or special characters inside the value.
5. "features": Array of short strings. Each item max 80 characters.
6. All string values must NOT contain unescaped double quotes or newlines.
7. If a field is not visible, use empty string "" and confidence 0.

Return ONLY this JSON structure with no other text:
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

Platform detection: Look for Amazon, Flipkart, Meesho, Alibaba, Shopify, Myntra, Ajio logos or URL patterns.`;

const extractWithOCR = async (imageBuffer) => {
  const {
    data: { text },
  } = await Tesseract.recognize(imageBuffer, "eng+hin", {
    logger: () => {},
  });
  return text;
};

const parseJSONSafe = (raw) => {
  // 1. Strip markdown code fences
  let s = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  // 2. Extract outermost { ... } block
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  s = s.slice(start, end + 1);

  // 3. Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, '$1');

  // 4. Try direct parse first
  try { return JSON.parse(s); } catch (_) {}

  // 5. Sanitize unescaped control characters inside strings
  s = s.replace(/"((?:[^"\\]|\\.)*)"/g, (_, inner) => {
    const fixed = inner
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${fixed}"`;
  });
  s = s.replace(/,\s*([}\]])/g, '$1');

  return JSON.parse(s);
};

const extractWithVision = async (imageBase64, ocrText, ragContext) => {
  const contextStr = ragContext.length > 0
    ? `\n\nRAG Context (use to improve accuracy):\n${ragContext.join('\n')}`
    : '';
  const ocrStr = ocrText ? `\n\nOCR Text extracted:\n${ocrText}` : '';

  const response = await getGroq().chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: EXTRACTION_PROMPT + ocrStr + contextStr },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    }],
    max_tokens: 2000,
    temperature: 0.1,
  });

  const content = response.choices[0].message.content;
  console.log('[Groq raw response]', content.slice(0, 300));

  try {
    return parseJSONSafe(content);
  } catch (err) {
    console.error('[JSON parse error]', err.message);
    console.error('[Raw content]', content);
    throw new Error(`AI returned invalid JSON: ${err.message}`);
  }
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
