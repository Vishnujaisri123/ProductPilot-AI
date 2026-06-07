#!/usr/bin/env node

/**
 * SEED SCRIPT: Create Admin User
 * Run: node backend/seed.js
 *
 * This script creates an admin user for local development and production.
 * After running, you can login with these credentials.
 */

require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const User = require("./src/models/User");

async function seed() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const adminEmail = "admin@productvision.ai";

    console.log(`\n🔍 Checking if admin user exists...`);
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log("⚠️  Admin user already exists.");
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);

      if (admin.role !== "admin") {
        console.log("\n🔄 Updating role to admin...");
        admin.role = "admin";
        await admin.save();
        console.log("✅ Role updated to admin");
      }
    } else {
      console.log("❌ Admin user not found. Creating...\n");

      admin = await User.create({
        name: "Admin",
        email: adminEmail,
        password: "AdminPassword123!",
        role: "admin",
        plan: "enterprise",
        isVerified: true,
      });

      console.log("✅ Admin user created successfully!");
      console.log("\n📋 Admin Credentials:");
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: AdminPassword123!`);
      console.log(`   Role: ${admin.role}`);
    }

    console.log("\n✅ Seed script completed successfully!");
    console.log("\n🚀 Next steps:");
    console.log("   1. Start your backend: npm run dev (from /backend)");
    console.log("   2. Start your frontend: npm run dev (from /frontend)");
    console.log(`   3. Login with: ${adminEmail} / AdminPassword123!`);
    console.log("   4. Upload products and add affiliate links");
    console.log("   5. Products will appear in the public store\n");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Seed script failed:", error.message);
    process.exit(1);
  }
}

seed();
