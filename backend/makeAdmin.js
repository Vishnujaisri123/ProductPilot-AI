require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Find all users and make them admin (since it's their personal deployment)
    const result = await User.updateMany({}, { role: 'admin' });
    console.log(`Upgraded ${result.modifiedCount} users to admin.`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

makeAdmin();
