const mongoose = require('mongoose');
require('./src/models/Product');
require('./src/models/Extraction');

async function run() {
  await mongoose.connect('mongodb+srv://Vishnu999:Vishnu123@cluster0.h746v.mongodb.net/productpilot?retryWrites=true&w=majority');
  const Product = mongoose.model('Product');
  const p = await Product.findOne({ productName: /HART X2/ }).populate('extractionId');
  console.log(JSON.stringify(p, null, 2));
  process.exit(0);
}

run();
