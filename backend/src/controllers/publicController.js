const Product = require('../models/Product');

exports.getPublicProducts = async (req, res) => {
  try {
    const { platform, category, search, sort } = req.query;
    
    // Only fetch products that have an affiliate link (meaning they are Ready/Sent and curated by admin)
    const query = { affiliateLink: { $exists: true, $ne: '' } };

    if (platform && platform !== 'All') {
      query.platform = platform;
    }
    if (category && category !== 'All') {
      const lowerCat = category.toLowerCase();
      if (lowerCat === 'electronics') {
        query.category = { 
          $regex: /electronics|laptop|smartphone|camera|mobile|watch|headphone|earbud|soundbar|speaker|tv|television|computer|keyboard|mice|mouse|projector|audio|cable|adapter|charger|fan|cooler|heater|vacuum|purifier|trimmer|massager|scale|card|reader|wearable|technology|microphone|wireless/i 
        };
      } else if (lowerCat === 'fashion') {
        query.category = { 
          $regex: /fashion|clothing|shirt|t-shirt|shoe|footwear|sneaker|belt|wallet|ethnic|wear|backpack|bag|accessory/i 
        };
      } else if (lowerCat === 'home') {
        query.category = { 
          $regex: /home|furniture|bed|cushion|mattress|chair|sofa|desk|table|kitchen|storage|cooker|cooktop|purifier|faucet|basin|rack|decor|wallpaper|bottle|lunch/i 
        };
      } else if (lowerCat === 'beauty') {
        query.category = { 
          $regex: /beauty|soap|deodorant|trimmer|sunscreen|skincare|care/i 
        };
      } else if (lowerCat === 'sports') {
        query.category = { 
          $regex: /sports|grip|strengthener|gadget|motorcycle|car|care|toy|vehicle/i 
        };
      } else {
        query.category = { $regex: category, $options: 'i' };
      }
    }
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 }; // Latest
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'rating' || sort === 'popular') sortOptions = { rating: -1 };

    const products = await Product.find(query)
      .sort(sortOptions)
      .select('-affiliateLink'); // EXCLUDE affiliateLink for security

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      affiliateLink: { $exists: true, $ne: '' }
    })
    .populate('extractionId')
    .select('-affiliateLink'); // EXCLUDE affiliateLink

    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.redirectProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      affiliateLink: { $exists: true, $ne: '' }
    });

    if (!product) {
      return res.status(404).send('Product link not found or inactive.');
    }

    // Redirect directly to the affiliate URL
    return res.redirect(302, product.affiliateLink);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
