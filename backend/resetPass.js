require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function resetPass() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.findOne({ email: 'vishnuketa999@gmail.com' });
    if (admin) {
      admin.password = 'AdminPassword123!';
      await admin.save();
      console.log('Password reset successfully to AdminPassword123!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPass();
