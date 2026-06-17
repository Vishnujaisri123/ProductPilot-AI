const sharp = require('sharp');
const axios = require('axios');
const { uploadBuffer } = require('../config/cloudinary');

const downloadImage = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading image for thumbnail:', error);
    return null;
  }
};

exports.generateThumbnail = async ({ productName, price, discountPrice, imageUrl, platform = 'amazon' }) => {
  try {
    // 1. Prepare texts
    const cleanProductName = productName || 'Awesome Product';
    const truncatedName = cleanProductName.length > 50 
      ? cleanProductName.slice(0, 47) + '...' 
      : cleanProductName;
    
    const dealPrice = discountPrice || price || 'N/A';
    const mrp = price || 'N/A';
    
    // Calculate savings
    let savings = 'SAVE';
    if (price && discountPrice) {
      const pStr = String(discountPrice).replace(/[^0-9.]/g, '');
      const mStr = String(price).replace(/[^0-9.]/g, '');
      if (pStr && mStr) {
        const pNum = parseFloat(pStr);
        const mNum = parseFloat(mStr);
        if (mNum > pNum && mNum > 0) {
          savings = Math.round(((mNum - pNum) / mNum) * 100) + '%';
        }
      }
    }

    // 2. Create the deep space gradient background
    const bgSvg = Buffer.from(`
      <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0d091e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#030206;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="800" fill="url(#grad)" />
      </svg>
    `);

    // 3. Create the text overlays SVG
    // Escape XML characters in text fields
    const xmlEscape = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const overlaySvg = Buffer.from(`
      <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
        <!-- Header Banner -->
        <rect x="30" y="30" width="170" height="38" rx="8" fill="#a855f7" opacity="0.2"/>
        <text x="45" y="54" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#e9d5ff">🔥 DEAL ALERT</text>

        <!-- Platform Badge -->
        <rect x="630" y="30" width="140" height="38" rx="8" fill="#06b6d4" opacity="0.2"/>
        <text x="700" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#cffafe">${xmlEscape(platform.toUpperCase())}</text>

        <!-- Bottom Badge card -->
        <rect x="30" y="570" width="740" height="200" rx="20" fill="#09090b" opacity="0.95" stroke="#27272a" stroke-width="1" />
        
        <!-- Product Name -->
        <text x="60" y="615" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">${xmlEscape(truncatedName)}</text>
        
        <!-- Deal Price Details -->
        <text x="60" y="695" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#06b6d4">${xmlEscape(dealPrice)}</text>
        <text x="60" y="735" font-family="Arial, sans-serif" font-size="18" font-weight="normal" fill="#71717a">MRP: <tspan text-decoration="line-through">${xmlEscape(mrp)}</tspan></text>

        <!-- Discount Pill -->
        <rect x="420" y="658" width="120" height="44" rx="22" fill="#ef4444" />
        <text x="480" y="686" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">${xmlEscape(savings)} OFF</text>

        <!-- CTA Button -->
        <rect x="570" y="650" width="170" height="60" rx="12" fill="#a855f7" />
        <text x="655" y="686" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">BUY NOW</text>
      </svg>
    `);

    // 4. Download and process the product image
    let productImgBuffer = imageUrl ? await downloadImage(imageUrl) : null;
    const composites = [];

    // Base background
    let pipeline = sharp(bgSvg);

    if (productImgBuffer) {
      try {
        // Resize product image to fit a 500x420 box cleanly with transparent background
        const resizedProductImg = await sharp(productImgBuffer)
          .resize(500, 420, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .toBuffer();

        composites.push({
          input: resizedProductImg,
          top: 100,
          left: 150
        });
      } catch (err) {
        console.error('Failed to process product image with sharp, skipping compositing:', err);
      }
    }

    // Add overlay SVG (text + cards)
    composites.push({
      input: overlaySvg,
      top: 0,
      left: 0
    });

    const finalImageBuffer = await pipeline
      .composite(composites)
      .png()
      .toBuffer();

    // 5. Upload buffer to Cloudinary
    const uploadResult = await uploadBuffer(finalImageBuffer, 'productvision_thumbnails');
    return uploadResult.url;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    // If it fails, fallback to product image URL or a default placeholder
    return imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80';
  }
};
