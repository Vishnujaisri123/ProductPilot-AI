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
  const val = (field) => {
    const value = e[field]?.value;
    return value ? escapeHtml(value) : 'Not Found';
  };

  const productLink = escapeHtml(extraction.affiliateUrl || extraction.manualProductUrl || extraction.productLinks?.amazon || extraction.productLinks?.flipkart || extraction.productLinks?.official || e['product_link']?.value || 'Not Found');
  
  const platform = escapeHtml(extraction.platform) || 'Not Found';
  const price = val('discount_price') !== 'Not Found' ? val('discount_price') : val('price');
  const mrp = val('price') !== 'Not Found' ? val('price') : 'Not Found';
  
  // Try to calculate savings if price and MRP are numbers
  let savings = 'Not Found';
  if (price !== 'Not Found' && mrp !== 'Not Found') {
    const pStr = String(price).replace(/[^0-9.]/g, '');
    const mStr = String(mrp).replace(/[^0-9.]/g, '');
    if (pStr && mStr) {
      const pNum = parseFloat(pStr);
      const mNum = parseFloat(mStr);
      if (mNum > pNum && mNum > 0) {
        savings = Math.round(((mNum - pNum) / mNum) * 100) + '%';
      }
    }
  }

  const features = e['features']?.value || [];
  const featuresList = Array.isArray(features) && features.length > 0 
    ? features.map(f => `• ${escapeHtml(f)}`).join('\n') 
    : '• Not Found';

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return `🔥 DEAL DETECTED 🔥

📦 Product Name: ${val('product_name')}

💰 Deal Price: ${price}

❌ MRP: ${mrp}

📉 Savings: ${savings}

⭐ Rating: ${val('rating')}

📝 Reviews: ${val('review_count')}

📦 Availability: ${val('availability')}

🎨 Color: ${val('color')}

🏢 Brand: ${val('brand')}

🛍 Platform: ${platform}

📂 Category: ${val('category')}

💾 Storage: ${val('storage')}

⚡ RAM: ${val('ram')}

📏 Size: ${val('size')}

🚚 Delivery: ${val('delivery_info')}

━━━━━━━━━━━━━━━━━━━━━━

📋 Key Features

${featuresList}

━━━━━━━━━━━━━━━━━━━━━━

🔗 BUY NOW:
${productLink}

━━━━━━━━━━━━━━━━━━━━━━

📅 Posted On: ${currentDate}`;
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
