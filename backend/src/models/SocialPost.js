const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  platform: {
    type: String,
    enum: ['telegram', 'instagram', 'pinterest', 'twitter', 'youtube', 'facebook', 'whatsapp'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'],
    default: 'draft'
  },
  content: {
    title: String,
    caption: String,
    hashtags: [String],
    selectedHook: String,
    script: {
      type: Map,
      of: String,
      default: {}
    },
    videoUrl: String,
    thumbnailUrl: String,
    voiceoverUrl: String
  },
  scheduledAt: Date,
  publishedAt: Date,
  postExternalId: String,
  error: String,
  analytics: {
    impressions: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    affiliateClicks: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('SocialPost', socialPostSchema);
