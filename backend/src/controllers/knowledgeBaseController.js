const KnowledgeBase = require('../models/KnowledgeBase');
const { upsertDocument, deleteDocument } = require('../services/ragService');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

exports.upload = async (req, res) => {
  const file = req.file;
  const name = req.body.name || file.originalname;
  let content = [];
  let type = 'text';

  if (file.mimetype === 'application/json') {
    content = JSON.parse(file.buffer.toString());
    type = 'json';
  } else if (file.mimetype === 'text/csv') {
    content = file.buffer.toString().split('\n').map(l => l.trim()).filter(Boolean);
    type = 'csv';
  } else if (file.mimetype.includes('spreadsheet') || file.originalname.endsWith('.xlsx')) {
    const wb = XLSX.read(file.buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    content = XLSX.utils.sheet_to_json(ws);
    type = 'excel';
  } else {
    content = file.buffer.toString();
    type = 'text';
  }

  const doc = await KnowledgeBase.create({
    userId: req.user._id,
    name,
    type,
    content,
    status: 'pending',
  });

  const texts = Array.isArray(content)
    ? content.map(item => typeof item === 'string' ? item : JSON.stringify(item))
    : [content.toString()];

  const vectorIds = [];
  for (const text of texts.slice(0, 100)) {
    const id = `kb_${doc._id}_${uuidv4()}`;
    await upsertDocument(id, text, { docId: doc._id.toString(), userId: req.user._id.toString() });
    vectorIds.push(id);
  }

  await doc.updateOne({ status: 'indexed', vectorIds, recordCount: texts.length });
  res.status(201).json({ ...doc.toJSON(), status: 'indexed', vectorIds, recordCount: texts.length });
};

exports.list = async (req, res) => {
  const docs = await KnowledgeBase.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(docs);
};

exports.delete = async (req, res) => {
  const doc = await KnowledgeBase.findOne({ _id: req.params.id, userId: req.user._id });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  for (const id of doc.vectorIds || []) await deleteDocument(id);
  await doc.deleteOne();
  res.json({ message: 'Deleted' });
};
