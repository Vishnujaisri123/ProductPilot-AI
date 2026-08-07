const Groq = require('groq-sdk');
const Tesseract = require('tesseract.js');
const { retrieveContext } = require('./ragService');

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const EXTRACTION_PROMPT = `You are an expert e-commerce product data extractor.
You will receive raw OCR text extracted from a product screenshot.
Parse it and return structured product data as a JSON object.

CRITICAL RULES:
1. Return ONLY a raw JSON object. No markdown, no code fences, no explanation.
2. "price": The original MRP (crossed-out/strikethrough price). Include currency symbol.
3. "discount_price": The current selling price (price you actually pay). Include currency symbol.
4. "description": Max 100 characters. Plain text only, no quotes inside.
5. "features": Array of short plain strings, each max 80 characters.
6. String values must NOT contain unescaped double quotes or newlines.
7. If a field is not found, use empty string "" and confidence 0.
8. Platform detection: look for amazon.in, flipkart.com, meesho.com, myntra.com, ajio.com, alibaba.com in the text.

Return ONLY this exact JSON structure:
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
}`;

const extractWithOCR = async (imageBuffer) => {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng+hin', {
    logger: () => {},
  });
  return text;
};

const parseJSONSafe = (raw) => {
  let s = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  s = s.slice(start, end + 1);

  s = s.replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(s); } catch (_) {}

  // Sanitize unescaped control characters inside strings
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

const extractWithLLM = async (ocrText, ragContext) => {
  const contextStr = ragContext.length > 0
    ? `\n\nRAG Context (use to improve accuracy):\n${ragContext.join('\n')}`
    : '';

  const response = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: EXTRACTION_PROMPT },
      { role: 'user', content: `Extract product data from this OCR text:\n\n${ocrText}${contextStr}` },
    ],
    max_tokens: 2000,
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  console.log('[Groq response preview]', content.slice(0, 200));

  try {
    return parseJSONSafe(content);
  } catch (err) {
    console.error('[JSON parse error]', err.message, '\n[Raw]', content);
    throw new Error(`AI returned invalid JSON: ${err.message}`);
  }
};

const detectPlatform = (extracted) => {
  const platform = extracted.platform?.value?.toLowerCase() || '';
  const platforms = ['amazon', 'flipkart', 'meesho', 'alibaba', 'myntra', 'ajio', 'shopify'];
  return platforms.find(p => platform.includes(p)) || platform;
};

const generateProductLinks = (extracted) => {
  const links = {};
  const link = extracted.product_link?.value;
  const platform = detectPlatform(extracted);
  const name = extracted.product_name?.value || '';

  if (link) {
    if (link.includes('amazon')) links.amazon = link;
    else if (link.includes('flipkart')) links.flipkart = link;
    else links.official = link;
  }

  if (platform === 'amazon' && name)
    links.amazon = links.amazon || `https://www.amazon.in/s?k=${encodeURIComponent(name)}`;
  if (platform === 'flipkart' && name)
    links.flipkart = links.flipkart || `https://www.flipkart.com/search?q=${encodeURIComponent(name)}`;

  return links;
};

const calculateOverallConfidence = (extracted) => {
  const scores = Object.values(extracted).map(f => f?.confidence || 0).filter(s => s > 0);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

const extractProduct = async (imageBuffer, filename) => {
  const start = Date.now();

  const ocrText = await extractWithOCR(imageBuffer).catch(() => '');
  if (!ocrText.trim()) throw new Error('OCR could not read any text from the image. Please upload a clearer screenshot.');

  const ragContext = await retrieveContext(ocrText).catch(() => []);
  const extracted = await extractWithLLM(ocrText, ragContext);

  const platform = detectPlatform(extracted);
  const productLinks = generateProductLinks(extracted);
  const confidenceScore = calculateOverallConfidence(extracted);
  const processingTime = Date.now() - start;

  return { extracted, platform, productLinks, confidenceScore, processingTime, ragContext };
};

module.exports = { extractProduct };
