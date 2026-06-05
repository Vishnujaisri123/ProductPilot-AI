const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['csv', 'excel', 'json', 'text', 'extraction'], required: true },
  content: mongoose.Schema.Types.Mixed,
  vectorIds: [String],
  status: { type: String, enum: ['pending', 'indexed', 'failed'], default: 'pending' },
  recordCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
