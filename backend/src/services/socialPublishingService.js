const TelegramBot = require('node-telegram-bot-api');
const SocialAccount = require('../models/SocialAccount');
const SocialPost = require('../models/SocialPost');

// Helper to simulate network latency
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.publishToPlatform = async (postId, user) => {
  const post = await SocialPost.findById(postId);
  if (!post) throw new Error('Post not found');

  post.status = 'publishing';
  await post.save();

  try {
    // Check if user has connected account for this platform (except Telegram if already globally configured)
    const account = await SocialAccount.findOne({ userId: user._id, platform: post.platform });
    
    if (post.platform === 'telegram') {
      const botToken = account?.details?.botToken || user.telegramBotToken;
      const chatId = account?.details?.chatId || user.telegramChatId;

      if (!botToken || !chatId) {
        throw new Error('Telegram bot token or Chat ID is not configured');
      }

      const bot = new TelegramBot(botToken);
      const captionText = post.content.caption || 'New Deal Alert!';
      const mediaUrl = post.content.thumbnailUrl || post.content.videoUrl;

      if (mediaUrl) {
        // Send image/video to Telegram
        await bot.sendPhoto(chatId, mediaUrl, {
          caption: captionText.slice(0, 1024), // Telegram caption limit is 1024 chars
          parse_mode: 'HTML'
        });
      } else {
        await bot.sendMessage(chatId, captionText, { parse_mode: 'HTML' });
      }

      post.status = 'published';
      post.publishedAt = new Date();
      post.postExternalId = 'tg_' + Date.now();
      await post.save();
      return { success: true, url: `https://t.me/c/${chatId.replace('-100', '')}` };
    }

    // For all other platforms, check if account is connected (or simulate it if in simulation mode)
    if (!account && post.platform !== 'telegram') {
      throw new Error(`No connected account found for ${post.platform.toUpperCase()}`);
    }

    if (account && account.status !== 'connected') {
      throw new Error(`Connected account for ${post.platform.toUpperCase()} is expired or disconnected`);
    }

    // Simulate API request delay
    await sleep(1500);

    // Generate simulated URLs based on platform
    let mockUrl = '#';
    const randId = Math.random().toString(36).substring(2, 11);
    
    switch (post.platform) {
      case 'instagram':
        mockUrl = `https://www.instagram.com/p/Cs${randId}/`;
        break;
      case 'twitter':
        mockUrl = `https://x.com/ProductPilotAI/status/${Date.now()}`;
        break;
      case 'pinterest':
        mockUrl = `https://www.pinterest.com/pin/${Date.now()}/`;
        break;
      case 'youtube':
        mockUrl = `https://youtu.be/shorts/${randId}`;
        break;
      case 'facebook':
        mockUrl = `https://facebook.com/ProductPilotAI/posts/${Date.now()}`;
        break;
      case 'whatsapp':
        mockUrl = `https://whatsapp.com/channel/${randId}`;
        break;
    }

    post.status = 'published';
    post.publishedAt = new Date();
    post.postExternalId = `${post.platform}_${randId}`;
    await post.save();

    return { success: true, url: mockUrl };
  } catch (error) {
    post.status = 'failed';
    post.error = error.message;
    await post.save();
    throw error;
  }
};
