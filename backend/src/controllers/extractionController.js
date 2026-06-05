const Extraction = require('../models/Extraction');
const { extractionQueue } = require('../workers/extractionWorker');
const { buildJSON } = require('../services/telegramService');
const { Parser } = require('json2csv');
const XLSX = require('xlsx');

exports.uploadAndExtract = async (req, res) => {
  if (!req.user.canProcess()) return res.status(403).json({ message: 'Monthly limit reached. Upgrade your plan.' });

  const extraction = await Extraction.create({
    userId: req.user._id,
    sourceImageName: req.file.originalname,
    status: 'pending',
  });

  const job = await extractionQueue.add('extract', {
    extractionId: extraction._id.toString(),
    userId: req.user._id.toString(),
    imageBuffer: Array.from(req.file.buffer),
    filename: req.file.originalname,
  });

  await Extraction.findByIdAndUpdate(extraction._id, { jobId: job.id });
  res.status(202).json({ extractionId: extraction._id, jobId: job.id, status: 'pending' });
};

exports.batchUpload = async (req, res) => {
  const files = req.files;
  if (!files?.length) return res.status(400).json({ message: 'No files uploaded' });

  const results = await Promise.all(files.map(async (file) => {
    if (!req.user.canProcess()) return { error: 'Limit reached', file: file.originalname };
    const extraction = await Extraction.create({
      userId: req.user._id,
      sourceImageName: file.originalname,
      status: 'pending',
    });
    const job = await extractionQueue.add('extract', {
      extractionId: extraction._id.toString(),
      userId: req.user._id.toString(),
      imageBuffer: Array.from(file.buffer),
      filename: file.originalname,
    });
    await Extraction.findByIdAndUpdate(extraction._id, { jobId: job.id });
    return { extractionId: extraction._id, jobId: job.id, filename: file.originalname };
  }));

  res.status(202).json({ results });
};

exports.getStatus = async (req, res) => {
  const extraction = await Extraction.findOne({ _id: req.params.id, userId: req.user._id });
  if (!extraction) return res.status(404).json({ message: 'Not found' });
  res.json(extraction);
};

exports.getHistory = async (req, res) => {
  const { page = 1, limit = 20, platform, search, status } = req.query;
  const query = { userId: req.user._id };
  if (platform) query.platform = platform;
  if (status) query.status = status;
  if (search) query['extracted.product_name.value'] = { $regex: search, $options: 'i' };

  const Product = require('../models/Product');
  const [extractions, total] = await Promise.all([
    Extraction.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit).lean(),
    Extraction.countDocuments(query),
  ]);

  for (const ext of extractions) {
    if (ext.status === 'completed') {
      const prod = await Product.findOne({ extractionId: ext._id }).select('_id');
      if (prod) ext.productId = prod._id;
    }
  }

  res.json({ extractions, total, page: +page, pages: Math.ceil(total / limit) });
};

exports.exportJSON = async (req, res) => {
  const extraction = await Extraction.findOne({ _id: req.params.id, userId: req.user._id });
  if (!extraction) return res.status(404).json({ message: 'Not found' });
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${extraction._id}.json"`);
  res.json(buildJSON(extraction));
};

exports.exportCSV = async (req, res) => {
  const extractions = await Extraction.find({ userId: req.user._id, status: 'completed' });
  const data = extractions.map(e => {
    const val = (f) => e.extracted?.[f]?.value ?? '';
    return {
      product_name: val('product_name'), brand: val('brand'), price: val('price'),
      rating: val('rating'), platform: e.platform, confidence: e.confidenceScore,
      created: e.createdAt,
    };
  });
  const parser = new Parser();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="extractions.csv"');
  res.send(parser.parse(data));
};

exports.exportExcel = async (req, res) => {
  const extractions = await Extraction.find({ userId: req.user._id, status: 'completed' });
  const data = extractions.map(e => {
    const val = (f) => e.extracted?.[f]?.value ?? '';
    return {
      'Product Name': val('product_name'), 'Brand': val('brand'), 'Price': val('price'),
      'Rating': val('rating'), 'Platform': e.platform, 'Confidence': e.confidenceScore,
      'Date': e.createdAt?.toISOString(),
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Extractions');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="extractions.xlsx"');
  res.send(buf);
};

const { sendToTelegram } = require('../services/telegramService');
const { appendAmazonTag } = require('../utils/affiliateLinker');

exports.updateAffiliate = async (req, res) => {
  let { manualProductUrl, affiliateUrl } = req.body;
  
  if (manualProductUrl && !affiliateUrl && req.user.amazonAssociateTag) {
    affiliateUrl = appendAmazonTag(manualProductUrl, req.user.amazonAssociateTag);
  }

  const extraction = await Extraction.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { manualProductUrl, affiliateUrl },
    { new: true }
  );
  if (!extraction) return res.status(404).json({ message: 'Not found' });
  res.json(extraction);
};

exports.sendTelegramManual = async (req, res) => {
  const extraction = await Extraction.findOne({ _id: req.params.id, userId: req.user._id });
  if (!extraction) return res.status(404).json({ message: 'Not found' });
  const user = req.user;
  
  if (!user.telegramBotToken || !user.telegramChatId) {
    return res.status(400).json({ message: 'Telegram not configured' });
  }
  
  try {
    await sendToTelegram(user.telegramBotToken, user.telegramChatId, extraction, extraction.imageUrl);
    extraction.telegramSent = true;
    extraction.telegramSentAt = new Date();
    await extraction.save();
    res.json({ success: true, extraction });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send to Telegram', error: err.message });
  }
};
