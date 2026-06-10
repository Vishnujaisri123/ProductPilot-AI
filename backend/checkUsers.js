require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const users = await User.find({});
    console.log('--- USERS ---');
    users.forEach(u => {
      console.log(`Email: ${u.email} | Role: ${u.role} | HasPassword: ${!!u.password}`);
    });
    console.log('-------------');
    
    // Also delete any user that is not vishnuketa999@gmail.com
    const result = await User.deleteMany({ email: { $ne: 'vishnuketa999@gmail.com' } });
    console.log(`Deleted ${result.deletedCount} unnecessary users.`);
    
    // Ensure vishnuketa999@gmail.com is admin
    const admin = await User.findOne({ email: 'vishnuketa999@gmail.com' });
    if (admin) {
      admin.role = 'admin';
      await admin.save();
      console.log('Ensured vishnuketa999 is admin');
    } else {
      console.log('vishnuketa999@gmail.com NOT FOUND IN DB!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
