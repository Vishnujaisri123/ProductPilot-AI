const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: String,
  googleId: String,
  githubId: String,
  avatar: String,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
  planLimits: {
    free: { type: Number, default: 50 },
    starter: { type: Number, default: 500 },
    pro: { type: Number, default: 5000 },
    enterprise: { type: Number, default: Infinity },
  },
  usageThisMonth: { type: Number, default: 0 },
  usageResetDate: { type: Date, default: () => new Date(new Date().setDate(1)) },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  telegramBotToken: String,
  telegramChatId: String,
  telegramEnabled: { type: Boolean, default: false },
  amazonAssociateTag: String,
  affiliateTags: [{ platform: String, tag: String, isDefault: Boolean }],
  apiKeys: [{ key: String, name: String, createdAt: Date, lastUsed: Date }],
  credits: { type: Number, default: 50 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.canProcess = function () {
  if (this.role === 'admin') return true;
  const limits = { free: 50, starter: 500, pro: 5000, enterprise: Infinity };
  return this.usageThisMonth < (limits[this.plan] || 50);
};

module.exports = mongoose.model('User', userSchema);
