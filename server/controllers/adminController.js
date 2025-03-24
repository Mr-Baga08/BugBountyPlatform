const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const connectDB = require("../config/db");


const SALT_ROUNDS = 10;

// ✅ Admin Login
const loginAdmin = async (req, res) => {
    console.log("loginAdmin called with:", req.body);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log(`Admin not found: ${email}`);
            return res.status(404).json({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        console.log(`Password match result: ${isMatch}`);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            token,
            user: { email: admin.email, role: "admin" }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Create Admin (Registration)
const createAdmin = async (req, res) => {
    try {
        await connectDB(); // Ensure DB connection

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        console.log(`New hashed password: ${hashedPassword}`);

        const newAdmin = new Admin({ email, password: hashedPassword });
        await newAdmin.save();

        res.status(201).json({ message: "Admin created successfully" });

    } catch (error) {
        console.error("Admin creation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { loginAdmin, createAdmin };
