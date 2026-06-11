const { Worker, Queue } = require('bullmq');
const { extractProduct } = require('../services/extractionService');
const { uploadBuffer } = require('../config/cloudinary');
const { sendToTelegram } = require('../services/telegramService');
const { upsertDocument } = require('../services/ragService');
const Extraction = require('../models/Extraction');
const User = require('../models/User');
const Product = require('../models/Product');

const url = new URL(process.env.REDIS_URL);
const connection = {
  host: url.hostname,
  port: url.port ? parseInt(url.port) : 6379,
  password: url.password,
  username: url.username,
  tls: url.protocol === 'rediss:' ? {} : undefined
};

const extractionQueue = new Queue('extraction', { connection });

const worker = new Worker('extraction', async (job) => {
  const { extractionId, userId, imageBuffer, filename } = job.data;

  await Extraction.findByIdAndUpdate(extractionId, { status: 'processing' });

  const buffer = Buffer.from(imageBuffer);
  const { url: imageUrl, public_id } = await uploadBuffer(buffer);

  const result = await extractProduct(buffer, filename);

  await Extraction.findByIdAndUpdate(extractionId, {
    status: 'completed',
    imageUrl,
    cloudinaryId: public_id,
    ...result,
  });

  const extraction = await Extraction.findById(extractionId);
  const user = await User.findById(userId);

  // Telegram sending is now handled manually via the API after adding affiliate links.

  const productText = JSON.stringify(Object.fromEntries(
    Object.entries(result.extracted).map(([k, v]) => [k, v?.value])
  ));
  await upsertDocument(extractionId, productText, { userId, platform: result.platform });

  await Product.create({
    userId,
    extractionId,
    productName: result.extracted?.product_name?.value || filename || 'Unknown Product',
    brand: result.extracted?.brand?.value,
    category: result.extracted?.category?.value,
    price: result.extracted?.price?.value,
    discountPrice: result.extracted?.discount_price?.value,
    rating: result.extracted?.rating?.value,
    platform: result.platform,
    imageUrl: imageUrl,
    confidenceScore: result.confidenceScore,
  });

  await User.findByIdAndUpdate(userId, { $inc: { usageThisMonth: 1 } });

}, { connection, concurrency: 3 });

worker.on('failed', async (job, err) => {
  await Extraction.findByIdAndUpdate(job.data.extractionId, {
    status: 'failed',
    error: err.message,
  });
});

module.exports = { extractionQueue };
