const Product = require('../models/Product');
const { sendToTelegram } = require('../services/telegramService');
const Extraction = require('../models/Extraction');

exports.getProducts = async (req, res) => {
  try {
    const { platform, status, search, hasAffiliateLink } = req.query;
    const query = { userId: req.user._id };

    if (platform && platform !== 'All') {
      query.platform = platform;
    }
    if (status) {
      if (status === 'Sent To Telegram') query.status = 'Sent';
      if (status === 'Not Sent') query.status = { $ne: 'Sent' };
    }
    if (hasAffiliateLink) {
      if (hasAffiliateLink === 'true') query.affiliateLink = { $exists: true, $ne: null, $ne: '' };
      if (hasAffiliateLink === 'false') query.$or = [{ affiliateLink: { $exists: false } }, { affiliateLink: null }, { affiliateLink: '' }];
    }
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('extractionId');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductByExtractionId = async (req, res) => {
  try {
    const product = await Product.findOne({ extractionId: req.params.extractionId, userId: req.user._id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { affiliateLink, price, discountPrice } = req.body;
    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (affiliateLink !== undefined) {
      product.affiliateLink = affiliateLink;
      if (product.status === 'Draft' && affiliateLink) {
        product.status = 'Ready';
      }
    }
    
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    
    await product.save();
    
    // Also update extraction if needed
    if (product.extractionId) {
       await Extraction.findByIdAndUpdate(product.extractionId, { affiliateUrl: affiliateLink });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bulkTelegramSend = async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Invalid productIds array' });
    }

    const products = await Product.find({ _id: { $in: productIds }, userId: req.user._id }).populate('extractionId');
    
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const p of products) {
      try {
        if (!p.affiliateLink) {
          throw new Error('No affiliate link set for this product');
        }
        
        // Pass the extraction object with the updated affiliateUrl to the telegramService
        const extractionObj = p.extractionId.toObject();
        extractionObj.affiliateUrl = p.affiliateLink; 

        await sendToTelegram(
          req.user.telegramBotToken,
          req.user.telegramChatId,
          extractionObj,
          p.imageUrl
        );
        p.status = 'Sent';
        p.telegramSent = true;
        await p.save();
        
        await Extraction.findByIdAndUpdate(p.extractionId._id, { telegramSent: true });

        successCount++;
      } catch (err) {
        failCount++;
        errors.push({ id: p._id, name: p.productName, error: err.message });
      }
    }

    res.json({ successCount, failCount, errors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
