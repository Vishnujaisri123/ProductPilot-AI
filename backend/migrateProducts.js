require('dotenv').config();
const mongoose = require('mongoose');
const Extraction = require('./src/models/Extraction');
const Product = require('./src/models/Product');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const extractions = await Extraction.find({ status: 'completed' });
  console.log(`Found ${extractions.length} completed extractions.`);

  let count = 0;
  for (const ext of extractions) {
    const exists = await Product.findOne({ extractionId: ext._id });
    if (!exists) {
      const e = ext.extracted || {};
      const status = ext.telegramSent ? 'Sent' : (ext.affiliateUrl ? 'Ready' : 'Draft');
      
      await Product.create({
        userId: ext.userId,
        extractionId: ext._id,
        productName: e.product_name?.value || ext.sourceImageName || 'Unknown Product',
        brand: e.brand?.value,
        category: e.category?.value,
        price: e.price?.value,
        rating: e.rating?.value,
        platform: ext.platform,
        imageUrl: ext.imageUrl,
        confidenceScore: ext.confidenceScore,
        affiliateLink: ext.affiliateUrl || ext.manualProductUrl,
        telegramSent: ext.telegramSent,
        status: status,
        createdAt: ext.createdAt
      });
      count++;
    }
  }

  console.log(`Migrated ${count} products.`);
  mongoose.disconnect();
}

migrate().catch(console.error);
