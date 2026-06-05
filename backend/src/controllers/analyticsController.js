const Extraction = require('../models/Extraction');
const Product = require('../models/Product');

exports.getAnalytics = async (req, res) => {
  const userId = req.user._id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, completed, failed, telegramSent, avgConfidence, platformDist, dailyActivity, totalProducts, productsWithAffiliate, productsSent, pendingProducts] = await Promise.all([
    Extraction.countDocuments({ userId }),
    Extraction.countDocuments({ userId, status: 'completed' }),
    Extraction.countDocuments({ userId, status: 'failed' }),
    Extraction.countDocuments({ userId, telegramSent: true }),
    Extraction.aggregate([
      { $match: { userId, status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$confidenceScore' } } },
    ]),
    Extraction.aggregate([
      { $match: { userId, status: 'completed' } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ]),
    Extraction.aggregate([
      { $match: { userId, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Product.countDocuments({ userId }),
    Product.countDocuments({ userId, affiliateLink: { $exists: true, $ne: null, $ne: '' } }),
    Product.countDocuments({ userId, status: 'Sent' }),
    Product.countDocuments({ userId, status: { $ne: 'Sent' } }),
  ]);

  res.json({
    totals: {
      uploads: total,
      completed,
      failed,
      successRate: total ? Math.round((completed / total) * 100) : 0,
      telegramDeliveries: telegramSent,
      avgConfidence: Math.round(avgConfidence[0]?.avg || 0),
    },
    products: {
      total: totalProducts,
      withAffiliate: productsWithAffiliate,
      sent: productsSent,
      pending: pendingProducts,
    },
    platformDistribution: platformDist,
    dailyActivity,
  });
};
