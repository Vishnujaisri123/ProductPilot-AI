const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  extractionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Extraction', required: true },
  productName: { type: String, required: true },
  brand: String,
  category: String,
  price: String,
  discountPrice: String,
  rating: String,
  platform: String,
  imageUrl: String,
  confidenceScore: { type: Number, default: 0 },
  affiliateLink: String,
  telegramSent: { type: Boolean, default: false },
  status: { type: String, enum: ['Draft', 'Ready', 'Sent'], default: 'Draft' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
