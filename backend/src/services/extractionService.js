const Groq = require('groq-sdk');
const Tesseract = require('tesseract.js');
const { retrieveContext } = require('./ragService');

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const EXTRACTION_PROMPT = `You are an expert e-commerce product data extractor.
You will receive raw OCR text from a product screenshot (Amazon, Flipkart, Meesho, Myntra, Ajio, etc).

## PRICE EXTRACTION RULES (most important):
OCR text cannot show strikethrough visually, so use these patterns to identify prices:

ORIGINAL MRP ("price" field):
- Text near: "M.R.P", "MRP", "Original Price", "Was:", "Market Price", "List Price", "₹" followed by a higher number that appears BEFORE a lower number
- On Amazon: line starting with "M.R.P. :" or "M.R.P:"
- On Flipkart: line with "Original Price" or the higher ₹ value shown with a slash
- Pattern: if two prices exist, the HIGHER one is usually MRP

DEAL/SELLING PRICE ("discount_price" field):
- Text near: "Deal Price", "Selling Price", "Offer Price", "Our Price", "Price:", "Buy Now", "Add to Cart"
- On Amazon: line starting with "-X%" then the price, or "Deal of the Day"
- On Flipkart: the LOWER price shown prominently
- Pattern: if two prices exist, the LOWER one is the selling price
- If only ONE price exists in the text, put it in "discount_price" and leave "price" empty

## DISCOUNT DETECTION:
- Look for patterns like "X% off", "Save ₹X", "You save: ₹X"
- Calculate: if you see "20% off" and selling price ₹800, MRP = ₹1000

## PLATFORM DETECTION:
- "amazon.in", "amzn", "Amazon" → amazon
- "flipkart.com", "Flipkart" → flipkart  
- "meesho.com", "Meesho" → meesho
- "myntra.com", "Myntra" → myntra
- "ajio.com", "AJIO" → ajio
- "alibaba.com" → alibaba

## RATING & REVIEWS:
- Rating: number like "4.2", "4.5 out of 5", "★4.3"
- Reviews: number near "ratings", "reviews", "verified purchases"

## OTHER FIELDS:
- RAM: look for "4GB", "8GB", "12GB RAM"
- Storage: look for "64GB", "128GB", "256GB storage/ROM"
- Color: look for "Colour:", "Color:", specific color names
- Availability: "In Stock", "Out of Stock", "Only X left"
- Delivery: "FREE delivery", "Get it by", "Delivery by"

## OUTPUT FORMAT:
Return ONLY a valid JSON object. No markdown, no explanation, no code fences.
Confidence score rules:
- 90-100: field clearly visible in text
- 70-89: field inferred from context
- 40-69: uncertain/guessed
- 0: not found

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

// Preprocess OCR text to normalize price patterns
const preprocessOCR = (text) => {
  return text
    // Normalize rupee symbols (OCR often misreads ₹)
    .replace(/Rs\.?\s*/gi, '₹')
    .replace(/INR\s*/gi, '₹')
    .replace(/\bRs\b/gi, '₹')
    // Normalize common OCR misreads for prices
    .replace(/₹\s+(\d)/g, '₹$1')
    // Highlight MRP patterns for the LLM
    .replace(/(M\.?R\.?P\.?\s*:?\s*)(₹[\d,]+)/gi, 'MRP_ORIGINAL: $2')
    .replace(/(market price\s*:?\s*)(₹[\d,]+)/gi, 'MRP_ORIGINAL: $2')
    .replace(/(was\s*:?\s*)(₹[\d,]+)/gi, 'MRP_ORIGINAL: $2')
    .replace(/(list price\s*:?\s*)(₹[\d,]+)/gi, 'MRP_ORIGINAL: $2')
    // Highlight deal price patterns
    .replace(/(deal price\s*:?\s*)(₹[\d,]+)/gi, 'DEAL_PRICE: $2')
    .replace(/(selling price\s*:?\s*)(₹[\d,]+)/gi, 'DEAL_PRICE: $2')
    .replace(/(offer price\s*:?\s*)(₹[\d,]+)/gi, 'DEAL_PRICE: $2')
    .replace(/(our price\s*:?\s*)(₹[\d,]+)/gi, 'DEAL_PRICE: $2')
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const extractWithOCR = async (imageBuffer) => {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng+hin', {
    logger: () => {},
    tessedit_pageseg_mode: '3', // Fully automatic page segmentation
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
    ? `\n\nKnowledge Base Context:\n${ragContext.join('\n')}`
    : '';

  const processedText = preprocessOCR(ocrText);

  const userMessage = `Extract all product details from this OCR text. Pay special attention to prices - identify MRP_ORIGINAL as "price" and DEAL_PRICE as "discount_price".\n\nOCR TEXT:\n${processedText}${contextStr}`;

  const response = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: EXTRACTION_PROMPT },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 2000,
    temperature: 0.05,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  console.log('[OCR text preview]', processedText.slice(0, 300));
  console.log('[Groq response preview]', content.slice(0, 300));

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
  if (platform === 'meesho' && name)
    links.official = links.official || `https://www.meesho.com/search?q=${encodeURIComponent(name)}`;
  if (platform === 'myntra' && name)
    links.official = links.official || `https://www.myntra.com/${encodeURIComponent(name)}`;

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

  console.log('[OCR raw length]', ocrText.length, 'chars');

  const ragContext = await retrieveContext(ocrText).catch(() => []);
  const extracted = await extractWithLLM(ocrText, ragContext);

  const platform = detectPlatform(extracted);
  const productLinks = generateProductLinks(extracted);
  const confidenceScore = calculateOverallConfidence(extracted);
  const processingTime = Date.now() - start;

  return { extracted, platform, productLinks, confidenceScore, processingTime, ragContext };
};

module.exports = { extractProduct };
