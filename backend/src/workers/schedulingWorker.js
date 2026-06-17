const { Queue, Worker } = require('bullmq');
const SocialPost = require('../models/SocialPost');
const User = require('../models/User');
const { publishToPlatform } = require('../services/socialPublishingService');

const redisUrl = new URL(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const connection = {
  host: redisUrl.hostname,
  port: redisUrl.port ? parseInt(redisUrl.port) : 6379,
  password: redisUrl.password,
  username: redisUrl.username,
  tls: redisUrl.protocol === 'rediss:' ? {} : undefined
};

// Create the Queue
const socialQueue = new Queue('socialScheduling', { connection });

// Create the Worker to process scheduled posts
const socialWorker = new Worker('socialScheduling', async (job) => {
  const { postId, userId } = job.data;
  console.log(`[Scheduler] Processing post ${postId} for user ${userId}`);

  try {
    const post = await SocialPost.findById(postId);
    if (!post) {
      console.error(`[Scheduler] Post ${postId} not found`);
      return;
    }

    if (post.status !== 'scheduled') {
      console.log(`[Scheduler] Post ${postId} is not in scheduled state (current: ${post.status}), skipping`);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Publish the post
    await publishToPlatform(postId, user);
    console.log(`[Scheduler] Successfully published post ${postId}`);
  } catch (error) {
    console.error(`[Scheduler] Failed to publish post ${postId}:`, error.message);
    // Mark post as failed
    await SocialPost.findByIdAndUpdate(postId, {
      status: 'failed',
      error: error.message
    });
  }
}, { connection, concurrency: 2 });

// Run a background simulation to update analytics for published posts
// This adds realism to the dashboard by slowly accumulating impressions and clicks.
const startAnalyticsSimulation = () => {
  setInterval(async () => {
    try {
      const activePosts = await SocialPost.find({ status: 'published' });
      if (!activePosts.length) return;

      for (const post of activePosts) {
        // Only update with 40% probability per interval
        if (Math.random() > 0.4) continue;

        // Generate small realistic increments
        const impressionsInc = Math.floor(Math.random() * 25) + 5;
        const viewsInc = Math.floor(impressionsInc * (0.3 + Math.random() * 0.4)); // 30-70% click/view-through
        const clicksInc = Math.floor(viewsInc * (0.1 + Math.random() * 0.15)); // 10-25% link click rate
        const affiliateClicksInc = Math.floor(clicksInc * (0.7 + Math.random() * 0.3)); // 70-100% affiliate redirection
        const likesInc = Math.floor(viewsInc * (0.05 + Math.random() * 0.1));
        const commentsInc = Math.floor(likesInc * 0.15);
        const sharesInc = Math.floor(likesInc * 0.1);
        const conversionsInc = Math.random() > 0.9 ? 1 : 0; // Rare conversions

        await SocialPost.findByIdAndUpdate(post._id, {
          $inc: {
            'analytics.impressions': impressionsInc,
            'analytics.views': viewsInc,
            'analytics.clicks': clicksInc,
            'analytics.affiliateClicks': affiliateClicksInc,
            'analytics.likes': likesInc,
            'analytics.comments': commentsInc,
            'analytics.shares': sharesInc,
            'analytics.conversions': conversionsInc
          }
        });
      }
    } catch (err) {
      console.error('[Analytics Simulation] Error running update cycle:', err);
    }
  }, 30000); // run every 30 seconds
};

startAnalyticsSimulation();

module.exports = { socialQueue };
