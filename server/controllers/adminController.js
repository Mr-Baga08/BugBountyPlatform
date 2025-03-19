// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Admin = require("../models/Admin");

// // ✅ Admin Login
// const loginAdmin = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const admin = await Admin.findOne({ email });
//         if (!admin) return res.status(404).json({ message: "Admin not found" });

//         // const isMatch = await bcrypt.compare(password, admin.password);
//         // if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//         const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

//         res.status(200).json({ token, admin: { email: admin.email, role: "admin" } });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // ✅ Create Admin (Protected Route)
// const createAdmin = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const existingAdmin = await Admin.findOne({ email });
//         if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

//         const hashedPassword = await bcrypt.hash(password, 10); // Hash password before saving
//         const newAdmin = new Admin({ email, password: hashedPassword });

//         await newAdmin.save();

//         res.status(201).json({ message: "Admin created successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = { loginAdmin, createAdmin };
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const connectDB = require("../config/db");

// ✅ Admin Login
const loginAdmin = async (req, res) => {
    // Ensure DB connection first
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database connection error in loginAdmin:", dbError);
        return res.status(500).json({ message: "Database connection error. Please try again later." });
    }

    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ 
            token, 
            user: { 
                email: admin.email, 
                role: "admin",
                username: "Administrator" // Add username for consistency with user login
            } 
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ Create Admin (Protected Route)
const createAdmin = async (req, res) => {
    // Ensure DB connection first
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database connection error in createAdmin:", dbError);
        return res.status(500).json({ message: "Database connection error. Please try again later." });
    }

    const { email, password } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

        const hashedPassword = await bcrypt.hash(password, 19); // Hash password before saving
        const newAdmin = new Admin({ email, password: hashedPassword });

        await newAdmin.save();

        res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
        console.error("Admin creation error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginAdmin, createAdmin };
