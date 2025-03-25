// server/controllers/adminController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const connectDB = require("../config/db");

// Admin Login
const loginAdmin = async (req, res) => {
    console.log("Admin login attempt:", req.body.email);
    
    try {
        // Ensure DB connection
        await connectDB();
        
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        // Find admin by email
        const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
        if (!admin) {
            console.log(`Admin not found with email: ${email}`);
            return res.status(404).json({ message: "Admin not found" });
        }
        
        console.log(`Admin found with ID: ${admin._id}`);
        
        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log(`Password match result: ${isMatch}`);
        
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        // Create token
        const token = jwt.sign(
            { id: admin._id, role: "admin" },
            process.env.JWT_SECRET || "33d1144d442c289b2297b674e46e81528139d41820ec93899b97e8349a0a414f",
            { expiresIn: "24h" }
        );
        
        // Successful login
        res.status(200).json({
            token,
            user: { 
                email: admin.email, 
                role: "admin",
                username: "Admin"
            }
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ 
            message: "Internal server error",
            details: error.message 
        });
    }
};

// Create Admin
const createAdmin = async (req, res) => {
    console.log("Admin registration attempt:", req.body.email);
    
    try {
        await connectDB();
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        // Check for existing admin
        const existingAdmin = await Admin.findOne({ email: email.trim().toLowerCase() });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully");
        
        // Create new admin
        const admin = new Admin({
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });
        
        const savedAdmin = await admin.save();
        console.log(`Admin created with ID: ${savedAdmin._id}`);
        
        res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
        console.error("Admin creation error:", error);
        res.status(500).json({ 
            message: "Failed to create admin",
            details: error.message 
        });
    }
};

// Make sure to export the functions
module.exports = { loginAdmin, createAdmin };