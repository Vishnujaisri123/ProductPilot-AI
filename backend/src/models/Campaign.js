const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
