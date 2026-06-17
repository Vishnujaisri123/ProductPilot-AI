const getGroq = () => {
  const Groq = require('groq-sdk');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const MARKETING_GEN_PROMPT = `You are an expert AI Marketing Assistant and copywriter.
Analyze the following product details and generate highly optimized, engaging marketing content tailored for various social media platforms, attention-grabbing hooks, and video voiceover scripts.

Ensure the tone is persuasive, natural, and conversion-focused to maximize affiliate clicks.

Product Details:
- Name: {{productName}}
- Brand: {{brand}}
- Category: {{category}}
- Original Price: {{price}}
- Deal Price: {{discountPrice}}
- Rating: {{rating}}
- Source Platform: {{platform}}
- Features: {{features}}

Generate the content and return ONLY a valid JSON object matching this structure EXACTLY:
{
  "telegram": {
    "caption": "Write a structured deal alert. Focus on clear specifications, price drop, discount percentage, rating stars, bullet points of features, and call to action to Buy Now."
  },
  "instagram": {
    "caption": "Write an engaging, trendy, visually descriptive caption. Use emojis, highlight benefits, build curiosity. Do NOT include hashtags in the caption string itself, put them in the hashtags array.",
    "hashtags": ["List of 15-25 highly relevant, high-traffic hashtags related to product, category, brand, and deal trends"]
  },
  "pinterest": {
    "title": "A search-friendly, keyword-rich board/pin title (max 100 chars)",
    "caption": "Write a keyword-stuffed description optimized for Pinterest visual search SEO. Focus on how it solves a problem.",
    "hashtags": ["5-10 SEO-friendly hashtags"]
  },
  "twitter": {
    "caption": "Write a short, punchy, high-impact post (max 260 characters). Focus on the core benefit, the price drop, and an urgent CTA.",
    "hashtags": ["2-3 concise trending hashtags"]
  },
  "youtube": {
    "title": "Catchy YouTube Shorts title with a hook (e.g. 'Must-Have Tech Under ₹2500! 😱')",
    "caption": "Write an engaging description for a YouTube Community post or video. Encourage user interaction (e.g., 'Would you buy this?', 'Comment below').",
    "hashtags": ["3-5 high-relevance tags"]
  },
  "hooks": {
    "urgency": "Urgency-based hook (e.g. 'Flash Sale! Only a few hours left to grab...')",
    "scarcity": "Scarcity-based hook (e.g. 'Almost sold out! Only 3 left in stock...')",
    "discount": "Discount-focused hook (e.g. 'Unbelievable 65% Price Drop on...')",
    "trending": "Trending-product hook (e.g. 'This viral gadgets is taking over TikTok...')",
    "benefit": "Benefit-driven hook (e.g. 'Stop wasting hours doing X. This gadget does it in seconds...')"
  },
  "scripts": {
    "15s": "A short, fast-paced 15-second promotional voiceover script (approx 35 words). Starts with a strong hook, highlights deal price, ends with direct CTA.",
    "30s": "A 30-second script (approx 75 words) with more details on features, brand, and quality reviews, followed by CTA.",
    "60s": "An in-depth 60-second script (approx 150 words) suitable for a full demonstration, breaking down multiple features, discount comparison, and trust signals (reviews/rating) before ending with affiliate CTA."
  }
}

Do not include any markdown backticks or explanation text. Just return the JSON object.`;

exports.generateMarketingContent = async (product) => {
  try {
    const featuresList = Array.isArray(product.features) ? product.features.join(', ') : (product.features || 'N/A');
    
    const prompt = MARKETING_GEN_PROMPT
      .replace('{{productName}}', product.productName || 'N/A')
      .replace('{{brand}}', product.brand || 'N/A')
      .replace('{{category}}', product.category || 'N/A')
      .replace('{{price}}', product.price || 'N/A')
      .replace('{{discountPrice}}', product.discountPrice || 'N/A')
      .replace('{{rating}}', product.rating || 'N/A')
      .replace('{{platform}}', product.platform || 'N/A')
      .replace('{{features}}', featuresList);

    const response = await getGroq().chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 3000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response into JSON");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating marketing content:', error);
    // Fallback content in case AI call fails
    return {
      telegram: {
        caption: `🔥 DEAL ALERT: ${product.productName}\n\n💰 Deal Price: ${product.discountPrice || product.price}\n❌ MRP: ${product.price || 'N/A'}\n🏢 Brand: ${product.brand || 'N/A'}\n\n🔗 Buy Now: ${product.affiliateLink || '#'}`
      },
      instagram: {
        caption: `Unbelievable deal on the all-new ${product.productName}! Get it now before the price goes back up.`,
        hashtags: ['deals', 'shopping', 'sales', 'discount', product.brand?.toLowerCase(), 'lifestyle'].filter(Boolean)
      },
      pinterest: {
        title: `Best Deal on ${product.productName}`,
        caption: `Check out this amazing discount on ${product.productName}. Learn features and check reviews now.`,
        hashtags: ['pinterestpin', 'shoppingfinds', 'deals']
      },
      twitter: {
        caption: `🚨 PRICE DROP! Get the ${product.productName} for just ${product.discountPrice || product.price}! Limited time deal.`,
        hashtags: ['deals', 'offers']
      },
      youtube: {
        title: `Is the ${product.productName} worth it? 😱`,
        caption: `Checking out the features and pricing of ${product.productName}. Huge discount live now!`,
        hashtags: ['shorts', 'techdeals']
      },
      hooks: {
        urgency: "Hurry! This deal expires tonight!",
        scarcity: "Only a few units left at this price!",
        discount: `Huge discount on ${product.productName}!`,
        trending: "This is the most talked-about product today!",
        benefit: "Upgrade your setup with this game-changer!"
      },
      scripts: {
        "15s": `Looking for the best deal? The ${product.productName} is on sale for just ${product.discountPrice || product.price}! Click the link to grab yours now!`,
        "30s": `Stop scrolling! The ${product.productName} just got a massive price drop. It's now only ${product.discountPrice || product.price}. With a ${product.rating || '4.0'} star rating, this is the perfect time to buy. Check out the link in bio to get yours!`,
        "60s": `Are you looking to buy a new ${product.category || 'gadget'}? You need to see this. The ${product.productName} is currently available for a fraction of its original price! It features advanced details and top-tier user ratings. Usually it costs ${product.price}, but today you can get it for just ${product.discountPrice || product.price}. Don't miss out on this deal. Click the link now to check it out on ${product.platform || 'Amazon'}!`
      }
    };
  }
};
