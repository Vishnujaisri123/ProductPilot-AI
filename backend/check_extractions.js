require('dotenv').config();
const mongoose = require('mongoose');
const Extraction = require('./src/models/Extraction');

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected. Querying extractions...");
    const extractions = await Extraction.find().sort({ createdAt: -1 }).limit(10);
    console.log(`Found ${extractions.length} extractions:`);
    extractions.forEach(e => {
      console.log(`- ID: ${e._id}`);
      console.log(`  Status: ${e.status}`);
      console.log(`  Error: ${e.error}`);
      console.log(`  Created: ${e.createdAt}`);
      console.log(`  Cloudinary URL: ${e.imageUrl}`);
      console.log(`  Platform: ${e.platform}`);
      console.log(`----------------------------------------`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

run();
