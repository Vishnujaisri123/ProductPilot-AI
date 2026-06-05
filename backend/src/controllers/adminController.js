const User = require('../models/User');
const Extraction = require('../models/Extraction');
const KnowledgeBase = require('../models/KnowledgeBase');

exports.getStats = async (req, res) => {
  const [users, extractions, kbDocs] = await Promise.all([
    User.countDocuments(),
    Extraction.countDocuments(),
    KnowledgeBase.countDocuments(),
  ]);
  res.json({ users, extractions, kbDocs });
};

exports.getUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit),
    User.countDocuments(query),
  ]);
  res.json({ users, total });
};

exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json(user);
};

exports.getExtractions = async (req, res) => {
  const extractions = await Extraction.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(100);
  res.json(extractions);
};
