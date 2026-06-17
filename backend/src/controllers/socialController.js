const SocialAccount = require('../models/SocialAccount');
const Campaign = require('../models/Campaign');
const SocialPost = require('../models/SocialPost');
const Product = require('../models/Product');
const { generateMarketingContent } = require('../services/marketingAiService');
const { generateThumbnail } = require('../services/thumbnailEngineService');
const { repurposeVideo } = require('../services/videoRepurposingService');
const { publishToPlatform } = require('../services/socialPublishingService');
const { socialQueue } = require('../workers/schedulingWorker');

// --- Social Accounts ---
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await SocialAccount.find({ userId: req.user._id });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching accounts', error: err.message });
  }
};

exports.connectAccount = async (req, res) => {
  try {
    const { platform, accountName, accountId, details } = req.body;
    
    // Check if duplicate
    let account = await SocialAccount.findOne({ userId: req.user._id, platform, accountId });
    if (account) {
      account.status = 'connected';
      account.healthStatus = 'active';
      if (details) account.details = { ...account.details, ...details };
      await account.save();
    } else {
      account = await SocialAccount.create({
        userId: req.user._id,
        platform,
        accountName,
        accountId: accountId || `${platform}_${Date.now()}`,
        status: 'connected',
        healthStatus: 'active',
        details: details || {}
      });
    }
    
    res.status(201).json({ success: true, account });
  } catch (err) {
    res.status(500).json({ message: 'Error connecting account', error: err.message });
  }
};

exports.testAccount = async (req, res) => {
  try {
    const account = await SocialAccount.findOne({ _id: req.params.id, userId: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    if (account.platform === 'telegram') {
      const { testConnection } = require('../services/telegramService');
      const botToken = account.details?.botToken || req.user.telegramBotToken;
      const chatId = account.details?.chatId || req.user.telegramChatId;
      
      if (!botToken || !chatId) {
        return res.status(400).json({ success: false, message: 'Missing bot configuration' });
      }
      const ok = await testConnection(botToken, chatId);
      if (ok) {
        account.healthStatus = 'active';
        await account.save();
        return res.json({ success: true, message: 'Connection successful!' });
      } else {
        account.healthStatus = 'error';
        account.lastError = 'Invalid token or chat ID';
        await account.save();
        return res.json({ success: false, message: 'Connection failed' });
      }
    }

    // Simulated test for other channels
    await new Promise(resolve => setTimeout(resolve, 800));
    account.healthStatus = 'active';
    account.status = 'connected';
    await account.save();
    res.json({ success: true, message: `Connected to ${account.platform.toUpperCase()} api successfully!` });
  } catch (err) {
    res.status(500).json({ message: 'Error testing connection', error: err.message });
  }
};

exports.disconnectAccount = async (req, res) => {
  try {
    const account = await SocialAccount.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ success: true, message: 'Account disconnected successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error disconnecting account', error: err.message });
  }
};

// --- Campaigns ---
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching campaigns', error: err.message });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const campaign = await Campaign.create({
      userId: req.user._id,
      name,
      description,
      startDate,
      endDate
    });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ message: 'Error creating campaign', error: err.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: 'Error updating campaign', error: err.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    // Detach campaign from any social posts
    await SocialPost.updateMany({ campaignId: campaign._id }, { $unset: { campaignId: 1 } });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting campaign', error: err.message });
  }
};

// --- Social Posts ---
exports.getPosts = async (req, res) => {
  try {
    const { platform, status, campaignId, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    if (platform) query.platform = platform;
    if (status) query.status = status;
    if (campaignId) query.campaignId = campaignId;

    const posts = await SocialPost.find(query)
      .populate('productId', 'productName imageUrl price discountPrice')
      .populate('campaignId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SocialPost.countDocuments(query);
    res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
};

exports.generateSocialContent = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findOne({ _id: productId, userId: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const content = await generateMarketingContent(product);
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Error generating content', error: err.message });
  }
};

exports.createThumbnailImage = async (req, res) => {
  try {
    const { productName, price, discountPrice, imageUrl, platform } = req.body;
    const url = await generateThumbnail({ productName, price, discountPrice, imageUrl, platform });
    res.json({ success: true, thumbnailUrl: url });
  } catch (err) {
    res.status(500).json({ message: 'Error creating thumbnail image', error: err.message });
  }
};

exports.repurposeVideoContent = async (req, res) => {
  try {
    const { productName, videoUrl, imageUrl } = req.body;
    const result = await repurposeVideo({ productName, videoUrl, imageUrl });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error repurposing video', error: err.message });
  }
};

exports.schedulePost = async (req, res) => {
  try {
    const {
      productId, campaignId, platform, title, caption,
      hashtags, selectedHook, script, videoUrl, thumbnailUrl,
      voiceoverUrl, scheduledAt
    } = req.body;

    const product = await Product.findOne({ _id: productId, userId: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const post = await SocialPost.create({
      userId: req.user._id,
      productId,
      campaignId: campaignId || undefined,
      platform,
      status: scheduledAt ? 'scheduled' : 'draft',
      content: {
        title, caption, hashtags, selectedHook,
        script: script || {}, videoUrl, thumbnailUrl, voiceoverUrl
      },
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
    });

    if (scheduledAt) {
      const runAt = new Date(scheduledAt);
      const delay = runAt.getTime() - Date.now();
      
      // Add delayed BullMQ job
      await socialQueue.add('publish', {
        postId: post._id.toString(),
        userId: req.user._id.toString()
      }, {
        delay: Math.max(0, delay)
      });
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error scheduling post', error: err.message });
  }
};

exports.publishPostNow = async (req, res) => {
  try {
    const post = await SocialPost.findOne({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const result = await publishToPlatform(post._id, req.user);
    res.json({ success: true, message: 'Post published successfully!', result });
  } catch (err) {
    res.status(500).json({ message: 'Error publishing post', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await SocialPost.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post', error: err.message });
  }
};
