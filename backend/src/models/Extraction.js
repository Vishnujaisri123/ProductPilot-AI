const mongoose = require('mongoose');

const fieldSchema = {
  value: mongoose.Schema.Types.Mixed,
  confidence: { type: Number, default: 0 },
};

const extractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceImageName: String,
  imageUrl: String,
  cloudinaryId: String,
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  error: String,
  jobId: String,
  extracted: {
    product_name: fieldSchema,
    brand: fieldSchema,
    category: fieldSchema,
    price: fieldSchema,
    discount_price: fieldSchema,
    rating: fieldSchema,
    review_count: fieldSchema,
    seller: fieldSchema,
    availability: fieldSchema,
    color: fieldSchema,
    size: fieldSchema,
    ram: fieldSchema,
    storage: fieldSchema,
    model_number: fieldSchema,
    features: { value: [String], confidence: Number },
    description: fieldSchema,
    product_link: fieldSchema,
    platform: fieldSchema,
    delivery_info: fieldSchema,
  },
  confidenceScore: { type: Number, default: 0 },
  platform: String,
  productLinks: {
    amazon: String,
    flipkart: String,
    official: String,
  },
  manualProductUrl: String,
  affiliateUrl: String,
  telegramSent: { type: Boolean, default: false },
  telegramMessageId: String,
  telegramSentAt: Date,
  processingTime: Number,
  ragContext: [String],
}, { timestamps: true });

module.exports = mongoose.model('Extraction', extractionSchema);
