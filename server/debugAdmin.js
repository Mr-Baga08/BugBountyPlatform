// debugAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shreejitsen:yOuY23yEBzXvZo0T@bughuntplatform.nzxh0.mongodb.net/?retryWrites=true&w=majority&appName=BugHuntPlatform";

console.log("==================================================");
console.log("ADMIN DEBUG SCRIPT");
console.log("==================================================");
console.log(`MongoDB URI (first 20 chars): ${MONGO_URI.substring(0, 20)}...`);

(async function() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    // Load Admin model after connecting to avoid schema registration issues
    const Admin = require('./models/Admin');
    
    // Check for existing admins
    console.log("Checking for existing admins...");
    const adminCount = await Admin.countDocuments();
    console.log(`Found ${adminCount} admin(s) in the database`);
    
    if (adminCount > 0) {
      const admins = await Admin.find({}, { email: 1, password: 1 });
      console.log("Existing admins:");
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ID: ${admin._id}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password hash: ${admin.password.substring(0, 20)}...`);
        console.log(`   Password hash length: ${admin.password.length}`);
      });
    }
    
    // Create a new admin
    console.log("\nCreating a new admin...");
    const email = 'shreejitsen@astraeusnextgen.com';
    const password = 'DerFuhrer@2025';
    
    // Check if this admin already exists
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists.`);
      console.log("Updating password...");
      
      // Test original password
      const isOriginalMatch = await bcrypt.compare(password, existingAdmin.password);
      console.log(`Current password match: ${isOriginalMatch}`);
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(`New password hash: ${hashedPassword.substring(0, 20)}...`);
      
      // Update directly to avoid any pre-save hooks
      await Admin.updateOne(
        { _id: existingAdmin._id },
        { $set: { password: hashedPassword } }
      );
      console.log("Password updated successfully");
      
      // Verify update
      const updatedAdmin = await Admin.findById(existingAdmin._id);
      console.log(`Updated hash: ${updatedAdmin.password.substring(0, 20)}...`);
      
      // Test new password
      const isNewMatch = await bcrypt.compare(password, updatedAdmin.password);
      console.log(`New password match: ${isNewMatch}`);
    } else {
      console.log("Creating new admin account...");
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(`Password hash: ${hashedPassword.substring(0, 20)}...`);
      
      // Create admin document
      const newAdmin = new Admin({
        email,
        password: hashedPassword
      });
      
      // Save admin
      const savedAdmin = await newAdmin.save();
      console.log(`Admin created with ID: ${savedAdmin._id}`);
      
      // Verify save
      const isMatch = await bcrypt.compare(password, savedAdmin.password);
      console.log(`Password match verification: ${isMatch}`);
    }
    
    console.log("\n==================================================");
    console.log("LOGIN CREDENTIALS:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("==================================================");
    
  } catch (error) {
    console.error("❌ ERROR:", error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
})();