const User = require('../models/User');
const Extraction = require('../models/Extraction');
const { testConnection, sendToTelegram } = require('../services/telegramService');

exports.saveConfig = async (req, res) => {
  const { botToken, chatId } = req.body;
  await User.findByIdAndUpdate(req.user._id, {
    telegramBotToken: botToken,
    telegramChatId: chatId,
    telegramEnabled: true,
  });
  res.json({ message: 'Telegram config saved' });
};

exports.testConnection = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.telegramBotToken) return res.status(400).json({ message: 'No bot token configured' });
  const ok = await testConnection(user.telegramBotToken, user.telegramChatId);
  res.json({ success: ok });
};

exports.resend = async (req, res) => {
  const extraction = await Extraction.findOne({ _id: req.params.id, userId: req.user._id });
  if (!extraction) return res.status(404).json({ message: 'Not found' });
  const user = await User.findById(req.user._id);
  if (!user.telegramEnabled) return res.status(400).json({ message: 'Telegram not configured' });
  await sendToTelegram(user.telegramBotToken, user.telegramChatId, extraction, extraction.imageUrl);
  await extraction.updateOne({ telegramSent: true, telegramSentAt: new Date() });
  res.json({ message: 'Sent to Telegram' });
};

exports.toggleEnabled = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { telegramEnabled: req.body.enabled }, { new: true });
  res.json({ telegramEnabled: user.telegramEnabled });
};
