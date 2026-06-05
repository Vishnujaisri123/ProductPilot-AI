const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const escapeHtml = (text) => {
  if (!text) return 'N/A';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const formatMessage = (extraction) => {
  const e = extraction.extracted;
  const val = (field) => escapeHtml(e[field]?.value);

  const productLink = escapeHtml(extraction.affiliateUrl || extraction.manualProductUrl || extraction.productLinks?.amazon || extraction.productLinks?.flipkart || extraction.productLinks?.official || e['product_link']?.value);

  return `🛒 <b>Product Extracted Successfully</b>

📦 <b>Product Name:</b>
${val('product_name')}

🏢 <b>Brand:</b>
${val('brand')}

💰 <b>Price:</b>
${val('price')}

💸 <b>Discount Price:</b>
${val('discount_price')}

⭐ <b>Rating:</b>
${val('rating')}

📊 <b>Reviews:</b>
${val('review_count')}

🎯 <b>Confidence:</b>
${extraction.confidenceScore}%

🛍 <b>Platform:</b>
${escapeHtml(extraction.platform) || 'Unknown'}

📦 <b>Availability:</b>
${val('availability')}

🚚 <b>Delivery:</b>
${val('delivery_info')}

🔗 <b>Product Link:</b>
${productLink}

🕒 <b>Extracted:</b>
${new Date().toLocaleDateString('en-IN')}`;
};

const sendToTelegram = async (botToken, chatId, extraction, imageUrl) => {
  const bot = new TelegramBot(botToken);

  if (imageUrl) {
    await bot.sendPhoto(chatId, imageUrl, {
      caption: formatMessage(extraction),
      parse_mode: 'HTML',
    });
  } else {
    await bot.sendMessage(chatId, formatMessage(extraction), { parse_mode: 'HTML' });
  }

  return true;
};

const testConnection = async (botToken, chatId) => {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await axios.post(url, {
    chat_id: chatId,
    text: '✅ ProductVision AI connected successfully!',
  });
  return response.data.ok;
};

const buildJSON = (extraction) => {
  const e = extraction.extracted;
  const val = (field) => e[field]?.value ?? '';
  return {
    image_url: extraction.imageUrl,
    product_name: val('product_name'),
    brand: val('brand'),
    category: val('category'),
    price: val('price'),
    discount_price: val('discount_price'),
    rating: val('rating'),
    review_count: val('review_count'),
    seller: val('seller'),
    availability: val('availability'),
    color: val('color'),
    size: val('size'),
    ram: val('ram'),
    storage: val('storage'),
    model_number: val('model_number'),
    features: val('features') || [],
    description: val('description'),
    product_link: val('product_link'),
    platform: extraction.platform,
    confidence_score: extraction.confidenceScore,
    timestamp: extraction.createdAt,
    source_image_name: extraction.sourceImageName,
    product_links: extraction.productLinks,
  };
};

module.exports = { sendToTelegram, testConnection, buildJSON };
