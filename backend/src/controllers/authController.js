const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email }))
    return res.status(400).json({ message: "Email already registered" });
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const user = await User.create({ name, email, password, verificationToken });
  res
    .status(201)
    .json({
      token: signToken(user._id),
      user: { id: user._id, name, email, plan: user.plan },
    });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt: ${email}`);

  const user = await User.findOne({ email });
  if (!user) {
    console.log(`[AUTH] User not found: ${email}`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.password) {
    console.log(`[AUTH] User has no password (OAuth login): ${email}`);
    return res
      .status(401)
      .json({
        message:
          "This account uses social login (Google/GitHub). Please login with that method.",
      });
  }

  const passwordMatch = await user.matchPassword(password);
  if (!passwordMatch) {
    console.log(`[AUTH] Password mismatch: ${email}`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.role !== "admin") {
    console.log(`[AUTH] Non-admin user login: ${email} (role: ${user.role})`);
  }

  console.log(`[AUTH] Login successful: ${email} (role: ${user.role})`);
  res.json({
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email,
      role: user.role,
      plan: user.plan,
      avatar: user.avatar,
    },
  });
};

exports.oauthCallback = (req, res) => {
  const token = signToken(req.user._id);
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};

exports.me = async (req, res) => {
  res.json(req.user);
};

exports.updateMe = async (req, res) => {
  const {
    amazonAssociateTag,
    telegramBotToken,
    telegramChatId,
    telegramEnabled,
  } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { amazonAssociateTag, telegramBotToken, telegramChatId, telegramEnabled },
    { new: true, runValidators: true },
  ).select("-password");
  res.json(user);
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "No user found" });
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpire = Date.now() + 3600000;
  await user.save();
  res.json({ message: "Password reset email sent" });
};

exports.resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ token: signToken(user._id) });
};

exports.generateApiKey = async (req, res) => {
  const key = `pv_${uuidv4().replace(/-/g, "")}`;
  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      apiKeys: { key, name: req.body.name || "API Key", createdAt: new Date() },
    },
  });
  res.json({ key });
};

exports.deleteApiKey = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { apiKeys: { key: req.params.keyId } },
  });
  res.json({ success: true });
};
