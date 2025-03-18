// seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'shreejitsen@astraeusnextgen.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(19);
    const hashedPassword = await bcrypt.hash('DerFuhrer@2025', salt);
    
    // Create new admin
    const admin = new Admin({
      email: 'shreejitsen@astraeusnextgen.com',
      password: hashedPassword
    });
    
    await admin.save();
    console.log('Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();