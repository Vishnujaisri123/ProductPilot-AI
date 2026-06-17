const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: {
    type: String,
    enum: ['telegram', 'instagram', 'pinterest', 'twitter', 'youtube', 'facebook', 'whatsapp'],
    required: true
  },
  accountName: { type: String, required: true },
  accountId: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  details: {
    channelId: String,
    boardId: String,
    pageId: String,
    username: String,
    botToken: String,
    chatId: String
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'expired'],
    default: 'connected'
  },
  healthStatus: {
    type: String,
    enum: ['active', 'error'],
    default: 'active'
  },
  lastError: String
}, { timestamps: true });

// Avoid duplicate account connections per platform for a user
socialAccountSchema.index({ userId: 1, platform: 1, accountId: 1 }, { unique: true });

module.exports = mongoose.model('SocialAccount', socialAccountSchema);
